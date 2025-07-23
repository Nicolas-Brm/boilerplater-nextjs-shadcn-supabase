
// Énumérations pour les rôles et permissions
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator', 
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  // Gestion des utilisateurs
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // Gestion des organisations
  VIEW_ORGANIZATIONS = 'view_organizations',
  MANAGE_ORGANIZATIONS = 'manage_organizations',
  
  // Configuration système
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LOGS = 'view_logs',
  MANAGE_SYSTEM = 'manage_system'
}

// Permissions par rôle (basées sur les vraies fonctionnalités)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [],
  [UserRole.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_ORGANIZATIONS,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ORGANIZATIONS,
    Permission.MANAGE_ORGANIZATIONS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_LOGS,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
}

// Interfaces de base
export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  emailVerified: boolean
  lastSignInAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AdminActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

// Statistiques réelles basées sur les données disponibles
export interface AdminStats {
  // Utilisateurs (depuis user_profiles)
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  
  // Organisations (depuis organizations)
  totalOrganizations: number
  activeOrganizations: number
  
  // Activité récente (depuis activity_logs)
  recentActivities: number
}

// Activity logs (table existante)
export interface ActivityLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
  user?: {
    email: string
    firstName?: string
    lastName?: string
  }
}

// Organisation avec statistiques
export interface OrganizationWithStats {
  id: string
  name: string
  slug: string
  description?: string
  planType: string
  subscriptionStatus: string
  createdAt: string
  memberCount: number
  activeMembers: number
  recentActivity: number
}