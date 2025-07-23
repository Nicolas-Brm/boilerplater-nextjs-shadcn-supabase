'use server'

import { createClient } from '@/lib/supabase/server'
import { AdminActionResult, AdminStats, Permission } from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'

/**
 * Récupère les statistiques admin avec vraies données
 */
export async function getAdminStats(): Promise<AdminActionResult<AdminStats>> {
  try {
    // Vérifier les permissions admin
    await requireAdmin([Permission.VIEW_ANALYTICS])

    const supabase = await createClient()

    // Récupération parallèle des vraies statistiques
    const [
      { count: totalUsersCount },
      { count: activeUsersCount },
      { count: newUsersCount },
      { count: totalOrganizationsCount },
      { count: activeOrganizationsCount },
      { count: recentActivitiesCount }
    ] = await Promise.all([
      // Utilisateurs totaux
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Utilisateurs actifs
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Nouveaux utilisateurs ce mois
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', getStartOfMonth()),
      
      // Organisations totales
      supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true }),
      
      // Organisations actives
      supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),
      
      // Activités récentes (7 derniers jours)
      supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', getSevenDaysAgo())
    ])

    const stats: AdminStats = {
      totalUsers: totalUsersCount || 0,
      activeUsers: activeUsersCount || 0,
      newUsersThisMonth: newUsersCount || 0,
      totalOrganizations: totalOrganizationsCount || 0,
      activeOrganizations: activeOrganizationsCount || 0,
      recentActivities: recentActivitiesCount || 0,
    }

    // Logger l'accès aux stats
    await logActivity('VIEW_ADMIN_STATS', 'system')

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des statistiques:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère les statistiques détaillées des utilisateurs
 */
export async function getUserStats(): Promise<AdminActionResult<{
  usersByRole: Record<string, number>
  usersByMonth: Array<{ month: string; count: number }>
  activeUsersLast30Days: number
}>> {
  try {
    await requireAdmin([Permission.VIEW_ANALYTICS])

    const supabase = await createClient()

    // Récupération des utilisateurs par rôle
    const { data: usersByRole } = await supabase
      .from('user_profiles')
      .select('role')

    // Compter par rôle
    const roleCounts = usersByRole?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Utilisateurs des 6 derniers mois
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: recentUsers } = await supabase
      .from('user_profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    // Grouper par mois
    const usersByMonth = groupUsersByMonth(recentUsers || [])

    // Utilisateurs actifs derniers 30 jours (ayant une activité)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: activeUsersLast30Days } = await supabase
      .from('activity_logs')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())

    return {
      success: true,
      data: {
        usersByRole: roleCounts,
        usersByMonth,
        activeUsersLast30Days: activeUsersLast30Days || 0
      }
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des stats utilisateurs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère les statistiques des organisations
 */
export async function getOrganizationStats(): Promise<AdminActionResult<{
  organizationsByPlan: Record<string, number>
  organizationGrowth: Array<{ month: string; count: number }>
  averageMembersPerOrg: number
}>> {
  try {
    await requireAdmin([Permission.VIEW_ORGANIZATIONS])

    const supabase = await createClient()

    // Organisations par plan
    const { data: organizations } = await supabase
      .from('organizations')
      .select('plan_type, created_at')

    const organizationsByPlan = organizations?.reduce((acc, org) => {
      acc[org.plan_type] = (acc[org.plan_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Croissance des organisations (6 derniers mois)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: recentOrgs } = await supabase
      .from('organizations')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    const organizationGrowth = groupUsersByMonth(recentOrgs || [])

    // Nombre moyen de membres par organisation
    const { data: memberCounts } = await supabase
      .from('organization_members')
      .select('organization_id')

    const totalMembers = memberCounts?.length || 0
    const totalOrgs = organizations?.length || 1
    const averageMembersPerOrg = Math.round(totalMembers / totalOrgs)

    return {
      success: true,
      data: {
        organizationsByPlan,
        organizationGrowth,
        averageMembersPerOrg
      }
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des stats organisations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

// Fonctions utilitaires
function getStartOfMonth(): string {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

function getSevenDaysAgo(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return date.toISOString()
}

function groupUsersByMonth(users: Array<{ created_at: string }>): Array<{ month: string; count: number }> {
  const monthCounts: Record<string, number> = {}
  
  users.forEach(user => {
    const date = new Date(user.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1
  })

  return Object.entries(monthCounts)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}