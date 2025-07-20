import { z } from 'zod'

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
  
  // Gestion du contenu
  VIEW_ALL_CONTENT = 'view_all_content',
  MODERATE_CONTENT = 'moderate_content',
  DELETE_CONTENT = 'delete_content',
  
  // Configuration système
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LOGS = 'view_logs',
  MANAGE_SYSTEM = 'manage_system'
}

// Schémas de validation
export const CreateUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  firstName: z.string().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().min(1, 'Le nom est requis').max(50),
  isActive: z.boolean().default(true),
})

export const UpdateUserSchema = z.object({
  email: z.string().email('Email invalide').optional(),
  firstName: z.string().min(1, 'Le prénom est requis').max(50).optional(),
  lastName: z.string().min(1, 'Le nom est requis').max(50).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

export const UserFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

export const SystemSettingsSchema = z.object({
  siteName: z.string().min(1, 'Le nom du site est requis'),
  siteDescription: z.string().max(500),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  maxUploadSize: z.number().min(1).max(50), // en MB
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  // Nouveaux paramètres
  appVersion: z.string().optional(),
  supportEmail: z.string().email().optional(),
  companyName: z.string().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  termsOfServiceUrl: z.string().url().optional(),
  analyticsEnabled: z.boolean().optional(),
  cookieConsentRequired: z.boolean().optional(),
  sessionTimeoutHours: z.number().min(1).max(168).optional(), // 1h à 1 semaine
  passwordMinLength: z.number().min(6).max(20).optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  socialLoginGoogle: z.boolean().optional(),
  socialLoginGithub: z.boolean().optional(),
  backupFrequencyHours: z.number().min(1).max(168).optional(),
  rateLimitPerMinute: z.number().min(10).max(1000).optional(),
  debugMode: z.boolean().optional(),
})

// Types TypeScript inférés
export type CreateUserData = z.infer<typeof CreateUserSchema>
export type UpdateUserData = z.infer<typeof UpdateUserSchema>
export type UserFiltersData = z.infer<typeof UserFiltersSchema>
export type SystemSettingsData = z.infer<typeof SystemSettingsSchema>

// Interfaces étendues
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

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalContent: number
  pendingModeration: number
  systemLoad: {
    cpu: number
    memory: number
    storage: number
  }
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface SystemSettings {
  id: string
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxUploadSize: number
  maintenanceMode: boolean
  maintenanceMessage: string | null
  updatedAt: string
  updatedBy: string
  // Nouveaux paramètres
  appVersion?: string
  supportEmail?: string
  companyName?: string
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  analyticsEnabled?: boolean
  cookieConsentRequired?: boolean
  sessionTimeoutHours?: number
  passwordMinLength?: number
  allowedFileTypes?: string[]
  socialLoginGoogle?: boolean
  socialLoginGithub?: boolean
  backupFrequencyHours?: number
  rateLimitPerMinute?: number
  debugMode?: boolean
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [],
  [UserRole.MODERATOR]: [
    Permission.VIEW_USERS,
    Permission.VIEW_ALL_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_ANALYTICS,
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.UPDATE_USERS,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_ALL_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_LOGS,
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
}

// Type pour les résultats d'actions admin
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AdminActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
} 