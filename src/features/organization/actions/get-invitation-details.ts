'use server'

import { createClient } from '@/lib/supabase/server'
import { InvitationStatus } from '../types'

export interface InvitationDetails {
  id: string
  email: string
  role: string
  message?: string
  expiresAt: string
  createdAt: string
  organization: {
    id: string
    name: string
    description?: string
    logoUrl?: string
  }
  invitedBy: {
    firstName?: string
    lastName?: string
    email: string
  }
}

export async function getInvitationDetails(token: string): Promise<InvitationDetails | null> {
  try {
    console.log('🔍 [getInvitationDetails] Recherche invitation avec token:', token)
    const supabase = await createClient()

    // Debug: Rechercher d'abord toutes les invitations avec ce token (sans filtrer par expiration)
    const { data: allInvitations, error: debugError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('token', token)

    console.log('🔍 [getInvitationDetails] Toutes les invitations avec ce token:', allInvitations)
    console.log('🔍 [getInvitationDetails] Erreur debug:', debugError)

    // Vérifier l'expiration
    const now = new Date().toISOString()
    console.log('🔍 [getInvitationDetails] Date actuelle:', now)
    
    if (allInvitations && allInvitations.length > 0) {
      const invitation = allInvitations[0]
      console.log('🔍 [getInvitationDetails] Invitation trouvée:')
      console.log('  - ID:', invitation.id)
      console.log('  - Email:', invitation.email)
      console.log('  - Expire le:', invitation.expires_at)
      console.log('  - Expirée?:', invitation.expires_at <= now)
    }

    // Requête principale avec filtre d'expiration
    const { data: invitation, error } = await supabase
      .from('organization_invitations')
      .select(`
        id,
        email,
        role,
        message,
        expires_at,
        created_at,
        invited_by,
        organization_id,
        organizations!inner (
          id,
          name,
          description,
          logo_url
        )
      `)
      .eq('token', token)
      .eq('status', InvitationStatus.PENDING)
      .gt('expires_at', now)
      .maybeSingle()  // ✅ Utilise maybeSingle() au lieu de single()

    if (error) {
      console.error('❌ [getInvitationDetails] Erreur lors de la récupération de l\'invitation:', error)
      return null
    }

    if (!invitation) {
      console.log('❌ [getInvitationDetails] Aucune invitation trouvée')
      return null
    }

    console.log('✅ [getInvitationDetails] Invitation valide trouvée:', invitation.id)

    // Récupérer les détails de l'inviteur
    console.log('🔍 [getInvitationDetails] Récupération du profil de l\'inviteur:', invitation.invited_by)
    const { data: inviterProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', invitation.invited_by)
      .maybeSingle()  // ✅ Utiliser maybeSingle() ici aussi

    if (profileError) {
      console.log('⚠️ [getInvitationDetails] Erreur récupération profil inviteur:', profileError)
    }

    // L'email de l'inviteur est maintenant stocké directement dans l'invitation
    console.log('🔍 [getInvitationDetails] Email inviteur récupéré depuis l\'invitation')

    const result = {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      message: invitation.message,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
      organization: {
        id: (invitation.organizations as any).id,
        name: (invitation.organizations as any).name,
        description: (invitation.organizations as any).description,
        logoUrl: (invitation.organizations as any).logo_url,
      },
      invitedBy: {
        firstName: inviterProfile?.first_name,
        lastName: inviterProfile?.last_name,
        email: 'Utilisateur inconnu', // Temporaire - on pourra améliorer plus tard
      }
    }

    console.log('✅ [getInvitationDetails] Détails complets récupérés:', result.organization.name)
    return result

  } catch (error) {
    console.error('❌ [getInvitationDetails] Erreur inattendue:', error)
    return null
  }
} 