import { z } from 'zod'

// Schéma de validation pour le profil utilisateur
export const ProfileSettingsSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().min(1, 'Le nom est requis').max(50),
  email: z.string().email('Email invalide'),
  bio: z.string().max(500).optional(),
  website: z.string().url('URL invalide').optional(),
  location: z.string().max(100).optional(),
  phoneNumber: z.string().max(20).optional(),
})

// Schéma pour les paramètres de sécurité
export const SecuritySettingsSchema = z.object({
  currentPassword: z.string().min(8, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit faire au moins 8 caractères').optional(),
  confirmPassword: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(15).max(480).optional(), // 15 min à 8h
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Schéma pour les paramètres de notification
export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
  weeklyDigest: z.boolean(),
  instantMessages: z.boolean(),
  notificationFrequency: z.enum(['instant', 'hourly', 'daily', 'weekly']),
})

// Schéma pour les paramètres d'apparence
export const AppearanceSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['fr', 'en']),
  timezone: z.string(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']),
  compactMode: z.boolean(),
  sidebarCollapsed: z.boolean(),
})

// Schéma pour les paramètres de données
export const DataSettingsSchema = z.object({
  dataRetentionDays: z.number().min(30).max(365),
  exportFormat: z.enum(['json', 'csv', 'xml']),
  includePersonalData: z.boolean(),
  includeActivityLogs: z.boolean(),
})

// Types inférés
export type ProfileSettingsData = z.infer<typeof ProfileSettingsSchema>
export type SecuritySettingsData = z.infer<typeof SecuritySettingsSchema>
export type NotificationSettingsData = z.infer<typeof NotificationSettingsSchema>
export type AppearanceSettingsData = z.infer<typeof AppearanceSettingsSchema>
export type DataSettingsData = z.infer<typeof DataSettingsSchema>

// Interface pour les paramètres utilisateur complets
export interface UserSettings {
  profile: ProfileSettingsData
  security: Partial<SecuritySettingsData>
  notifications: NotificationSettingsData
  appearance: AppearanceSettingsData
  data: DataSettingsData
}

// Type pour les résultats d'actions
export interface SettingsActionResult {
  success: boolean
  data?: unknown
  error?: string
  errors?: Record<string, string[]>
}

// Interface pour le profil utilisateur complet
export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  bio?: string
  website?: string
  location?: string
  phoneNumber?: string
  avatarUrl?: string
  role: string
  isActive: boolean
  emailVerified: boolean
  twoFactorEnabled: boolean
  lastSignInAt: string | null
  createdAt: string
  updatedAt: string
} 