'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { 
  CreateOrganizationSchema,
  type OrganizationActionResult,
  type CreateOrganizationData,
  OrganizationRole 
} from '../types'
import { getCurrentUser } from '@/lib/auth'

// Créer une nouvelle organisation
export async function createOrganization(formData: FormData): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Valider les données
    const validatedFields = CreateOrganizationSchema.safeParse({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description') || undefined,
      website: formData.get('website') || undefined,
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const supabase = await createClient()

    // Vérifier si le slug est déjà utilisé
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', data.slug)
      .single()

    if (existingOrg) {
      return {
        success: false,
        errors: { slug: ['Ce nom d\'organisation est déjà utilisé'] }
      }
    }

    // Créer l'organisation
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        website: data.website,
        max_members: 10, // Plan gratuit par défaut
        allow_public_signup: false,
        require_approval: true,
        plan_type: 'free',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (orgError) {
      console.error('Erreur lors de la création de l\'organisation:', orgError)
      return { success: false, error: 'Erreur lors de la création de l\'organisation' }
    }

    // Ajouter l'utilisateur comme propriétaire
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        role: OrganizationRole.OWNER,
        is_active: true,
        invited_by: user.id
      })

    if (memberError) {
      console.error('Erreur lors de l\'ajout du membre:', memberError)
      // Supprimer l'organisation créée en cas d'erreur
      await supabase.from('organizations').delete().eq('id', organization.id)
      return { success: false, error: 'Erreur lors de la configuration de l\'organisation' }
    }

    // Créer les paramètres par défaut de l'organisation
    const { error: settingsError } = await supabase
      .from('organization_settings')
      .insert({
        organization_id: organization.id,
        default_timezone: 'Europe/Paris',
        default_language: 'fr',
        enforce_2fa: false,
        session_timeout_hours: 24,
        password_min_length: 8,
        admin_notifications: true,
        security_notifications: true,
        api_enabled: false,
        webhook_enabled: false
      })

    if (settingsError) {
      console.error('Erreur lors de la création des paramètres:', settingsError)
      // On continue, les paramètres peuvent être créés plus tard
    }

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/organizations')
    
    return { 
      success: true, 
      data: { 
        organization,
        message: 'Organisation créée avec succès' 
      }
    }

  } catch (error) {
    console.error('Erreur dans createOrganization:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Vérifier la disponibilité d'un slug
export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  if (!slug || slug.length < 2) {
    return { available: false }
  }

  // Valider le format du slug
  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(slug)) {
    return { available: false }
  }

  const supabase = await createClient()
  
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .single()

  return { available: !data }
}

// Rejoindre une organisation via un lien d'invitation
export async function joinOrganization(invitationToken: string): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Rechercher l'invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          id,
          name,
          max_members
        )
      `)
      .eq('token', invitationToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invitationError || !invitation) {
      return { success: false, error: 'Invitation invalide ou expirée' }
    }

    // Vérifier si l'utilisateur est déjà membre
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', invitation.organization_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { success: false, error: 'Vous êtes déjà membre de cette organisation' }
    }

    // Vérifier si l'email correspond
    if (invitation.email !== user.email) {
      return { success: false, error: 'Cette invitation n\'est pas pour votre adresse email' }
    }

    // Vérifier la limite de membres
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', invitation.organization_id)
      .eq('is_active', true)

    if (memberCount && memberCount >= (invitation.organizations as any).max_members) {
      return { success: false, error: 'L\'organisation a atteint sa limite de membres' }
    }

    // Ajouter l'utilisateur à l'organisation
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
        is_active: true,
        invited_by: invitation.invited_by
      })

    if (memberError) {
      console.error('Erreur lors de l\'ajout du membre:', memberError)
      return { success: false, error: 'Erreur lors de l\'adhésion à l\'organisation' }
    }

    // Marquer l'invitation comme utilisée (optionnel)
    await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', invitation.id)

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/organizations')
    
    return { 
      success: true, 
      data: { 
        organization: invitation.organizations,
        message: `Vous avez rejoint l'organisation ${(invitation.organizations as any).name}` 
      }
    }

  } catch (error) {
    console.error('Erreur dans joinOrganization:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
} 