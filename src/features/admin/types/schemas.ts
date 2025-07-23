import { z } from 'zod'
import { UserRole } from './core'

// Schémas de validation pour les utilisateurs
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
  organizationId: z.string().uuid().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

// Schémas pour les logs d'activité
export const ActivityLogFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Schémas pour les paramètres système (vraies données)
export const SystemSettingsSchema = z.object({
  siteName: z.string().min(1, 'Le nom du site est requis'),
  siteDescription: z.string().max(500),
  allowRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
  maxUploadSize: z.number().min(1).max(50), // en MB
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  appVersion: z.string().optional(),
  supportEmail: z.string().email().optional(),
  companyName: z.string().optional(),
})

// Schémas pour les organisations
export const OrganizationFiltersSchema = z.object({
  search: z.string().optional(),
  planType: z.string().optional(),
  subscriptionStatus: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
})

// Types inférés
export type CreateUserData = z.infer<typeof CreateUserSchema>
export type UpdateUserData = z.infer<typeof UpdateUserSchema>
export type UserFiltersData = z.infer<typeof UserFiltersSchema>
export type ActivityLogFiltersData = z.infer<typeof ActivityLogFiltersSchema>
export type SystemSettingsData = z.infer<typeof SystemSettingsSchema>
export type OrganizationFiltersData = z.infer<typeof OrganizationFiltersSchema>

// Interfaces pour les paramètres système
export interface SystemSettings {
  id: string
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxUploadSize: number
  maintenanceMode: boolean
  maintenanceMessage: string | null
  appVersion?: string
  supportEmail?: string
  companyName?: string
  updatedAt: string
  updatedBy: string
}