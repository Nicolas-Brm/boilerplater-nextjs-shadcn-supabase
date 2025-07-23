'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  AdminActionResult, 
  OrganizationWithStats, 
  Permission,
  OrganizationFiltersData,
  OrganizationFiltersSchema
} from '../types'
import { requireAdmin, logActivity } from '../lib/permissions'

interface PaginatedOrganizations {
  organizations: OrganizationWithStats[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Récupère la liste des organisations avec statistiques
 */
export async function getOrganizations(searchParams: URLSearchParams): Promise<AdminActionResult<PaginatedOrganizations>> {
  try {
    await requireAdmin([Permission.VIEW_ORGANIZATIONS])

    const supabase = await createClient()

    // Valider les filtres
    const filters = parseOrganizationFilters(searchParams)

    // Construction de la requête
    let orgQuery = supabase
      .from('organizations')
      .select('*', { count: 'exact' })

    // Application des filtres
    orgQuery = applyOrganizationFilters(orgQuery, filters)

    // Pagination
    const offset = (filters.page - 1) * filters.limit
    orgQuery = orgQuery
      .range(offset, offset + filters.limit - 1)
      .order('created_at', { ascending: false })

    const { data: organizations, error, count } = await orgQuery

    if (error) {
      throw new Error(`Erreur lors de la récupération des organisations: ${error.message}`)
    }

    // Enrichir avec les statistiques
    const organizationsWithStats = await enrichWithStats(organizations || [])
    
    const totalPages = Math.ceil((count || 0) / filters.limit)

    await logActivity('VIEW_ORGANIZATIONS', 'organizations', undefined, { 
      filters: { ...filters, total: count } 
    })

    return {
      success: true,
      data: {
        organizations: organizationsWithStats,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: count || 0,
          totalPages,
        },
      },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des organisations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère une organisation spécifique avec ses statistiques
 */
export async function getOrganization(organizationId: string): Promise<AdminActionResult<OrganizationWithStats>> {
  try {
    await requireAdmin([Permission.VIEW_ORGANIZATIONS])

    if (!organizationId) {
      throw new Error('ID organisation manquant')
    }

    const supabase = await createClient()

    // Récupérer l'organisation
    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error || !organization) {
      throw new Error('Organisation non trouvée')
    }

    // Enrichir avec les statistiques
    const [organizationWithStats] = await enrichWithStats([organization])

    await logActivity('VIEW_ORGANIZATION', 'organizations', organizationId)

    return {
      success: true,
      data: organizationWithStats,
    }
  } catch (error) {
    console.error(`[ADMIN] Erreur lors de la récupération de l'organisation ${organizationId}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère les membres d'une organisation
 */
export async function getOrganizationMembers(organizationId: string): Promise<AdminActionResult<any[]>> {
  try {
    await requireAdmin([Permission.VIEW_ORGANIZATIONS])

    const supabase = await createClient()

    // Récupérer les membres avec les profils utilisateur
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:user_profiles (
          id,
          first_name,
          last_name,
          role,
          is_active
        )
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la récupération des membres: ${error.message}`)
    }

    await logActivity('VIEW_ORGANIZATION_MEMBERS', 'organizations', organizationId)

    return {
      success: true,
      data: members || [],
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des membres:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Récupère les invitations d'une organisation
 */
export async function getOrganizationInvitations(organizationId: string): Promise<AdminActionResult<any[]>> {
  try {
    await requireAdmin([Permission.VIEW_ORGANIZATIONS])

    const supabase = await createClient()

    const { data: invitations, error } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erreur lors de la récupération des invitations: ${error.message}`)
    }

    await logActivity('VIEW_ORGANIZATION_INVITATIONS', 'organizations', organizationId)

    return {
      success: true,
      data: invitations || [],
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors de la récupération des invitations:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

/**
 * Suspend ou réactive une organisation
 */
export async function toggleOrganizationStatus(organizationId: string): Promise<AdminActionResult> {
  try {
    await requireAdmin([Permission.MANAGE_ORGANIZATIONS])

    const supabase = await createClient()

    // Récupérer le statut actuel
    const { data: organization, error: fetchError } = await supabase
      .from('organizations')
      .select('subscription_status, name')
      .eq('id', organizationId)
      .single()

    if (fetchError || !organization) {
      throw new Error('Organisation non trouvée')
    }

    const newStatus = organization.subscription_status === 'active' ? 'suspended' : 'active'

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ subscription_status: newStatus })
      .eq('id', organizationId)

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`)
    }

    await logActivity(
      newStatus === 'active' ? 'ACTIVATE_ORGANIZATION' : 'SUSPEND_ORGANIZATION',
      'organizations',
      organizationId,
      { organizationName: organization.name, newStatus }
    )

    return {
      success: true,
      data: { 
        message: `Organisation ${newStatus === 'active' ? 'réactivée' : 'suspendue'} avec succès`,
        status: newStatus 
      },
    }
  } catch (error) {
    console.error('[ADMIN] Erreur lors du changement de statut:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }
  }
}

// Fonctions utilitaires
function parseOrganizationFilters(searchParams: URLSearchParams): OrganizationFiltersData {
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

  return OrganizationFiltersSchema.parse(params)
}

function applyOrganizationFilters(query: any, filters: OrganizationFiltersData) {
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`
    query = query.or(
      `name.ilike.${searchTerm},description.ilike.${searchTerm}`
    )
  }

  if (filters.planType) {
    query = query.eq('plan_type', filters.planType)
  }

  if (filters.subscriptionStatus) {
    query = query.eq('subscription_status', filters.subscriptionStatus)
  }

  return query
}

async function enrichWithStats(organizations: any[]): Promise<OrganizationWithStats[]> {
  const supabase = await createClient()

  const enrichedOrganizations: OrganizationWithStats[] = []

  for (const org of organizations) {
    try {
      // Compter les membres
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      // Compter les membres actifs
      const { count: activeMembers } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          user_profiles!inner(is_active)
        `, { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .eq('user_profiles.is_active', true)

      // Activité récente (30 derniers jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: recentActivity } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('resource', 'organizations')
        .eq('resource_id', org.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      enrichedOrganizations.push({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        planType: org.plan_type,
        subscriptionStatus: org.subscription_status,
        createdAt: org.created_at,
        memberCount: memberCount || 0,
        activeMembers: activeMembers || 0,
        recentActivity: recentActivity || 0,
      })
    } catch (error) {
      console.error(`[ADMIN] Erreur lors de l'enrichissement de l'organisation ${org.id}:`, error)
      
      // Fallback sans statistiques
      enrichedOrganizations.push({
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        planType: org.plan_type,
        subscriptionStatus: org.subscription_status,
        createdAt: org.created_at,
        memberCount: 0,
        activeMembers: 0,
        recentActivity: 0,
      })
    }
  }

  return enrichedOrganizations
}