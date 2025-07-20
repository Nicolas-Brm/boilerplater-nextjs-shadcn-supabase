import { UserRole, Permission, ROLE_PERMISSIONS, type AdminUser } from '../types'
import { requireAuth, requireAuthAPI, getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole]
  return rolePermissions.includes(permission)
}

/**
 * Vérifie si un utilisateur a l'un des rôles requis
 */
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Vérifie si un utilisateur peut effectuer une action sur une ressource
 */
export function canPerformAction(
  userRole: UserRole,
  action: Permission,
  resourceOwnerId?: string,
  currentUserId?: string
): boolean {
  // Super admin peut tout faire
  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }

  // Vérifier la permission de base
  if (!hasPermission(userRole, action)) {
    return false
  }

  // Si c'est une action sur sa propre ressource, autoriser
  if (resourceOwnerId && currentUserId && resourceOwnerId === currentUserId) {
    return true
  }

  return true
}

/**
 * Récupère le profil admin de l'utilisateur connecté
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    // Use getCurrentUser instead of requireAuth to avoid redirects
    const user = await getCurrentUser()
    
    if (!user) {
      return null
    }
    
    const supabase = await createClient()

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError)
      return null
    }

    if (!profile) {
      console.error('Profil non trouvé pour l\'utilisateur:', user.id)
      
      // Créer automatiquement le profil s'il n'existe pas
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          first_name: '',
          last_name: '',
          role: 'user',
          is_active: true
        })
        .select()
        .single()

      if (createError) {
        console.error('Erreur lors de la création du profil:', createError)
        return null
      }

      // Utiliser le nouveau profil créé
      return {
        id: newProfile.id,
        email: user.email || '',
        firstName: newProfile.first_name || '',
        lastName: newProfile.last_name || '',
        role: newProfile.role as UserRole,
        isActive: newProfile.is_active,
        emailVerified: !!user.email_confirmed_at,
        lastSignInAt: user.last_sign_in_at || null,
        createdAt: user.created_at || '',
        updatedAt: newProfile.updated_at,
      }
    }

    return {
      id: profile.id,
      email: user.email || '',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      role: profile.role as UserRole,
      isActive: profile.is_active,
      emailVerified: !!user.email_confirmed_at,
      lastSignInAt: user.last_sign_in_at || null,
      createdAt: user.created_at || '',
      updatedAt: profile.updated_at,
    }
  } catch (error) {
    console.error('Erreur dans getCurrentAdminUser:', error)
    return null
  }
}

/**
 * Récupère le profil admin de l'utilisateur connecté pour les API routes
 */
export async function getCurrentAdminUserAPI(request?: Request): Promise<AdminUser | null> {
  try {
    console.log('🔍 [AUTH] Récupération de l\'utilisateur API...')
    const user = await requireAuthAPI(request)
    
    if (!user) {
      console.log('❌ [AUTH] Aucun utilisateur trouvé dans requireAuthAPI')
      return null
    }

    console.log('✅ [AUTH] Utilisateur trouvé:', user.email, 'ID:', user.id)

    // Utiliser le même client Supabase que requireAuthAPI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabase: any
    
    if (request) {
      // Utiliser les cookies de la requête si fournis
      const cookieHeader = request.headers.get('cookie') || ''
      
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieHeader.split(';').map(cookie => {
                const [name, ...rest] = cookie.trim().split('=')
                return { name, value: rest.join('=') }
              }).filter(cookie => cookie.name && cookie.value)
            },
            setAll() {
              // Ne pas essayer de définir des cookies dans une API route
            },
          },
        }
      )
    } else {
      // Fallback vers l'approche originale
      const cookieStore = await cookies()
      
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch {
                // ignore les erreurs de cookies en API route
              }
            },
          },
        }
      )
    }

    // Récupérer le profil utilisateur
    console.log('🔍 [AUTH] Récupération du profil depuis user_profiles...')
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ [AUTH] Erreur lors de la récupération du profil:', profileError)
      return null
    }

    if (!profile) {
      console.error('❌ [AUTH] Profil non trouvé pour l\'utilisateur:', user.id)
      return null
    }

    console.log('✅ [AUTH] Profil trouvé:', {
      id: profile.id,
      role: profile.role,
      isActive: profile.is_active
    })

    return {
      id: profile.id,
      email: user.email || '',
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      role: profile.role as UserRole,
      isActive: profile.is_active,
      emailVerified: !!user.email_confirmed_at,
      lastSignInAt: user.last_sign_in_at || null,
      createdAt: user.created_at || '',
      updatedAt: profile.updated_at,
    }
  } catch (error) {
    console.error('❌ [AUTH] Erreur dans getCurrentAdminUserAPI:', error)
    return null
  }
}

/**
 * Vérifie que l'utilisateur connecté est admin et retourne son profil
 */
export async function requireAdmin(
  requiredPermissions: Permission[] = []
): Promise<AdminUser> {
  const adminUser = await getCurrentAdminUser()

  if (!adminUser) {
    // Rediriger vers la page de connexion si pas d'utilisateur
    redirect('/login')
    // Cette ligne ne sera jamais atteinte car redirect() ne retourne jamais
    throw new Error('Redirection failed')
  }

  // Vérifier si l'utilisateur a un rôle admin
  if (!hasRole(adminUser.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR])) {
    throw new Error('Accès admin requis')
  }

  // Vérifier les permissions spécifiques si fournies
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      hasPermission(adminUser.role, permission)
    )

    if (!hasAllPermissions) {
      throw new Error('Permissions insuffisantes')
    }
  }

  // Vérifier que le compte est actif
  if (!adminUser.isActive) {
    throw new Error('Compte désactivé')
  }

  return adminUser
}

/**
 * Vérifie que l'utilisateur connecté est admin et retourne son profil pour les API routes
 */
export async function requireAdminAPI(
  requiredPermissions: Permission[] = [],
  request?: Request
): Promise<AdminUser | null> {
  console.log('🔍 [ADMIN] Début de requireAdminAPI, permissions requises:', requiredPermissions)
  
  const adminUser = await getCurrentAdminUserAPI(request)

  if (!adminUser) {
    console.log('❌ [ADMIN] getCurrentAdminUserAPI a retourné null')
    return null
  }

  console.log('✅ [ADMIN] Utilisateur récupéré:', adminUser.email, 'Role:', adminUser.role)

  // Vérifier si l'utilisateur a un rôle admin
  const hasAdminRole = hasRole(adminUser.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR])
  console.log('🔍 [ADMIN] Vérification du rôle admin:', hasAdminRole)
  
  if (!hasAdminRole) {
    console.log('❌ [ADMIN] Utilisateur n\'a pas de rôle admin. Rôle actuel:', adminUser.role)
    return null
  }

  // Vérifier les permissions spécifiques si fournies
  if (requiredPermissions.length > 0) {
    console.log('🔍 [ADMIN] Vérification des permissions spécifiques...')
    const hasAllPermissions = requiredPermissions.every(permission => {
      const hasPermissionResult = hasPermission(adminUser.role, permission)
      console.log(`  - Permission ${permission}: ${hasPermissionResult}`)
      return hasPermissionResult
    })

    console.log('🔍 [ADMIN] A toutes les permissions requises:', hasAllPermissions)

    if (!hasAllPermissions) {
      console.log('❌ [ADMIN] Permissions insuffisantes')
      return null
    }
  }

  // Vérifier que le compte est actif
  if (!adminUser.isActive) {
    console.log('❌ [ADMIN] Compte utilisateur désactivé')
    return null
  }

  console.log('✅ [ADMIN] Tous les contrôles passés avec succès')
  return adminUser
}

/**
 * Enregistre une activité dans les logs d'audit
 */
export async function logActivity(
  action: string,
  resource: string,
  resourceId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>,
  request?: Request
) {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    // Extraire les informations de la requête si disponible
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                      request?.headers.get('x-real-ip') || 
                      '127.0.0.1'
    const userAgent = request?.headers.get('user-agent') || 'Unknown'

    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        metadata: metadata || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      })
  } catch (error) {
    // Log l'erreur mais ne pas faire échouer l'action principale
    console.error('Erreur lors de l\'enregistrement de l\'activité:', error)
  }
}

/**
 * Middleware pour vérifier les permissions admin
 */
export function withAdminPermissions(permissions: Permission[] = []) {
  return async function middleware() {
    return await requireAdmin(permissions)
  }
} 