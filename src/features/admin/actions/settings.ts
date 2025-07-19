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

export async function getSystemSettings(): Promise<AdminActionResult<SystemSettings>> {
  try {
    // Vérifier les permissions admin
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])
    const supabase = await createClient()

    // Récupérer tous les paramètres système
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')

    if (error) {
      throw new Error(`Erreur lors de la récupération des paramètres: ${error.message}`)
    }

    // Transformer les paramètres en objet unique
    const settingsMap = (settings || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    const systemSettings: SystemSettings = {
      id: 'system',
      siteName: settingsMap.site_name || 'Boilerplate Next.js Pro',
      siteDescription: settingsMap.site_description || 'Une plateforme moderne et sécurisée construite avec Next.js 15, Supabase et Shadcn/UI. Parfait pour démarrer rapidement vos projets web avec authentification, gestion des utilisateurs et interface d\'administration complète.',
      allowRegistration: settingsMap.allow_registration !== undefined ? settingsMap.allow_registration : true,
      requireEmailVerification: settingsMap.require_email_verification !== undefined ? settingsMap.require_email_verification : true,
      maxUploadSize: settingsMap.max_upload_size || 25,
      maintenanceMode: settingsMap.maintenance_mode !== undefined ? settingsMap.maintenance_mode : false,
      maintenanceMessage: settingsMap.maintenance_message || 'Notre plateforme est temporairement en maintenance pour améliorer votre expérience. Nous serons de retour très bientôt ! Merci de votre patience.',
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser.id,
      // Nouveaux paramètres
      appVersion: settingsMap.app_version || '1.2.3',
      supportEmail: settingsMap.support_email || undefined,
      companyName: settingsMap.company_name || 'Boilerplate Solutions',
      privacyPolicyUrl: settingsMap.privacy_policy_url || undefined,
      termsOfServiceUrl: settingsMap.terms_of_service_url || undefined,
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

    return {
      success: true,
      data: systemSettings,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function updateSystemSettings(
  prevState: AdminActionResult | null,
  formData: FormData
): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])

    // Valider les données
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
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const settings = validatedFields.data
    const supabase = await createClient()

    // Préparer les mises à jour
    const updates = [
      { key: 'site_name', value: JSON.stringify(settings.siteName) },
      { key: 'site_description', value: JSON.stringify(settings.siteDescription) },
      { key: 'allow_registration', value: JSON.stringify(settings.allowRegistration) },
      { key: 'require_email_verification', value: JSON.stringify(settings.requireEmailVerification) },
      { key: 'max_upload_size', value: JSON.stringify(settings.maxUploadSize) },
      { key: 'maintenance_mode', value: JSON.stringify(settings.maintenanceMode) },
      { key: 'maintenance_message', value: JSON.stringify(settings.maintenanceMessage || '') },
    ]

    // Mettre à jour chaque paramètre
    for (const update of updates) {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: update.value,
          updated_by: adminUser.id,
        })
        .eq('key', update.key)

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de ${update.key}: ${error.message}`)
      }
    }

    await logActivity('UPDATE_SETTINGS', 'system', undefined, {
      updatedSettings: Object.keys(settings),
    })

    revalidatePath('/admin/settings')

    return {
      success: true,
      data: { message: 'Paramètres mis à jour avec succès' },
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour',
    }
  }
}

export async function resetSettings(): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])
    const supabase = await createClient()

    // Paramètres par défaut
    const defaultSettings = [
      { key: 'site_name', value: '"Boilerplate Next.js Pro"' },
      { key: 'site_description', value: '"Une plateforme moderne et sécurisée construite avec Next.js 15, Supabase et Shadcn/UI. Parfait pour démarrer rapidement vos projets web avec authentification, gestion des utilisateurs et interface d\'administration complète."' },
      { key: 'allow_registration', value: 'true' },
      { key: 'require_email_verification', value: 'true' },
      { key: 'max_upload_size', value: '25' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'maintenance_message', value: '"Notre plateforme est temporairement en maintenance pour améliorer votre expérience. Nous serons de retour très bientôt ! Merci de votre patience."' },
      { key: 'app_version', value: '"1.2.3"' },
      { key: 'company_name', value: '"Boilerplate Solutions"' },
    ]

    // Réinitialiser chaque paramètre
    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('system_settings')
        .update({
          value: setting.value,
          updated_by: adminUser.id,
        })
        .eq('key', setting.key)

      if (error) {
        throw new Error(`Erreur lors de la réinitialisation de ${setting.key}: ${error.message}`)
      }
    }

    await logActivity('RESET_SETTINGS', 'system')

    revalidatePath('/admin/settings')

    return {
      success: true,
      data: { message: 'Paramètres réinitialisés aux valeurs par défaut' },
    }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la réinitialisation',
    }
  }
}

export async function toggleMaintenanceMode(): Promise<AdminActionResult> {
  try {
    // Vérifier les permissions admin
    const adminUser = await requireAdmin([Permission.MANAGE_SETTINGS])
    const supabase = await createClient()

    // Récupérer l'état actuel du mode maintenance
    const { data: maintenanceSetting } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()

    if (!maintenanceSetting) {
      throw new Error('Paramètre de maintenance non trouvé')
    }

    const currentMode = JSON.parse(maintenanceSetting.value)
    const newMode = !currentMode

    // Mettre à jour le mode maintenance
    const { error } = await supabase
      .from('system_settings')
      .update({
        value: JSON.stringify(newMode),
        updated_by: adminUser.id,
      })
      .eq('key', 'maintenance_mode')

    if (error) {
      throw new Error(`Erreur lors du changement de mode maintenance: ${error.message}`)
    }

    await logActivity(
      newMode ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
      'system',
      undefined,
      { newMode }
    )

    revalidatePath('/admin/settings')

    return {
      success: true,
      data: { 
        message: `Mode maintenance ${newMode ? 'activé' : 'désactivé'}`,
        maintenanceMode: newMode,
      },
    }
  } catch (error) {
    console.error('Erreur lors du changement de mode maintenance:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function exportSettings(): Promise<AdminActionResult<{ downloadUrl: string }>> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.MANAGE_SETTINGS])
    const supabase = await createClient()

    // Récupérer tous les paramètres
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')

    if (error) {
      throw new Error(`Erreur lors de l'export des paramètres: ${error.message}`)
    }

    // Formater en JSON
    const settingsExport = {
      exportDate: new Date().toISOString(),
      settings: (settings || []).reduce((acc, setting) => {
        acc[setting.key] = JSON.parse(setting.value)
        return acc
      }, {} as Record<string, any>)
    }

    const jsonContent = JSON.stringify(settingsExport, null, 2)

    // Dans un vrai environnement, vous stockeriez le fichier et retourneriez l'URL
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const downloadUrl = URL.createObjectURL(blob)

    await logActivity('EXPORT_SETTINGS', 'system')

    return {
      success: true,
      data: { downloadUrl },
    }
  } catch (error) {
    console.error('Erreur lors de l\'export des paramètres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export',
    }
  }
} 

export async function getBasicSystemInfo(): Promise<AdminActionResult<{
  siteName: string
  appVersion: string
  companyName: string
}>> {
  try {
    const supabase = await createClient()

    // Récupérer seulement les paramètres nécessaires pour le dashboard
    // Note: Cette fonction peut être appelée par tous les utilisateurs connectés
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['site_name', 'app_version', 'company_name'])

    if (error) {
      // Retourner des valeurs par défaut si l'accès est refusé
      return {
        success: true,
        data: {
          siteName: 'Mon Application',
          appVersion: '1.0.0',
          companyName: 'Mon Entreprise',
        },
      }
    }

    // Transformer les paramètres en objet
    const settingsMap = (settings || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    return {
      success: true,
      data: {
        siteName: settingsMap.site_name || 'Mon Application',
        appVersion: settingsMap.app_version || '1.0.0',
        companyName: settingsMap.company_name || 'Mon Entreprise',
      },
    }
  } catch (error) {
    // En cas d'erreur, retourner des valeurs par défaut
    return {
      success: true,
      data: {
        siteName: 'Mon Application',
        appVersion: '1.0.0',
        companyName: 'Mon Entreprise',
      },
    }
  }
} 