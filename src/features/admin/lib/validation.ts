import { z } from 'zod'
import { AdminActionResult } from '../types'

/**
 * Wrapper pour les actions admin avec validation et gestion d'erreur standardisée
 */
export async function withAdminValidation<T>(
  schema: z.ZodSchema,
  data: unknown,
  action: () => Promise<T>
): Promise<AdminActionResult<T>> {
  try {
    // Valider les données d'entrée
    const validatedData = schema.parse(data)
    
    // Exécuter l'action avec les données validées
    const result = await action()
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        error: 'Données invalides'
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    }
  }
}

/**
 * Wrapper pour les actions admin avec permissions et logging
 */
export async function withAdminAction<T>(
  permissions: string[],
  action: string,
  resource: string,
  resourceId?: string,
  handler: () => Promise<T>
): Promise<AdminActionResult<T>> {
  try {
    // Vérifier les permissions
    const { requireAdmin, logActivity } = await import('./permissions')
    await requireAdmin(permissions as any)
    
    // Exécuter l'action
    const result = await handler()
    
    // Logger l'activité
    await logActivity(action, resource, resourceId)
    
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error(`[ADMIN] Erreur dans ${action}:`, error)
    
    if (error instanceof Error) {
      if (error.message.includes('admin requis')) {
        return {
          success: false,
          error: 'Accès administrateur requis'
        }
      }
      
      if (error.message.includes('Permissions insuffisantes')) {
        return {
          success: false,
          error: 'Permissions insuffisantes pour cette action'
        }
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    }
  }
}

/**
 * Validation des filtres avec valeurs par défaut
 */
export function validateFilters<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams,
  defaults: Partial<T> = {}
): T {
  const params: Record<string, any> = { ...defaults }
  
  // Convertir les searchParams en objet
  for (const [key, value] of searchParams.entries()) {
    // Conversion automatique des types courants
    if (value === 'true' || value === 'false') {
      params[key] = value === 'true'
    } else if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value)
    } else {
      params[key] = value
    }
  }
  
  return schema.parse(params)
}

/**
 * Sanitize HTML content pour éviter les injections
 */
export function sanitizeHtml(content: string): string {
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validation d'email avec domaines bloqués
 */
export function validateEmailDomain(email: string, blockedDomains: string[] = []): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  
  const commonBlockedDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com'
  ]
  
  const allBlockedDomains = [...commonBlockedDomains, ...blockedDomains]
  return !allBlockedDomains.includes(domain)
}

/**
 * Génération de token sécurisé
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}