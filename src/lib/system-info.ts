'use server'

import { createClient } from '@/lib/supabase/server'

export interface SystemInfo {
  siteName: string
  appVersion: string
  companyName: string
}

export async function getSystemInfo(): Promise<SystemInfo> {
  try {
    const supabase = await createClient()

    // Récupérer les paramètres système publics
    const { data: settings } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['site_name', 'app_version', 'company_name'])

    if (!settings || settings.length === 0) {
      // Retourner des valeurs par défaut
      return {
        siteName: 'Boilerplate Next.js Pro',
        appVersion: '1.2.3',
        companyName: 'Boilerplate Solutions',
      }
    }

    // Transformer les paramètres en objet
    const settingsMap = settings.reduce((acc, setting) => {
      // Les valeurs sont stockées en JSONB, on peut les utiliser directement
      acc[setting.key] = typeof setting.value === 'string' ? setting.value : setting.value
      return acc
    }, {} as Record<string, any>) // eslint-disable-line @typescript-eslint/no-explicit-any

    return {
      siteName: settingsMap.site_name || 'Boilerplate Next.js Pro',
      appVersion: settingsMap.app_version || '1.2.3',
      companyName: settingsMap.company_name || 'Boilerplate Solutions',
    }
  } catch {
    // En cas d'erreur, retourner des valeurs par défaut
    return {
      siteName: 'Boilerplate Next.js Pro',
      appVersion: '1.2.3',
      companyName: 'Boilerplate Solutions',
    }
  }
} 