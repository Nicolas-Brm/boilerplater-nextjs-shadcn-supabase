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

export async function getUsers(searchParams: URLSearchParams): Promise<AdminActionResult<{
  users: AdminUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}>> {
  try {
    console.log('🔍 [getUsers] Début de la récupération des utilisateurs')
    
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_USERS])
    console.log('✅ [getUsers] Permissions admin validées')

    const supabase = await createClient()

    // Vérifier qu'on a la clé service role pour récupérer les infos auth
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ [getUsers] Service role key manquante')
      return {
        success: false,
        error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire pour récupérer les utilisateurs',
      }
    }

    // Client Supabase avec service_role pour les opérations admin
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

    // Valider et parser les paramètres de filtrage
    const filters = UserFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      createdAfter: searchParams.get('createdAfter') || undefined,
      createdBefore: searchParams.get('createdBefore') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '10', 10),
    })

    console.log('🔍 [getUsers] Filtres appliqués:', filters)

    // Construire la requête de base
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })

    // Appliquer les filtres
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
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

    // Appliquer la pagination
    const offset = (filters.page - 1) * filters.limit
    query = query
      .range(offset, offset + filters.limit - 1)
      .order('created_at', { ascending: false })

    console.log('🔍 [getUsers] Exécution de la requête...')
    const { data: profiles, error, count } = await query

    console.log('🔍 [getUsers] Résultat de la requête:', {
      profilesCount: profiles?.length || 0,
      totalCount: count,
      error: error?.message
    })

    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`)
    }

    // Récupérer les informations auth pour chaque utilisateur
    const users: AdminUser[] = []
    
    console.log('🔍 [getUsers] Récupération des infos auth pour chaque profil...')
    for (const profile of profiles || []) {
      console.log(`  - Profil ${profile.id}: ${profile.first_name} ${profile.last_name} (${profile.role})`)
      
      // Récupérer l'utilisateur auth avec le client admin
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(profile.id)
      
      if (authError) {
        console.log(`  ❌ Erreur auth pour ${profile.id}:`, authError.message)
        continue
      }
      
      if (authUser) {
        console.log(`  ✅ Auth trouvé pour ${profile.id}: ${authUser.email}`)
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
      } else {
        console.log(`  ❌ Aucun auth trouvé pour ${profile.id}`)
      }
    }

    const totalPages = Math.ceil((count || 0) / filters.limit)

    console.log(`✅ [getUsers] ${users.length} utilisateurs récupérés avec succès`)

    await logActivity('VIEW_USERS', 'users', undefined, { filters })

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
    console.error('❌ [getUsers] Erreur lors de la récupération des utilisateurs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function getUser(userId: string): Promise<AdminActionResult<AdminUser>> {
  try {
    console.log(`🔍 [getUser] Récupération de l'utilisateur ${userId}`)
    
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_USERS])
    console.log('✅ [getUser] Permissions admin validées')

    const supabase = await createClient()

    // Vérifier qu'on a la clé service role
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ [getUser] Service role key manquante')
      return {
        success: false,
        error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire',
      }
    }

    // Client Supabase avec service_role
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

    // Récupérer l'utilisateur auth avec ses métadonnées
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !authUser.user) {
      console.log(`❌ [getUser] Utilisateur auth non trouvé: ${authError?.message}`)
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      }
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.log(`❌ [getUser] Erreur lors de la récupération du profil: ${profileError.message}`)
      return {
        success: false,
        error: 'Erreur lors de la récupération du profil utilisateur',
      }
    }

    // Formater les données utilisateur
    const user: AdminUser = {
      id: authUser.user.id,
      email: authUser.user.email!,
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      role: (profile?.role as UserRole) || UserRole.USER,
      isActive: profile?.is_active ?? true,
      emailVerified: authUser.user.email_confirmed_at !== null,
      createdAt: authUser.user.created_at!,
      lastSignInAt: authUser.user.last_sign_in_at || null,
      updatedAt: profile?.updated_at || authUser.user.updated_at!,
    }

    console.log(`✅ [getUser] Utilisateur ${userId} récupéré avec succès`)

    await logActivity('VIEW_USER', 'users', userId)

    return {
      success: true,
      data: user,
    }
  } catch (error) {
    console.error(`❌ [getUser] Erreur lors de la récupération de l'utilisateur ${userId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function createUser(
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.CREATE_USERS])

    // Valider les données
    const validatedFields = CreateUserSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role'),
      isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password, firstName, lastName, role, isActive } = validatedFields.data

    // Vérifier que nous avons la clé service role configurée
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: 'La création d\'utilisateur nécessite la configuration de SUPABASE_SERVICE_ROLE_KEY dans les variables d\'environnement.',
      }
    }

    // Récupérer les cookies pour les transmettre à l'API
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()

    // Appeler l'API route pour créer l'utilisateur
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Transmettre les cookies
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role,
        isActive,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Erreur lors de la création de l\'utilisateur',
      }
    }

    await logActivity('CREATE_USER', 'users', result.data?.userId, {
      email,
      firstName,
      lastName,
      role,
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: result.data?.message || 'Utilisateur créé avec succès' },
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création',
    }
  }
}

export async function updateUser(
  userId: string,
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.UPDATE_USERS])

    // Valider les données
    const validatedFields = UpdateUserSchema.safeParse({
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      role: formData.get('role'),
      isActive: formData.get('isActive') === 'true',
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, firstName, lastName, role, isActive } = validatedFields.data

    // Vérifier que nous avons la clé service role configurée
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        success: false,
        error: 'La mise à jour d\'utilisateur nécessite la configuration de SUPABASE_SERVICE_ROLE_KEY dans les variables d\'environnement.',
      }
    }

    const supabase = await createClient()

    // Client Supabase avec service_role pour les opérations admin
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

    // Mettre à jour l'email dans auth si fourni
    if (email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email,
      })

      if (authError) {
        throw new Error(`Erreur lors de la mise à jour de l'email: ${authError.message}`)
      }
    }

    // Mettre à jour le statut actif dans auth si fourni
    if (isActive !== undefined) {
      if (!isActive) {
        // Si l'utilisateur est désactivé, on le suspend
        const { error: authStatusError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { ...{}, is_active: false }
        })

        if (authStatusError) {
          throw new Error(`Erreur lors de la mise à jour du statut: ${authStatusError.message}`)
        }
      } else {
        // Si l'utilisateur est réactivé, on met à jour ses métadonnées
        const { error: authStatusError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { ...{}, is_active: true }
        })

        if (authStatusError) {
          throw new Error(`Erreur lors de la mise à jour du statut: ${authStatusError.message}`)
        }
      }
    }

    // Mettre à jour le profil utilisateur
    const updateData: any = {}
    if (firstName !== undefined) updateData.first_name = firstName
    if (lastName !== undefined) updateData.last_name = lastName
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.is_active = isActive

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Erreur lors de la mise à jour du profil: ${profileError.message}`)
    }

    await logActivity('UPDATE_USER', 'users', userId, {
      updatedFields: Object.keys(updateData),
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: 'Utilisateur mis à jour avec succès' },
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour',
    }
  }
}

export async function deleteUser(userId: string): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.DELETE_USERS])

    const supabase = await createClient()

    // Vérifier que l'utilisateur existe
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      }
    }

    // Supprimer l'utilisateur (auth + profil via CASCADE)
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    await logActivity('DELETE_USER', 'users', userId, {
      deletedUser: {
        email: profile.first_name + ' ' + profile.last_name,
        role: profile.role,
      },
    })

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { message: 'Utilisateur supprimé avec succès' },
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression',
    }
  }
}

export async function toggleUserStatus(userId: string): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.UPDATE_USERS])

    const supabase = await createClient()

    // Récupérer le statut actuel
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (!profile) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
      }
    }

    const newStatus = !profile.is_active

    // Mettre à jour le statut
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: newStatus })
      .eq('id', userId)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`)
    }

    await logActivity(
      newStatus ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      'users',
      userId,
      { newStatus }
    )

    revalidatePath('/admin/users')

    return {
      success: true,
      data: { 
        message: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`,
        isActive: newStatus,
      },
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
} 