'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { type Organization, type OrganizationMember } from '../types'

export interface CurrentOrganizationData {
  organization: Organization | null
  membership: OrganizationMember | null
}

/**
 * Récupère l'organisation courante basée sur l'ID fourni
 * Cette fonction est utilisée côté serveur pour récupérer les données 
 * de l'organisation sélectionnée dans le contexte client
 */
export async function getCurrentOrganization(organizationId?: string): Promise<CurrentOrganizationData> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { organization: null, membership: null }
    }

    const supabase = await createClient()

    // Si un ID d'organisation est fourni, l'utiliser
    // Sinon, récupérer la première organisation de l'utilisateur
    let query = supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    } else {
      query = query.order('joined_at', { ascending: true }).limit(1)
    }

    const { data: membership, error: membershipError } = await query.single()

    if (membershipError || !membership) {
      return { organization: null, membership: null }
    }

    const org = membership.organizations as any

    return {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        website: org.website,
        logoUrl: org.logo_url,
        maxMembers: org.max_members,
        allowPublicSignup: org.allow_public_signup,
        requireApproval: org.require_approval,
        planType: org.plan_type,
        subscriptionStatus: org.subscription_status,
        createdAt: org.created_at,
        updatedAt: org.updated_at,
      },
      membership: {
        id: membership.id,
        organizationId: membership.organization_id,
        userId: membership.user_id,
        role: membership.role,
        isActive: membership.is_active,
        joinedAt: membership.joined_at,
        invitedBy: membership.invited_by,
        user: {
          id: user.id,
          email: user.email || '',
          firstName: '',
          lastName: '',
        }
      }
    }

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation courante:', error)
    return { organization: null, membership: null }
  }
}

/**
 * Hook pour récupérer simplement l'organisation courante
 */
export async function getCurrentOrganizationOnly(organizationId?: string): Promise<Organization | null> {
  const result = await getCurrentOrganization(organizationId)
  return result.organization
} 