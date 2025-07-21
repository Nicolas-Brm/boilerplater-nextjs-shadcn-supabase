'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  type AdminActionResult,
  type AdminStats,
  type ActivityLog,
  Permission,
  UserRole 
} from '../types'
import { getCurrentAdminUser, hasRole, hasPermission, requireAdmin, logActivity } from '../lib/permissions'

export async function getAdminStats(): Promise<AdminActionResult<AdminStats>> {
  try {
    // Get current admin user without redirects
    const adminUser = await getCurrentAdminUser()
    
    if (!adminUser) {
      throw new Error('AUTH_REQUIRED')
    }
    
    // Check admin permissions manually
    if (!hasRole(adminUser.role, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR])) {
      return {
        success: false,
        error: 'Accès admin requis'
      }
    }
    
    if (!hasPermission(adminUser.role, Permission.VIEW_ANALYTICS)) {
      return {
        success: false,
        error: 'Permissions insuffisantes'
      }
    }
    
    if (!adminUser.isActive) {
      return {
        success: false,
        error: 'Compte désactivé'
      }
    }

    const supabase = await createClient()

    // Récupérer les statistiques des utilisateurs
    const { data: totalUsersData } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })

    const { data: activeUsersData } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    // Calculer les nouveaux utilisateurs ce mois
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: newUsersData } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', startOfMonth.toISOString())

    // Simulations pour l'exemple (à remplacer par de vraies métriques)
    const stats: AdminStats = {
      totalUsers: totalUsersData?.length || 0,
      activeUsers: activeUsersData?.length || 0,
      newUsersThisMonth: newUsersData?.length || 0,
      totalContent: 0, // À implémenter selon votre contenu
      pendingModeration: 0, // À implémenter selon votre système de modération
      systemLoad: {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        storage: Math.floor(Math.random() * 100),
      },
    }

    await logActivity('VIEW_ANALYTICS', 'system')

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function getActivityLogs(
  page: number = 1,
  limit: number = 50,
  filters?: {
    userId?: string
    action?: string
    resource?: string
    startDate?: string
    endDate?: string
  }
): Promise<AdminActionResult<{
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}>> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    // Construire la requête
    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })

    // Appliquer les filtres
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters?.action) {
      query = query.ilike('action', `%${filters.action}%`)
    }

    if (filters?.resource) {
      query = query.eq('resource', filters.resource)
    }

    if (filters?.startDate) {
      // Ajouter l'heure de début de journée pour inclure toute la journée
      const startDateTime = `${filters.startDate}T00:00:00.000Z`
      query = query.gte('created_at', startDateTime)
    }

    if (filters?.endDate) {
      // Ajouter l'heure de fin de journée pour inclure toute la journée
      const endDateTime = `${filters.endDate}T23:59:59.999Z`
      query = query.lte('created_at', endDateTime)
    }

    // Appliquer la pagination
    const offset = (page - 1) * limit
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: logs, error, count } = await query

    if (error) {
      throw new Error(`Erreur lors de la récupération des logs: ${error.message}`)
    }

    const totalPages = Math.ceil((count || 0) / limit)

    const formattedLogs: ActivityLog[] = (logs || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      metadata: log.metadata || {},
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }))

    await logActivity('VIEW_LOGS', 'system', undefined, { filters })

    return {
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function getUserActivity(
  userId: string,
  limit: number = 20
): Promise<AdminActionResult<ActivityLog[]>> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Erreur lors de la récupération de l'activité: ${error.message}`)
    }

    const formattedLogs: ActivityLog[] = (logs || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      metadata: log.metadata || {},
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }))

    await logActivity('VIEW_USER_ACTIVITY', 'users', userId)

    return {
      success: true,
      data: formattedLogs,
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité utilisateur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

export async function exportLogs(
  filters?: {
    startDate?: string
    endDate?: string
    userId?: string
    action?: string
  }
): Promise<AdminActionResult<{ downloadUrl: string }>> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_LOGS])

    const supabase = await createClient()

    // Construire la requête pour récupérer tous les logs correspondants
    let query = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })

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
      throw new Error(`Erreur lors de l'export des logs: ${error.message}`)
    }

    // Formatage en CSV
    const csvHeaders = [
      'ID',
      'User ID',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'User Agent',
      'Created At',
      'Metadata'
    ].join(',')

    const csvRows = (logs || []).map(log => [
      log.id,
      log.user_id,
      log.action,
      log.resource,
      log.resource_id || '',
      log.ip_address,
      `"${log.user_agent}"`,
      log.created_at,
      `"${JSON.stringify(log.metadata || {})}"`
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    // Dans un vrai environnement, vous stockeriez le fichier et retourneriez l'URL
    // Ici on simule avec un blob URL
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const downloadUrl = URL.createObjectURL(blob)

    await logActivity('EXPORT_LOGS', 'system', undefined, { filters })

    return {
      success: true,
      data: { downloadUrl },
    }
  } catch (error) {
    console.error('Erreur lors de l\'export des logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'export',
    }
  }
} 