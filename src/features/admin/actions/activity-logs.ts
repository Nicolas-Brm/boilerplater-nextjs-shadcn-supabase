'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  AdminActionResult, 
  ActivityLog, 
  Permission,
  ActivityLogFiltersData,
  ActivityLogFiltersSchema
} from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'

interface PaginatedActivityLogs {
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Récupère les logs d'activité avec filtres
 */
export async function getActivityLogs(searchParams: URLSearchParams): Promise<AdminActionResult<PaginatedActivityLogs>> {
  try {
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    // Valider les filtres
    const filters = parseActivityLogFilters(searchParams)

    // Construction de la requête (sans join pour éviter les problèmes de relation)
    let logsQuery = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })

    // Application des filtres
    logsQuery = applyActivityLogFilters(logsQuery, filters)

    // Pagination
    const offset = (filters.page - 1) * filters.limit
    logsQuery = logsQuery
      .range(offset, offset + filters.limit - 1)
      .order('created_at', { ascending: false })

    const { data: rawLogs, error, count } = await logsQuery

    if (error) {
      throw new Error(`Erreur lors de la récupération des logs: ${error.message}`)
    }

    // Formater les logs (sans données utilisateur pour éviter les problèmes de relation)
    const logs: ActivityLog[] = (rawLogs || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      metadata: log.metadata || {},
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
      user: undefined // Temporairement désactivé pour éviter les erreurs de relation
    }))
    
    const totalPages = Math.ceil((count || 0) / filters.limit)

    await logActivity('VIEW_ACTIVITY_LOGS', 'system', undefined, { 
      filters: { ...filters, total: count } 
    })

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: count || 0,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère l'activité d'un utilisateur spécifique
 */
export async function getUserActivity(userId: string, limit: number = 20): Promise<AdminActionResult<ActivityLog[]>> {
  try {
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    const { data: rawLogs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'activité: ${error.message}`)
    }

    const logs: ActivityLog[] = (rawLogs || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      metadata: log.metadata || {},
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
      user: undefined // Temporairement désactivé pour éviter les erreurs de relation
    }))

    await logActivity('VIEW_USER_ACTIVITY', 'users', userId)

    return {
      success: true,
      data: logs,
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération de l\'activité utilisateur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère les statistiques d'activité
 */
export async function getActivityStats(): Promise<AdminActionResult<{
  totalLogs: number
  logsToday: number
  logsThisWeek: number
  topActions: Array<{ action: string; count: number }>
  topUsers: Array<{ userId: string; email: string; count: number }>
}>> {
  try {
    await requireAdmin([Permission.VIEW_ANALYTICS])

    const supabase = await createClient()

    // Dates de référence
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    // Requêtes parallèles
    const [
      { count: totalLogs },
      { count: logsToday },
      { count: logsThisWeek },
      { data: actionCounts },
      { data: userCounts }
    ] = await Promise.all([
      // Total des logs
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true }),
      
      // Logs aujourd'hui
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      
      // Logs cette semaine
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
      
      // Actions les plus fréquentes
      supabase
        .from('activity_logs')
        .select('action')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000),
      
      // Utilisateurs les plus actifs (sans join pour éviter les erreurs)
      supabase
        .from('activity_logs')
        .select('user_id')
        .gte('created_at', weekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000)
    ])

    // Analyser les actions
    const actionMap: Record<string, number> = {}
    actionCounts?.forEach(log => {
      actionMap[log.action] = (actionMap[log.action] || 0) + 1
    })

    const topActions = Object.entries(actionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }))

    // Analyser les utilisateurs (sans email pour éviter les erreurs de relation)
    const userMap: Record<string, number> = {}
    userCounts?.forEach(log => {
      if (log.user_id) {
        userMap[log.user_id] = (userMap[log.user_id] || 0) + 1
      }
    })

    const topUsers = Object.entries(userMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, email: 'Email non disponible', count }))

    return {
      success: true,
      data: {
        totalLogs: totalLogs || 0,
        logsToday: logsToday || 0,
        logsThisWeek: logsThisWeek || 0,
        topActions,
        topUsers
      }
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des statistiques d\'activité:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Exporte les logs en CSV
 */
export async function exportActivityLogs(filters?: {
  startDate?: string
  endDate?: string
  userId?: string
  action?: string
}): Promise<AdminActionResult<{ csvContent: string }>> {
  try {
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    // Construire la requête (sans join pour éviter les erreurs de relation)
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000) // Limite de sécurité

    // Appliquer les filtres
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.action) {
      query = query.ilike('action', `%${filters.action}%`)
    }

    const { data: logs, error } = await query

    if (error) {
      throw new Error(`Erreur lors de l'export: ${error.message}`)
    }

    // Génération du CSV
    const csvHeaders = [
      'ID',
      'Date',
      'Utilisateur',
      'Email',
      'Action',
      'Ressource',
      'Ressource ID',
      'Adresse IP',
      'Métadonnées'
    ].join(',')

    const csvRows = (logs || []).map(log => [
      log.id,
      log.created_at,
      'Utilisateur non disponible', // Temporairement sans données utilisateur
      'Email non disponible', // Temporairement sans données utilisateur
      log.action,
      log.resource,
      log.resource_id || '',
      log.ip_address,
      `"${JSON.stringify(log.metadata || {})}"`
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    await logActivity('EXPORT_ACTIVITY_LOGS', 'system', undefined, { filters, exportedCount: logs?.length || 0 })

    return {
      success: true,
      data: { csvContent },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de l\'export:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export',
    }
  }
}

// Fonctions utilitaires
function parseActivityLogFilters(searchParams: URLSearchParams): ActivityLogFiltersData {
  const params: Record<string, any> = {}
  
  for (const [key, value] of searchParams.entries()) {
    // Skip "all" values as they mean no filter
    if (value === 'all' || value === '') {
      continue
    }
    
    if (!isNaN(Number(value)) && value !== '') {
      params[key] = Number(value)
    } else if (value !== '') {
      params[key] = value
    }
  }

  return ActivityLogFiltersSchema.parse(params)
}

function applyActivityLogFilters(query: any, filters: ActivityLogFiltersData) {
  if (filters.userId) {
    query = query.eq('user_id', filters.userId)
  }

  if (filters.action) {
    query = query.ilike('action', `%${filters.action}%`)
  }

  if (filters.resource) {
    query = query.eq('resource', filters.resource)
  }

  if (filters.startDate) {
    const startDateTime = `${filters.startDate}T00:00:00.000Z`
    query = query.gte('created_at', startDateTime)
  }

  if (filters.endDate) {
    const endDateTime = `${filters.endDate}T23:59:59.999Z`
    query = query.lte('created_at', endDateTime)
  }

  return query
}