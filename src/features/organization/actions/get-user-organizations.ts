'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { type Organization, type OrganizationMember, OrganizationRole } from '../types'

export interface UserOrganizationMembership {
  organization: Organization
  membership: Pick<OrganizationMember, 'id' | 'organizationId' | 'userId' | 'role' | 'isActive' | 'joinedAt' | 'invitedBy'>
}

export async function getUserOrganizations(): Promise<UserOrganizationMembership[]> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }

    const supabase = await createClient()

    // Récupérer toutes les adhésions actives de l'utilisateur avec les détails de l'organisation
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        is_active,
        joined_at,
        invited_by,
        organizations!inner (
          id,
          name,
          slug,
          description,
          website,
          logo_url,
          max_members,
          allow_public_signup,
          require_approval,
          plan_type,
          subscription_status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (error) {
      console.error('Erreur lors de la récupération des organisations:', error)
      return []
    }

    if (!memberships || memberships.length === 0) {
      return []
    }

    // Transformer les données en format attendu
    return memberships.map((membership: any) => ({
      organization: {
        id: membership.organizations.id,
        name: membership.organizations.name,
        slug: membership.organizations.slug,
        description: membership.organizations.description,
        website: membership.organizations.website,
        logoUrl: membership.organizations.logo_url,
        maxMembers: membership.organizations.max_members,
        allowPublicSignup: membership.organizations.allow_public_signup,
        requireApproval: membership.organizations.require_approval,
        planType: membership.organizations.plan_type,
        subscriptionStatus: membership.organizations.subscription_status,
        createdAt: membership.organizations.created_at,
        updatedAt: membership.organizations.updated_at,
      },
      membership: {
        id: membership.id,
        organizationId: membership.organizations.id,
        userId: user.id,
        role: membership.role as OrganizationRole,
        isActive: membership.is_active,
        joinedAt: membership.joined_at,
        invitedBy: membership.invited_by,
      }
    }))

  } catch (error) {
    console.error('Erreur dans getUserOrganizations:', error)
    return []
  }
} 