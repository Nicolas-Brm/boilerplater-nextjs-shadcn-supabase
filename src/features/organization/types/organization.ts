import { z } from 'zod'

// Énumérations
export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin', 
  MANAGER = 'manager',
  MEMBER = 'member'
}

export enum PlanType {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Schémas de validation
export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'organisation est requis').max(100),
  slug: z.string().min(1, 'Le slug est requis').max(50).regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  description: z.string().max(500).optional(),
  website: z.string().url('URL invalide').optional(),
})

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'organisation est requis').max(100).optional(),
  description: z.string().max(500).optional(),
  website: z.string().url('URL invalide').optional(),
  maxMembers: z.number().min(1).max(1000).optional(),
  allowPublicSignup: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
})

export const OrganizationSettingsSchema = z.object({
  // Paramètres généraux
  defaultTimezone: z.string(),
  defaultLanguage: z.enum(['fr', 'en']),
  
  // Paramètres de sécurité
  enforce2fa: z.boolean(),
  sessionTimeoutHours: z.number().min(1).max(168),
  passwordMinLength: z.number().min(6).max(20),
  
  // Paramètres de notification
  adminNotifications: z.boolean(),
  securityNotifications: z.boolean(),
  
  // Paramètres d'intégration
  apiEnabled: z.boolean(),
  webhookEnabled: z.boolean(),
})

export const InviteMemberSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.nativeEnum(OrganizationRole).default(OrganizationRole.MEMBER),
  message: z.string().max(500).optional(),
})

export const UpdateMemberRoleSchema = z.object({
  role: z.nativeEnum(OrganizationRole),
})

// Types inférés
export type CreateOrganizationData = z.infer<typeof CreateOrganizationSchema>
export type UpdateOrganizationData = z.infer<typeof UpdateOrganizationSchema>
export type OrganizationSettingsData = z.infer<typeof OrganizationSettingsSchema>
export type InviteMemberData = z.infer<typeof InviteMemberSchema>
export type UpdateMemberRoleData = z.infer<typeof UpdateMemberRoleSchema>

// Interfaces
export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logoUrl?: string
  maxMembers: number
  allowPublicSignup: boolean
  requireApproval: boolean
  planType: PlanType
  subscriptionStatus: SubscriptionStatus
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: OrganizationRole
  isActive: boolean
  joinedAt: string
  invitedBy?: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

export interface OrganizationSettings {
  id: string
  organizationId: string
  defaultTimezone: string
  defaultLanguage: string
  enforce2fa: boolean
  sessionTimeoutHours: number
  passwordMinLength: number
  adminNotifications: boolean
  securityNotifications: boolean
  apiEnabled: boolean
  webhookEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  email: string
  role: OrganizationRole
  message?: string
  token: string
  expiresAt: string
  createdAt: string
  invitedBy: string
  organization: {
    name: string
    logoUrl?: string
  }
}

// Type pour les résultats d'actions
export interface OrganizationActionResult {
  success: boolean
  data?: unknown
  error?: string
  errors?: Record<string, string[]>
}

// Interface pour l'organisation avec statistiques
export interface OrganizationWithStats extends Organization {
  memberCount: number
  activeMembers: number
  adminCount: number
} 