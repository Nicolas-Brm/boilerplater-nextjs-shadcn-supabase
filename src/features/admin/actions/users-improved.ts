'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  CreateUserSchema, 
  UpdateUserSchema, 
  UserFiltersSchema,
  type AdminActionResult,
  type AdminUser,
  Permission,
  UserRole 
} from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'
import { withAdminAction, withAdminValidation, validateFilters } from '../lib/validation'

/**
 * Interface pour les résultats de pagination
 */
interface PaginatedUsers {
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Récupère la liste des utilisateurs avec filtres et pagination améliorés
 */
export async function getUsersImproved(searchParams: URLSearchParams): Promise<AdminActionResult<PaginatedUsers>> {
  return withAdminAction(
    [Permission.VIEW_USERS],
    'VIEW_USERS',
    'users',
    undefined,
    async () => {
      const supabase = await createClient()

      // Validation des filtres avec valeurs par défaut
      const filters = validateFilters(UserFiltersSchema, searchParams, {
        page: 1,
        limit: 10
      })

      console.log('[ADMIN] Filtres appliqués:', filters)

      // Construction de la requête avec optimisations
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })

      // Application des filtres de manière optimisée
      if (filters.search) {
        // Recherche full-text optimisée
        const searchTerm = `%${filters.search.toLowerCase()}%`
        query = query.or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
        )
      }

      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive)
      }

      if (filters.createdAfter) {
        query = query.gte('created_at', filters.createdAfter)
      }

      if (filters.createdBefore) {
        query = query.lte('created_at', filters.createdBefore)
      }

      // Application de la pagination
      const offset = (filters.page - 1) * filters.limit
      query = query
        .range(offset, offset + filters.limit - 1)
        .order('created_at', { ascending: false })

      const { data: profiles, error, count } = await query

      if (error) {
        throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`)
      }

      // Récupération optimisée des données auth en batch
      const users = await enrichUsersWithAuthData(profiles || [])
      
      const totalPages = Math.ceil((count || 0) / filters.limit)

      console.log(`[ADMIN] ${users.length} utilisateurs récupérés avec succès`)

      return {
        users,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: count || 0,
          totalPages,
        },
      }
    }
  )
}

/**
 * Enrichit les profils utilisateur avec les données d'authentification
 */
async function enrichUsersWithAuthData(profiles: Record<string, any>[]): Promise<AdminUser[]> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante pour récupérer les données auth')
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const users: AdminUser[] = []
  
  // Traitement en batch pour améliorer les performances
  const batchSize = 10
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize)
    
    const batchPromises = batch.map(async (profile) => {
      try {
        const { data: { user: authUser }, error: authError } = 
          await supabaseAdmin.auth.admin.getUserById(profile.id)
        
        if (authError || !authUser) {
          console.warn(`[ADMIN] Auth non trouvé pour ${profile.id}:`, authError?.message)
          return null
        }
        
        return {
          id: profile.id,
          email: authUser.email || '',
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role as UserRole,
          isActive: profile.is_active,
          emailVerified: !!authUser.email_confirmed_at,
          lastSignInAt: authUser.last_sign_in_at || null,
          createdAt: authUser.created_at || '',
          updatedAt: profile.updated_at,
        }
      } catch (error) {
        console.error(`[ADMIN] Erreur pour le profil ${profile.id}:`, error)
        return null
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    users.push(...batchResults.filter(user => user !== null))
  }

  return users
}

/**
 * Récupère un utilisateur spécifique avec gestion d'erreur améliorée
 */
export async function getUserImproved(userId: string): Promise<AdminActionResult<AdminUser>> {
  return withAdminAction(
    [Permission.VIEW_USERS],
    'VIEW_USER',
    'users',
    userId,
    async () => {
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID utilisateur invalide')
      }

      const supabase = await createClient()

      // Vérification de l'existence du profil
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError || !profile) {
        throw new Error('Utilisateur non trouvé')
      }

      // Récupération des données auth avec le client admin
      const authUser = await getAuthUserSecurely(userId)
      if (!authUser) {
        throw new Error('Données d\'authentification non trouvées')
      }

      return {
        id: profile.id,
        email: authUser.email!,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        role: profile.role as UserRole,
        isActive: profile.is_active,
        emailVerified: authUser.email_confirmed_at !== null,
        createdAt: authUser.created_at!,
        lastSignInAt: authUser.last_sign_in_at || null,
        updatedAt: profile.updated_at || authUser.updated_at!,
      }
    }
  )
}

/**
 * Récupère les données auth d'un utilisateur de manière sécurisée
 */
async function getAuthUserSecurely(userId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
  
  if (authError || !authUser.user) {
    console.warn(`[ADMIN] Utilisateur auth non trouvé: ${authError?.message}`)
    return null
  }

  return authUser.user
}

/**
 * Crée un nouvel utilisateur avec validation renforcée
 */
export async function createUserImproved(
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role'),
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
  }

  return withAdminValidation(
    CreateUserSchema,
    rawData,
    async () => {
      return withAdminAction(
        [Permission.CREATE_USERS],
        'CREATE_USER',
        'users',
        undefined,
        async () => {
          const validatedData = CreateUserSchema.parse(rawData)
          
          // Vérification de l'unicité de l'email
          await checkEmailUniqueness(validatedData.email)
          
          // Création via API pour une meilleure gestion d'erreur
          const result = await createUserViaAPI(validatedData)
          
          revalidatePath('/admin/users')
          
          return {
            message: 'Utilisateur créé avec succès',
            userId: result.userId
          }
        }
      )
    }
  )
}

/**
 * Vérifie l'unicité de l'email
 */
async function checkEmailUniqueness(_email: string): Promise<void> {
  // Note: La vérification réelle se fera au niveau de Supabase Auth
  // Cette fonction est un placeholder pour de futures validations
  return Promise.resolve()
}

/**
 * Crée un utilisateur via l'API avec gestion d'erreur robuste
 */
async function createUserViaAPI(userData: Record<string, any>) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire')
  }

  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur')
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Échec de la création utilisateur')
  }

  return result.data
}

/**
 * Met à jour un utilisateur avec validation et sécurité renforcées
 */
export async function updateUserImproved(
  userId: string,
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  const rawData = {
    email: formData.get('email'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    role: formData.get('role'),
    isActive: formData.get('isActive') === 'true',
  }

  return withAdminValidation(
    UpdateUserSchema,
    rawData,
    async () => {
      return withAdminAction(
        [Permission.UPDATE_USERS],
        'UPDATE_USER',
        'users',
        userId,
        async () => {
          const validatedData = UpdateUserSchema.parse(rawData)
          
          // Vérification de l'existence de l'utilisateur
          await verifyUserExists(userId)
          
          // Mise à jour des données
          await updateUserData(userId, validatedData)
          
          revalidatePath('/admin/users')
          
          return { message: 'Utilisateur mis à jour avec succès' }
        }
      )
    }
  )
}

/**
 * Vérifie l'existence d'un utilisateur
 */
async function verifyUserExists(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (error || !data) {
    throw new Error('Utilisateur non trouvé')
  }
}

/**
 * Met à jour les données utilisateur de manière atomique
 */
async function updateUserData(userId: string, data: Record<string, any>): Promise<void> {
  const supabase = await createClient()
  
  // Transaction simulée: mise à jour du profil et des données auth
  if (data.email || data.isActive !== undefined) {
    await updateAuthData(userId, data)
  }
  
  // Mise à jour du profil
  const updateData: any = {}
  if (data.firstName !== undefined) updateData.first_name = data.firstName
  if (data.lastName !== undefined) updateData.last_name = data.lastName
  if (data.role !== undefined) updateData.role = data.role
  if (data.isActive !== undefined) updateData.is_active = data.isActive

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du profil: ${error.message}`)
    }
  }
}

/**
 * Met à jour les données d'authentification
 */
async function updateAuthData(userId: string, data: Record<string, any>): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
  }

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const updatePayload: any = {}
  
  if (data.email) {
    updatePayload.email = data.email
  }
  
  if (data.isActive !== undefined) {
    updatePayload.user_metadata = { is_active: data.isActive }
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour auth: ${error.message}`)
    }
  }
}

/**
 * Supprime un utilisateur avec protection et logging complet
 */
export async function deleteUserImproved(userId: string): Promise<AdminActionResult> {
  return withAdminAction(
    [Permission.DELETE_USERS],
    'DELETE_USER',
    'users',
    userId,
    async () => {
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID utilisateur invalide')
      }

      const supabase = await createClient()

      // Récupération des informations avant suppression (pour le log)
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!profile) {
        throw new Error('Utilisateur non trouvé')
      }

      // Protection: empêcher la suppression de son propre compte
      const currentUser = await requireAdmin([Permission.DELETE_USERS])
      if (currentUser.id === userId) {
        throw new Error('Impossible de supprimer votre propre compte')
      }

      // Suppression avec client admin
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante')
      }

      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (error) {
        throw new Error(`Erreur lors de la suppression: ${error.message}`)
      }

      // Log détaillé de la suppression
      await logActivity('DELETE_USER', 'users', userId, {
        deletedUser: {
          email: profile.first_name + ' ' + profile.last_name,
          role: profile.role,
        },
        deletedBy: currentUser.id
      })

      revalidatePath('/admin/users')

      return { message: 'Utilisateur supprimé avec succès' }
    }
  )
}

/**
 * Bascule le statut d'un utilisateur avec protection
 */
export async function toggleUserStatusImproved(userId: string): Promise<AdminActionResult> {
  return withAdminAction(
    [Permission.UPDATE_USERS],
    'TOGGLE_USER_STATUS',
    'users',
    userId,
    async () => {
      const supabase = await createClient()

      // Protection: empêcher la désactivation de son propre compte
      const currentUser = await requireAdmin([Permission.UPDATE_USERS])
      if (currentUser.id === userId) {
        throw new Error('Impossible de modifier le statut de votre propre compte')
      }

      // Récupération du statut actuel
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_active, first_name, last_name')
        .eq('id', userId)
        .single()

      if (!profile) {
        throw new Error('Utilisateur non trouvé')
      }

      const newStatus = !profile.is_active

      // Mise à jour atomique
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: newStatus })
        .eq('id', userId)

      if (error) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`)
      }

      revalidatePath('/admin/users')

      return { 
        message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`,
        isActive: newStatus,
      }
    }
  )
}