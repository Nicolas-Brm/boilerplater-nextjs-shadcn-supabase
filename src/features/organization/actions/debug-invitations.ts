'use server'

import { createClient } from '@/lib/supabase/server'

// Format des invitations avec plus d'infos
export interface DebugInvitationInfo {
  id: string
  email: string
  role: string
  message?: string
  token: string
  organization_id: string
  organization_name?: string
  created_at: string
  expires_at: string
  invited_by: string
  inviter_email?: string
  isExpired: boolean
  inviteLink: string
  timeUntilExpiry: number
}

export async function debugInvitations(organizationId?: string) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (id, name)
      `)
      .order('created_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: invitations, error } = await query

    if (error) {
      console.error('Erreur lors de la récupération des invitations:', error)
      return { error: error.message, invitations: [] }
    }

    const now = new Date().toISOString()
    
    // Récupérer les emails des inviteurs
    const inviterIds = [...new Set(invitations?.map(inv => inv.invited_by) || [])]
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .in('id', inviterIds)

    const { data: authUsers } = await supabase
      .from('auth.users')
      .select('id, email')
      .in('id', inviterIds)

    const invitationsWithDetails = invitations?.map(inv => {
      const profile = profiles?.find(p => p.id === inv.invited_by)
      const authUser = authUsers?.find(u => u.id === inv.invited_by)
      const isExpired = new Date(inv.expires_at) <= new Date(now)
      const timeUntilExpiry = new Date(inv.expires_at).getTime() - new Date(now).getTime()
      
      return {
        ...inv,
        organization_name: (inv.organizations as any)?.name,
        inviter_email: authUser?.email,
        inviter_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Inconnu',
        isExpired,
        timeUntilExpiry,
        inviteLink: `/invite/${inv.token}`,
        fullInviteLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${inv.token}`
      }
    }) || []
    
    return {
      invitations: invitationsWithDetails,
      totalCount: invitationsWithDetails.length || 0,
      error: null,
      timestamp: now
    }

  } catch (error) {
    console.error('Erreur dans debugInvitations:', error)
    return { 
      error: (error as Error).message,
      invitations: [],
      totalCount: 0
    }
  }
}

// Vérifier si l'index sur le token existe
export async function checkTokenIndex() {
  try {
    const supabase = await createClient()
    
    // Vérifier si l'index existe
    const { data, error } = await supabase.rpc('check_index_exists', {
      table_name: 'organization_invitations',
      index_name: 'organization_invitations_token_idx'
    })
    
    if (error) {
      console.error('❌ [checkTokenIndex] Erreur lors de la vérification de l\'index:', error)
      return { 
        success: false, 
        error: error.message,
        exists: false
      }
    }
    
    // Si l'index n'existe pas et qu'on est en environnement de développement, le créer
    if (!data && process.env.NODE_ENV === 'development') {
      const { error: createError } = await supabase.rpc('create_token_index')
      
      if (createError) {
        console.error('❌ [checkTokenIndex] Erreur lors de la création de l\'index:', createError)
        return {
          success: false,
          error: createError.message,
          exists: false,
          created: false
        }
      }
      
      return {
        success: true,
        exists: false,
        created: true,
        message: 'Index créé avec succès'
      }
    }
    
    return {
      success: true,
      exists: !!data,
      message: data ? 'Index existant' : 'Index non trouvé'
    }
    
  } catch (error) {
    console.error('❌ [checkTokenIndex] Erreur inattendue:', error)
    return { 
      success: false, 
      error: (error as Error).message,
      exists: false
    }
  }
}

export async function debugSpecificInvitation(token: string) {
  try {
    console.log('🔍 [debugSpecificInvitation] Recherche détaillée pour token:', token)
    const supabase = await createClient()

    // 1. Rechercher l'invitation par token (toutes les invitations pour le debug)
    const { data: invitations, error: invError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('token', token)

    console.log('🔍 [debugSpecificInvitation] Invitations trouvées:', invitations?.length || 0)
    
    if (invError) {
      console.error('❌ [debugSpecificInvitation] Erreur recherche invitation:', invError)
      return {
        found: false,
        error: invError.message,
        invitation: null,
        organization: null,
        debugInfo: {
          searchedToken: token,
          errorCode: invError.code,
          errorDetails: invError.details
        }
      }
    }

    if (!invitations || invitations.length === 0) {
      console.log('❌ [debugSpecificInvitation] Aucune invitation trouvée avec ce token')
      
      // Rechercher toutes les invitations pour debug
      const { data: allInvitations } = await supabase
        .from('organization_invitations')
        .select('token, email, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        found: false,
        error: 'Invitation non trouvée',
        invitation: null,
        organization: null,
        debugInfo: {
          searchedToken: token,
          recentInvitations: allInvitations?.map(inv => ({
            token: inv.token.substring(0, 8) + '...',
            email: inv.email,
            created: inv.created_at
          })) || []
        }
      }
    }

    const invitation = invitations[0]
    console.log('✅ [debugSpecificInvitation] Invitation trouvée:', invitation.id)

    // 2. Récupérer l'organisation
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', invitation.organization_id)
      .maybeSingle()  // ✅ Utiliser maybeSingle() ici aussi

    if (orgError) {
      console.error('❌ [debugSpecificInvitation] Erreur récupération organisation:', orgError)
    }

    // 3. Vérifier l'expiration
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    const isExpired = expiresAt <= now
    const timeUntilExpiry = expiresAt.getTime() - now.getTime()

    console.log('🔍 [debugSpecificInvitation] Analyse expiration:')
    console.log('  - Maintenant:', now.toISOString())
    console.log('  - Expire le:', invitation.expires_at)
    console.log('  - Expirée?:', isExpired)
    console.log('  - Temps restant (ms):', timeUntilExpiry)

    // Récupérer les détails de l'inviteur
    const { data: inviterProfile } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name')
      .eq('id', invitation.invited_by)
      .maybeSingle()  // ✅ Utiliser maybeSingle() ici aussi

    const { data: inviterAuth } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', invitation.invited_by)
      .maybeSingle()  // ✅ Utiliser maybeSingle() ici aussi

    const inviteLink = `/invite/${invitation.token}`
    const fullInviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.token}`
    
    return {
      found: true,
      error: null,
      invitation: {
        ...invitation,
        isExpired,
        timeUntilExpiry,
        expiresAtFormatted: expiresAt.toLocaleString('fr-FR'),
        createdAtFormatted: new Date(invitation.created_at).toLocaleString('fr-FR'),
        inviteLink,
        fullInviteLink,
        inviter: {
          name: inviterProfile ? `${inviterProfile.first_name} ${inviterProfile.last_name}` : 'Inconnu',
          email: inviterAuth?.email || 'Inconnu'
        }
      },
      organization,
      debugInfo: {
        searchedToken: token,
        foundToken: invitation.token,
        tokensMatch: token === invitation.token,
        currentTime: now.toISOString(),
        expirationTime: invitation.expires_at,
        isExpired,
        hoursUntilExpiry: Math.round(timeUntilExpiry / (1000 * 60 * 60) * 100) / 100,
        inviteLink,
        fullInviteLink
      }
    }

  } catch (error) {
    console.error('❌ [debugSpecificInvitation] Erreur inattendue:', error)
    return {
      found: false,
      error: (error as Error).message,
      invitation: null,
      organization: null,
      debugInfo: {
        searchedToken: token,
        unexpectedError: true
      }
    }
  }
} 