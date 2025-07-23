import { UserRole, Permission, ROLE_PERMISSIONS, type AdminUser } from '../types'
import { requireAuthAPI, getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
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
    const user = await getCurrentUser()
    
    if (!user) {
      return null
    }
    
    return await buildAdminUserFromAuth(user)
  } catch (error) {
    console.error('[ADMIN] Erreur dans getCurrentAdminUser:', error)
    return null
  }
}

/**
 * Construit un objet AdminUser à partir des données auth
 */
async function buildAdminUserFromAuth(user: any): Promise<AdminUser | null> {
  const supabase = await createClient()

  // Récupérer le profil utilisateur
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[ADMIN] Erreur lors de la récupération du profil:', profileError)
    return null
  }

  if (!profile) {
    console.warn('[ADMIN] Profil non trouvé pour l\'utilisateur:', user.id)
    
    // Créer automatiquement le profil s'il n'existe pas
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        first_name: '',
        last_name: '',
        role: UserRole.USER,
        is_active: true
      })
      .select()
      .single()

    if (createError) {
      console.error('[ADMIN] Erreur lors de la création du profil:', createError)
      return null
    }

    return buildAdminUserObject(newProfile, user)
  }

  return buildAdminUserObject(profile, user)
}

/**
 * Construit l'objet AdminUser final
 */
function buildAdminUserObject(profile: any, authUser: any): AdminUser {
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
}

/**
 * Récupère le profil admin de l'utilisateur connecté pour les API routes
 */
export async function getCurrentAdminUserAPI(request?: Request): Promise<AdminUser | null> {
  try {
    console.log('[ADMIN] Récupération de l\'utilisateur API...')
    const user = await requireAuthAPI(request)
    
    if (!user) {
      console.log('[ADMIN] Aucun utilisateur trouvé dans requireAuthAPI')
      return null
    }

    console.log('[ADMIN] Utilisateur trouvé:', user.email)

    const supabase = await createSupabaseClientForAPI(request)
    return await getProfileForUser(supabase, user)
  } catch (error) {
    console.error('[ADMIN] Erreur dans getCurrentAdminUserAPI:', error)
    return null
  }
}

/**
 * Crée un client Supabase adapté pour les API routes
 */
async function createSupabaseClientForAPI(request?: Request) {
  if (request) {
    const cookieHeader = request.headers.get('cookie') || ''
    
    return createServerClient(
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
  }
  
  // Fallback vers le client standard
  return await createClient()
}

/**
 * Récupère le profil utilisateur et construit l'objet AdminUser
 */
async function getProfileForUser(supabase: any, user: any): Promise<AdminUser | null> {
  console.log('[ADMIN] Récupération du profil depuis user_profiles...')
  
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[ADMIN] Erreur lors de la récupération du profil:', profileError)
    return null
  }

  if (!profile) {
    console.error('[ADMIN] Profil non trouvé pour l\'utilisateur:', user.id)
    return null
  }

  console.log('[ADMIN] Profil trouvé:', {
    id: profile.id,
    role: profile.role,
    isActive: profile.is_active
  })

  return buildAdminUserObject(profile, user)
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
 * Enregistre une activité dans les logs d'audit de manière sécurisée
 */
export async function logActivity(
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>,
  request?: Request
): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.warn('[AUDIT] Tentative de log sans utilisateur authentifié')
      return false
    }

    const supabase = await createClient()

    // Extraire les informations de la requête si disponible
    const ipAddress = extractClientIP(request)
    const userAgent = request?.headers.get('user-agent') || 'Unknown'

    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        metadata: sanitizeMetadata(metadata),
        ip_address: ipAddress,
        user_agent: userAgent,
      })

    if (error) {
      console.error('[AUDIT] Erreur lors de l\'insertion du log:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[AUDIT] Erreur lors de l\'enregistrement de l\'activité:', error)
    return false
  }
}

/**
 * Extrait l'adresse IP du client de manière sécurisée
 */
function extractClientIP(request?: Request): string {
  if (!request) return '127.0.0.1'
  
  // Vérifier les en-têtes dans l'ordre de priorité
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Prendre seulement la première IP (client original)
    return forwardedFor.split(',')[0].trim()
  }
  
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

/**
 * Nettoie les métadonnées pour éviter les fuites de données sensibles
 */
function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {}
  
  const sanitized = { ...metadata }
  
  // Supprimer les champs sensibles
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth']
  sensitiveFields.forEach(field => {
    delete sanitized[field]
  })
  
  return sanitized
}

/**
 * Middleware pour vérifier les permissions admin
 */
export function withAdminPermissions(permissions: Permission[] = []) {
  return async function middleware() {
    return await requireAdmin(permissions)
  }
} 