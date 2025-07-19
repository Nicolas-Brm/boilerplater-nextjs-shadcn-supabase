'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  SystemSettingsSchema,
  type AdminActionResult,
  type SystemSettings,
  Permission 
} from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'

async function fetchSettings(keys?: string[]): Promise<Record<string, any>> {
  const supabase = await createClient()
  const query = supabase.from('system_settings').select('key, value')
  if (keys) query.in('key', keys)
  const { data: settings, error } = await query
  if (error) throw new Error(`Error fetching settings: ${error.message}`)
  return (settings || []).reduce((acc, setting) => {
    try {
      // Essayer de parser comme JSON d'abord
      acc[setting.key] = JSON.parse(setting.value)
    } catch (parseError) {
      // Si ça échoue, vérifier si c'est une valeur simple (string, number, boolean)
      const value = setting.value
      
      // Si c'est "true" ou "false", convertir en boolean
      if (value === 'true') {
        acc[setting.key] = true
      } else if (value === 'false') {
        acc[setting.key] = false
      } 
      // Si c'est un nombre, le convertir
      else if (!isNaN(Number(value)) && value.trim() !== '') {
        acc[setting.key] = Number(value)
      }
      // Sinon, garder comme string
      else {
        acc[setting.key] = value
      }
    }
    return acc
  }, {} as Record<string, any>)
}

async function updateSettings(updates: { key: string, value: any }[], adminUserId: string) {
  const supabase = await createClient()
  for (const update of updates) {
    const { error } = await supabase
      .from('system_settings')
      .update({ value: JSON.stringify(update.value), updated_by: adminUserId })
      .eq('key', update.key)
    if (error) throw new Error(`Error updating ${update.key}: ${error.message}`)
  }
}

export async function getSystemSettings(): Promise<AdminActionResult<SystemSettings>> {
  try {
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])
    const settingsMap = await fetchSettings()

    const systemSettings: SystemSettings = {
      id: 'system',
      siteName: settingsMap.site_name || 'Boilerplate Next.js Pro',
      siteDescription: settingsMap.site_description || 'A modern and secure platform built with Next.js 15, Supabase, and Shadcn/UI. Perfect for quickly starting your web projects with authentication, user management, and a complete admin interface.',
      allowRegistration: settingsMap.allow_registration ?? true,
      requireEmailVerification: settingsMap.require_email_verification ?? true,
      maxUploadSize: settingsMap.max_upload_size || 25,
      maintenanceMode: settingsMap.maintenance_mode ?? false,
      maintenanceMessage: settingsMap.maintenance_message || 'Our platform is temporarily under maintenance to enhance your experience. We will be back very soon! Thank you for your patience.',
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser.id,
      appVersion: settingsMap.app_version || '1.2.3',
      supportEmail: settingsMap.support_email,
      companyName: settingsMap.company_name || 'Boilerplate Solutions',
      privacyPolicyUrl: settingsMap.privacy_policy_url,
      termsOfServiceUrl: settingsMap.terms_of_service_url,
      analyticsEnabled: settingsMap.analytics_enabled || false,
      cookieConsentRequired: settingsMap.cookie_consent_required || false,
      sessionTimeoutHours: settingsMap.session_timeout_hours || 24,
      passwordMinLength: settingsMap.password_min_length || 8,
      allowedFileTypes: settingsMap.allowed_file_types || [],
      socialLoginGoogle: settingsMap.social_login_google || false,
      socialLoginGithub: settingsMap.social_login_github || false,
      backupFrequencyHours: settingsMap.backup_frequency_hours || 24,
      rateLimitPerMinute: settingsMap.rate_limit_per_minute || 100,
      debugMode: settingsMap.debug_mode || false,
    }

    await logActivity('VIEW_SETTINGS', 'system')

    return { success: true, data: systemSettings }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function updateSystemSettings(
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])

    const validatedFields = SystemSettingsSchema.safeParse({
      siteName: formData.get('siteName'),
      siteDescription: formData.get('siteDescription'),
      allowRegistration: formData.get('allowRegistration') === 'true',
      requireEmailVerification: formData.get('requireEmailVerification') === 'true',
      maxUploadSize: Number(formData.get('maxUploadSize')),
      maintenanceMode: formData.get('maintenanceMode') === 'true',
      maintenanceMessage: formData.get('maintenanceMessage'),
    })

    if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors }
    }

    const settings = validatedFields.data
    const updates = [
      { key: 'site_name', value: settings.siteName },
      { key: 'site_description', value: settings.siteDescription },
      { key: 'allow_registration', value: settings.allowRegistration },
      { key: 'require_email_verification', value: settings.requireEmailVerification },
      { key: 'max_upload_size', value: settings.maxUploadSize },
      { key: 'maintenance_mode', value: settings.maintenanceMode },
      { key: 'maintenance_message', value: settings.maintenanceMessage || '' },
    ]

    await updateSettings(updates, adminUser.id)

    await logActivity('UPDATE_SETTINGS', 'system', undefined, { updatedSettings: Object.keys(settings) })

    revalidatePath('/admin/settings')

    return { success: true, data: { message: 'Settings updated successfully' } }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred during the update' }
  }
}

export async function resetSettings(): Promise<AdminActionResult> {
  try {
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])

    const defaultSettings = [
      { key: 'site_name', value: 'Boilerplate Next.js Pro' },
      { key: 'site_description', value: 'A modern and secure platform built with Next.js 15, Supabase, and Shadcn/UI. Perfect for quickly starting your web projects with authentication, user management, and a complete admin interface.' },
      { key: 'allow_registration', value: true },
      { key: 'require_email_verification', value: true },
      { key: 'max_upload_size', value: 25 },
      { key: 'maintenance_mode', value: false },
      { key: 'maintenance_message', value: 'Our platform is temporarily under maintenance to enhance your experience. We will be back very soon! Thank you for your patience.' },
      { key: 'app_version', value: '1.2.3' },
      { key: 'company_name', value: 'Boilerplate Solutions' },
    ]

    await updateSettings(defaultSettings, adminUser.id)

    await logActivity('RESET_SETTINGS', 'system')

    revalidatePath('/admin/settings')

    return { success: true, data: { message: 'Settings reset to default values' } }
  } catch (error) {
    console.error('Error resetting settings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred during the reset' }
  }
}

export async function toggleMaintenanceMode(): Promise<AdminActionResult> {
  try {
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])
    const settingsMap = await fetchSettings(['maintenance_mode'])

    const currentMode = settingsMap.maintenance_mode
    const newMode = !currentMode

    await updateSettings([{ key: 'maintenance_mode', value: newMode }], adminUser.id)

    await logActivity(newMode ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE', 'system', undefined, { newMode })

    revalidatePath('/admin/settings')

    return { success: true, data: { message: `Maintenance mode ${newMode ? 'enabled' : 'disabled'}`, maintenanceMode: newMode } }
  } catch (error) {
    console.error('Error toggling maintenance mode:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred' }
  }
}

export async function exportSettings(): Promise<AdminActionResult<{ downloadUrl: string }>> {
  try {
    await requireAdmin([Permission.MANAGE_SETTINGS])
    const settingsMap = await fetchSettings()

    const settingsExport = {
      exportDate: new Date().toISOString(),
      settings: settingsMap
    }

    const jsonContent = JSON.stringify(settingsExport, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)

    await logActivity('EXPORT_SETTINGS', 'system')

    return { success: true, data: { downloadUrl } }
  } catch (error) {
    console.error('Error exporting settings:', error)
    return { success: false, error: error instanceof Error ? error.message : 'An error occurred during export' }
  }
} 

export async function getBasicSystemInfo(): Promise<AdminActionResult<{
  siteName: string
  appVersion: string
  companyName: string
}>> {
  try {
    const settingsMap = await fetchSettings(['site_name', 'app_version', 'company_name'])

    return {
      success: true,
      data: {
        siteName: settingsMap.site_name || 'My Application',
        appVersion: settingsMap.app_version || '1.0.0',
        companyName: settingsMap.company_name || 'My Company',
      },
    }
  } catch (error) {
    return {
      success: true,
      data: {
        siteName: 'My Application',
        appVersion: '1.0.0',
        companyName: 'My Company',
      },
    }
  }
} 