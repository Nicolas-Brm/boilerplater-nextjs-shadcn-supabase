'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  CreateUserSchema, 
  UpdateUserSchema, 
  UserFiltersSchema,
  AdminActionResult,
  AdminUser,
  Permission,
  UserRole,
  UserFiltersData
} from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'

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
 * Récupère la liste des utilisateurs avec filtres optimisés
 */
export async function getUsers(searchParams: URLSearchParams): Promise<AdminActionResult<PaginatedUsers>> {
  try {
    // Vérifier les permissions
    await requireAdmin([Permission.VIEW_USERS])

    const supabase = await createClient()

    // Valider les filtres
    const filters = parseUserFilters(searchParams)

    // Construction de la requête optimisée
    let profileQuery = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // Application des filtres
    profileQuery = applyUserFilters(profileQuery, filters)

    // Pagination
    const offset = (filters.page - 1) * filters.limit
    profileQuery = profileQuery
      .range(offset, offset + filters.limit - 1)
      .order('created_at', { ascending: false })

    const { data: profiles, error, count } = await profileQuery

    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`)
    }

    // Enrichir avec les données auth en batch
    const users = await enrichWithAuthData(profiles || [])
    
    const totalPages = Math.ceil((count || 0) / filters.limit)

    await logActivity('VIEW_USERS', 'users', undefined, { 
      filters: { ...filters, total: count } 
    })

    return {
      success: true,
      data: {
        users,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: count || 0,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des utilisateurs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère un utilisateur spécifique
 */
export async function getUser(userId: string): Promise<AdminActionResult<AdminUser>> {
  try {
    await requireAdmin([Permission.VIEW_USERS])

    if (!userId) {
      throw new Error('ID utilisateur manquant')
    }

    const supabase = await createClient()

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error('Utilisateur non trouvé')
    }

    // Enrichir avec les données auth
    const users = await enrichWithAuthData([profile])
    
    if (users.length === 0) {
      throw new Error('Données d\'authentification non trouvées')
    }

    await logActivity('VIEW_USER', 'users', userId)

    return {
      success: true,
      data: users[0],
    }
  } catch (error) {
    console.error(`[ADMIN] Erreur lors de la récupération de l'utilisateur ${userId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    await requireAdmin([Permission.CREATE_USERS])

    // Validation des données
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role'),
      isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
    }

    const validatedData = CreateUserSchema.parse(rawData)

    // Vérifier la configuration
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire')
    }

    // Création via API admin
    const result = await createUserWithAdmin(validatedData)

    await logActivity('CREATE_USER', 'users', result.userId, {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: validatedData.role,
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: 'Utilisateur créé avec succès', userId: result.userId },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la création de l\'utilisateur:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('email')) {
        return {
          success: false,
          errors: { email: ['Cet email est déjà utilisé'] }
        }
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création',
    }
  }
}

/**
 * Met à jour un utilisateur
 */
export async function updateUser(
  userId: string,
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    await requireAdmin([Permission.UPDATE_USERS])

    const rawData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role'),
      isActive: formData.get('isActive') === 'true',
    }

    const validatedData = UpdateUserSchema.parse(rawData)

    // Vérifier l'existence
    await verifyUserExists(userId)

    // Mise à jour
    await updateUserData(userId, validatedData)

    await logActivity('UPDATE_USER', 'users', userId, {
      updatedFields: Object.keys(validatedData).filter(key => validatedData[key as keyof typeof validatedData] !== undefined)
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: 'Utilisateur mis à jour avec succès' },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la mise à jour:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Supprime un utilisateur
 */
export async function deleteUser(userId: string): Promise<AdminActionResult> {
  try {
    const currentUser = await requireAdmin([Permission.DELETE_USERS])

    if (!userId) {
      throw new Error('ID utilisateur manquant')
    }

    // Protection: empêcher l'auto-suppression
    if (currentUser.id === userId) {
      throw new Error('Impossible de supprimer votre propre compte')
    }

    const supabase = await createClient()

    // Récupérer les infos avant suppression
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new Error('Utilisateur non trouvé')
    }

    // Suppression avec client admin
    await deleteUserWithAdmin(userId)

    await logActivity('DELETE_USER', 'users', userId, {
      deletedUser: {
        email: profile.first_name + ' ' + profile.last_name,
        role: profile.role,
      },
      deletedBy: currentUser.id
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: 'Utilisateur supprimé avec succès' },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la suppression:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

// Fonctions utilitaires
function parseUserFilters(searchParams: URLSearchParams): UserFiltersData {
  const params: Record<string, any> = {}
  
  for (const [key, value] of searchParams.entries()) {
    // Skip "all" values as they mean no filter
    if (value === 'all' || value === '') {
      continue
    }
    
    if (value === 'true' || value === 'false') {
      params[key] = value === 'true'
    } else if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value)
    } else if (value !== '') {
      params[key] = value
    }
  }

  return UserFiltersSchema.parse(params)
}

function applyUserFilters(query: any, filters: UserFiltersData) {
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
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

  return query
}

async function enrichWithAuthData(profiles: any[]): Promise<AdminUser[]> {
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

  const users: AdminUser[] = []
  
  // Traitement en batch
  for (const profile of profiles) {
    try {
      const { data: { user: authUser }, error } = 
        await supabaseAdmin.auth.admin.getUserById(profile.id)
      
      if (error || !authUser) {
        console.warn(`[ADMIN] Auth non trouvé pour ${profile.id}`)
        continue
      }
      
      users.push({
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
      })
    } catch (error) {
      console.error(`[ADMIN] Erreur pour le profil ${profile.id}:`, error)
    }
  }

  return users
}

async function createUserWithAdmin(userData: any) {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStore.toString(),
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Erreur lors de la création')
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error || 'Échec de la création')
  }

  return result.data
}

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

async function updateUserData(userId: string, data: any): Promise<void> {
  const supabase = await createClient()
  
  // Mise à jour auth si nécessaire
  if (data.email || data.isActive !== undefined) {
    await updateAuthData(userId, data)
  }
  
  // Mise à jour profil
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

async function updateAuthData(userId: string, data: any): Promise<void> {
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

async function deleteUserWithAdmin(userId: string): Promise<void> {
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
}