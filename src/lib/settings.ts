import { createClient } from '@/lib/supabase/server'

/**
 * Récupère les paramètres publics du site depuis la base de données
 * Cette fonction peut être utilisée dans les composants serveur sans restriction d'admin
 * Fonctionne même pour les utilisateurs non connectés
 */
export async function getPublicSettings() {
  // Valeurs par défaut à retourner en cas d'erreur ou si pas de données
  const defaultSettings = {
    siteName: 'Boilerplate Next.js Pro',
    siteDescription: 'A modern and secure platform built with Next.js 15, Supabase, and Shadcn/UI. Perfect for quickly starting your web projects with authentication, user management, and a complete admin interface.',
    appVersion: '1.2.3',
    companyName: 'Boilerplate Solutions'
  }

  try {
    const supabase = await createClient()
    
    // Récupérer seulement les paramètres publics nécessaires
    // Utilisation d'une requête simple sans vérification d'auth
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['site_name', 'site_description', 'app_version', 'company_name'])

    // Si erreur ou pas de données, retourner les valeurs par défaut
    if (error || !settings || settings.length === 0) {
      console.log('Using default settings:', error?.message || 'No data found')
      return defaultSettings
    }

    // Parser les valeurs JSON et créer un objet simplifié
    const settingsMap = (settings || []).reduce((acc, setting) => {
      try {
        // Essayer de parser comme JSON d'abord
        acc[setting.key] = JSON.parse(setting.value)
      } catch {
        // Si le parsing JSON échoue, utiliser la valeur telle quelle
        acc[setting.key] = setting.value
      }
      return acc
    }, {} as Record<string, any>)

    return {
      siteName: settingsMap.site_name || defaultSettings.siteName,
      siteDescription: settingsMap.site_description || defaultSettings.siteDescription,
      appVersion: settingsMap.app_version || defaultSettings.appVersion,
      companyName: settingsMap.company_name || defaultSettings.companyName
    }
  } catch (error) {
    console.log('Error in getPublicSettings, using defaults:', error)
    // Toujours retourner les valeurs par défaut en cas d'erreur
    return defaultSettings
  }
}

/**
 * Récupère uniquement le nom du site
 */
export async function getSiteName(): Promise<string> {
  const settings = await getPublicSettings()
  return settings.siteName
} 