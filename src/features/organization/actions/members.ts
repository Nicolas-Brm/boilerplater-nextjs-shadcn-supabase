'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  InviteMemberSchema,
  UpdateMemberRoleSchema,
  type OrganizationActionResult,
  type OrganizationMember,
  OrganizationRole,
  InvitationStatus 
} from '../types'
import { getCurrentUser } from '@/lib/auth'

// Récupérer les membres d'une organisation
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = await createClient()
  
  // Récupérer d'abord les membres
  const { data: members, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('joined_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des membres:', error)
    return []
  }

  if (!members || members.length === 0) {
    return []
  }

  // Récupérer les profils utilisateur séparément
  const userIds = members.map(member => member.user_id)
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name')
    .in('id', userIds)

  // Combiner les données
  return members.map(member => {
    const profile = profiles?.find(p => p.id === member.user_id)
    
    return {
      id: member.id,
      organizationId: member.organization_id,
      userId: member.user_id,
      role: member.role as OrganizationRole,
      isActive: member.is_active,
      joinedAt: member.joined_at,
      invitedBy: member.invited_by,
      user: {
        id: member.user_id,
        email: '', // Sera récupéré séparément pour la sécurité
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
      }
    }
  })
}

// Inviter un nouveau membre
export async function inviteMember(
  organizationId: string,
  formData: FormData
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier les permissions
    const supabase = await createClient()
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { success: false, error: 'Permissions insuffisantes' }
    }

    // Valider les données
    const validatedFields = InviteMemberSchema.safeParse({
      email: formData.get('email'),
      role: formData.get('role') || OrganizationRole.MEMBER,
      message: formData.get('message') || undefined,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', data.email)
      .single()

    if (existingUser) {
      // Vérifier s'il est déjà membre
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMember) {
        return { success: false, error: 'Cette personne est déjà membre de l\'organisation' }
      }
    }

    // Vérifier la limite de membres
    const { data: organization } = await supabase
      .from('organizations')
      .select('max_members')
      .eq('id', organizationId)
      .single()

    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (memberCount && organization && memberCount >= organization.max_members) {
      return { success: false, error: 'L\'organisation a atteint sa limite de membres' }
    }

    // Vérifier s'il y a déjà une invitation en attente
    const { data: existingInvitation } = await supabase
      .from('organization_invitations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('email', data.email)
      .eq('status', InvitationStatus.PENDING)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      return { success: false, error: 'Une invitation est déjà en attente pour cette adresse email' }
    }

    // Créer l'invitation
    const invitationToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

    const { error: invitationError } = await supabase
      .from('organization_invitations')
      .insert({
        organization_id: organizationId,
        email: data.email,
        role: data.role,
        message: data.message,
        token: invitationToken,
        status: InvitationStatus.PENDING,
        expires_at: expiresAt.toISOString(),
        invited_by: user.id
      })

    if (invitationError) {
      console.error('Erreur lors de la création de l\'invitation:', invitationError)
      return { success: false, error: 'Erreur lors de la création de l\'invitation' }
    }

    // TODO: Envoyer l'email d'invitation
    // await sendInvitationEmail(data.email, invitationToken, organization.name)

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    
    return { 
      success: true, 
      data: { 
        invitationToken,
        message: 'Invitation envoyée avec succès' 
      }
    }

  } catch (error) {
    console.error('Erreur dans inviteMember:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Modifier le rôle d'un membre
export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  formData: FormData
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Vérifier les permissions
    const { data: currentUserMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!currentUserMembership || currentUserMembership.role !== 'owner') {
      return { success: false, error: 'Seuls les propriétaires peuvent modifier les rôles' }
    }

    // Valider les données
    const validatedFields = UpdateMemberRoleSchema.safeParse({
      role: formData.get('role'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { role } = validatedFields.data

    // Récupérer le membre à modifier
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single()

    if (!targetMember) {
      return { success: false, error: 'Membre non trouvé' }
    }

    // Empêcher de modifier son propre rôle
    if (targetMember.user_id === user.id) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
    }

    // Empêcher de rétrograder le dernier propriétaire
    if (targetMember.role === OrganizationRole.OWNER && role !== OrganizationRole.OWNER) {
      const { count: ownerCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', OrganizationRole.OWNER)
        .eq('is_active', true)

      if (ownerCount === 1) {
        return { success: false, error: 'Il doit y avoir au moins un propriétaire dans l\'organisation' }
      }
    }

    // Mettre à jour le rôle
    const { error: updateError } = await supabase
      .from('organization_members')
      .update({ role })
      .eq('id', memberId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour du rôle:', updateError)
      return { success: false, error: 'Erreur lors de la mise à jour du rôle' }
    }

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    
    return { 
      success: true, 
      data: { message: 'Rôle mis à jour avec succès' }
    }

  } catch (error) {
    console.error('Erreur dans updateMemberRole:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Supprimer un membre
export async function removeMember(
  organizationId: string,
  memberId: string
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Vérifier les permissions
    const { data: currentUserMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Récupérer le membre à supprimer
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('organization_id', organizationId)
      .single()

    if (!targetMember) {
      return { success: false, error: 'Membre non trouvé' }
    }

    // Vérifier les permissions
    const canRemove = (
      currentUserMembership?.role === 'owner' ||
      (currentUserMembership?.role === 'admin' && targetMember.role !== 'owner') ||
      targetMember.user_id === user.id // Un utilisateur peut se retirer lui-même
    )

    if (!canRemove) {
      return { success: false, error: 'Permissions insuffisantes' }
    }

    // Empêcher de supprimer le dernier propriétaire
    if (targetMember.role === OrganizationRole.OWNER) {
      const { count: ownerCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', OrganizationRole.OWNER)
        .eq('is_active', true)

      if (ownerCount === 1) {
        return { success: false, error: 'Il doit y avoir au moins un propriétaire dans l\'organisation' }
      }
    }

    // Supprimer complètement le membre de la base de données
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)

    if (deleteError) {
      console.error('Erreur lors de la suppression du membre:', deleteError)
      return { success: false, error: 'Erreur lors de la suppression du membre' }
    }

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    
    const message = targetMember.user_id === user.id 
      ? 'Vous avez quitté l\'organisation'
      : 'Membre supprimé avec succès'
    
    return { 
      success: true, 
      data: { message }
    }

  } catch (error) {
    console.error('Erreur dans removeMember:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Récupérer l'historique complet des invitations (pour les admins)
export async function getAllInvitations(organizationId: string) {
  const supabase = await createClient()
  
  const { data: invitations, error } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération de l\'historique des invitations:', error)
    return []
  }

  return invitations
}

// Récupérer les invitations en attente
export async function getPendingInvitations(organizationId: string) {
  const supabase = await createClient()
  
  const { data: invitations, error } = await supabase
    .from('organization_invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', InvitationStatus.PENDING)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des invitations:', error)
    return []
  }

  return invitations
}

// Quitter une organisation (pour l'utilisateur actuel)
export async function leaveOrganization(
  organizationId: string
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Récupérer le membership de l'utilisateur actuel
    const { data: currentMembership } = await supabase
      .from('organization_members')
      .select('id, role, organization_id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!currentMembership) {
      return { success: false, error: 'Vous n\'êtes pas membre de cette organisation' }
    }

    // Empêcher le dernier propriétaire de quitter
    if (currentMembership.role === OrganizationRole.OWNER) {
      const { count: ownerCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('role', OrganizationRole.OWNER)
        .eq('is_active', true)

      if (ownerCount === 1) {
        return { success: false, error: 'Vous ne pouvez pas quitter l\'organisation car vous êtes le seul propriétaire. Transférez d\'abord la propriété à un autre membre.' }
      }
    }

    // Supprimer complètement le membership de la base de données
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', currentMembership.id)

    if (deleteError) {
      console.error('Erreur lors de la sortie de l\'organisation:', deleteError)
      return { success: false, error: 'Erreur lors de la sortie de l\'organisation' }
    }

    revalidatePath('/dashboard/organizations')
    revalidatePath(`/dashboard/organizations/${organizationId}`)
    
    return { 
      success: true, 
      data: { message: 'Vous avez quitté l\'organisation avec succès' }
    }

  } catch (error) {
    console.error('Erreur dans leaveOrganization:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Marquer les invitations expirées
export async function markExpiredInvitations(organizationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('organization_invitations')
    .update({ status: InvitationStatus.EXPIRED })
    .eq('organization_id', organizationId)
    .eq('status', InvitationStatus.PENDING)
    .lt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Erreur lors du marquage des invitations expirées:', error)
  }

  return !error
}

// Annuler une invitation
export async function cancelInvitation(
  organizationId: string,
  invitationId: string
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Vérifier les permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { success: false, error: 'Permissions insuffisantes' }
    }

    // Marquer l'invitation comme annulée
    const { error } = await supabase
      .from('organization_invitations')
      .update({ status: InvitationStatus.CANCELLED })
      .eq('id', invitationId)
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error)
      return { success: false, error: 'Erreur lors de l\'annulation de l\'invitation' }
    }

    revalidatePath(`/dashboard/organizations/${organizationId}/members`)
    
    return { 
      success: true, 
      data: { message: 'Invitation annulée' }
    }

  } catch (error) {
    console.error('Erreur dans cancelInvitation:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
} 