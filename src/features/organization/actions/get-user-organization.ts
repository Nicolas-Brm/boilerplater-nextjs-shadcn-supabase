'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { type Organization, type OrganizationMember } from '../types'

interface UserOrganizationData {
  organization: Organization | null
  membership: OrganizationMember | null
}

export async function getCurrentUserOrganization(): Promise<UserOrganizationData> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { organization: null, membership: null }
    }

    const supabase = await createClient()

    // Récupérer la première organisation de l'utilisateur (par date d'adhésion)
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations (*)
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single()

    if (membershipError || !membership) {
      return { organization: null, membership: null }
    }

    return {
      organization: membership.organizations as Organization,
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
    console.error('Erreur lors de la récupération de l\'organisation:', error)
    return { organization: null, membership: null }
  }
} 