'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  ProfileSettingsSchema,
  SecuritySettingsSchema,
  NotificationSettingsSchema,
  AppearanceSettingsSchema,
  DataSettingsSchema,
  type SettingsActionResult 
} from '../types'
import { getCurrentUser } from '@/lib/auth'

// Récupérer le profil utilisateur
export async function getUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  
  // Récupérer le profil utilisateur
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Récupérer les préférences utilisateur
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    role: profile?.role || 'user',
    isActive: profile?.is_active || true,
    emailVerified: !!user.email_confirmed_at,
    lastSignInAt: user.last_sign_in_at,
    createdAt: user.created_at || '',
    updatedAt: profile?.updated_at || '',
    preferences: preferences || null,
  }
}

// Mettre à jour le profil utilisateur
export async function updateProfile(formData: FormData): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Valider les données
    const validatedFields = ProfileSettingsSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      bio: formData.get('bio') || undefined,
      website: formData.get('website') || undefined,
      location: formData.get('location') || undefined,
      phoneNumber: formData.get('phoneNumber') || undefined,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const supabase = await createClient()

    // Mettre à jour le profil
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        first_name: data.firstName,
        last_name: data.lastName,
      })

    if (profileError) {
      console.error('Erreur lors de la mise à jour du profil:', profileError)
      return { success: false, error: 'Erreur lors de la mise à jour du profil' }
    }

    // Mettre à jour l'email si nécessaire
    if (data.email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: data.email
      })

      if (emailError) {
        console.error('Erreur lors de la mise à jour de l\'email:', emailError)
        return { success: false, error: 'Erreur lors de la mise à jour de l\'email' }
      }
    }

    revalidatePath('/dashboard/settings')
    
    return { 
      success: true, 
      data: { message: 'Profil mis à jour avec succès' }
    }

  } catch (error) {
    console.error('Erreur dans updateProfile:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Mettre à jour les préférences de notification
export async function updateNotificationSettings(formData: FormData): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Valider les données
    const validatedFields = NotificationSettingsSchema.safeParse({
      emailNotifications: formData.get('emailNotifications') === 'on',
      pushNotifications: formData.get('pushNotifications') === 'on',
      securityAlerts: formData.get('securityAlerts') === 'on',
      marketingEmails: formData.get('marketingEmails') === 'on',
      weeklyDigest: formData.get('weeklyDigest') === 'on',
      instantMessages: formData.get('instantMessages') === 'on',
      notificationFrequency: formData.get('notificationFrequency'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const supabase = await createClient()

    // Mettre à jour les préférences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        email_notifications: data.emailNotifications,
        push_notifications: data.pushNotifications,
        security_alerts: data.securityAlerts,
        marketing_emails: data.marketingEmails,
        weekly_digest: data.weeklyDigest,
        instant_messages: data.instantMessages,
        notification_frequency: data.notificationFrequency,
      })

    if (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error)
      return { success: false, error: 'Erreur lors de la mise à jour des préférences' }
    }

    revalidatePath('/dashboard/settings')
    
    return { 
      success: true, 
      data: { message: 'Préférences de notification mises à jour' }
    }

  } catch (error) {
    console.error('Erreur dans updateNotificationSettings:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Mettre à jour les préférences d'apparence
export async function updateAppearanceSettings(formData: FormData): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Valider les données
    const validatedFields = AppearanceSettingsSchema.safeParse({
      theme: formData.get('theme'),
      language: formData.get('language'),
      timezone: formData.get('timezone'),
      dateFormat: formData.get('dateFormat'),
      compactMode: formData.get('compactMode') === 'on',
      sidebarCollapsed: formData.get('sidebarCollapsed') === 'on',
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const supabase = await createClient()

    // Mettre à jour les préférences
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        theme: data.theme,
        language: data.language,
        timezone: data.timezone,
        date_format: data.dateFormat,
        compact_mode: data.compactMode,
        sidebar_collapsed: data.sidebarCollapsed,
      })

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'apparence:', error)
      return { success: false, error: 'Erreur lors de la mise à jour de l\'apparence' }
    }

    revalidatePath('/dashboard/settings')
    
    return { 
      success: true, 
      data: { message: 'Préférences d\'apparence mises à jour' }
    }

  } catch (error) {
    console.error('Erreur dans updateAppearanceSettings:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Exporter les données utilisateur
export async function exportUserData(): Promise<SettingsActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Récupérer toutes les données de l'utilisateur
    const [profile, preferences, activityLogs] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
      supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
    ])

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        emailVerified: !!user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
      },
      profile: profile.data,
      preferences: preferences.data,
      activityLogs: activityLogs.data,
      exportedAt: new Date().toISOString(),
    }

    return { 
      success: true, 
      data: exportData
    }

  } catch (error) {
    console.error('Erreur dans exportUserData:', error)
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de l\'export' 
    }
  }
} 