'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  OrganizationSettingsSchema,
  type OrganizationActionResult,
  type OrganizationSettings,
  type OrganizationSettingsData 
} from '../types'
import { getCurrentUser } from '@/lib/auth'

// Récupérer les paramètres d'une organisation
export async function getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null> {
  const supabase = await createClient()
  
  const { data: settings, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return null
  }

  return {
    id: settings.id,
    organizationId: settings.organization_id,
    defaultTimezone: settings.default_timezone,
    defaultLanguage: settings.default_language,
    enforce2fa: settings.enforce_2fa,
    sessionTimeoutHours: settings.session_timeout_hours,
    passwordMinLength: settings.password_min_length,
    adminNotifications: settings.admin_notifications,
    securityNotifications: settings.security_notifications,
    apiEnabled: settings.api_enabled,
    webhookEnabled: settings.webhook_enabled,
    createdAt: settings.created_at,
    updatedAt: settings.updated_at,
  }
}

// Mettre à jour les paramètres d'organisation
export async function updateOrganizationSettings(
  organizationId: string,
  formData: FormData
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'utilisateur est propriétaire de l'organisation
    const supabase = await createClient()
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (membershipError || !membership || membership.role !== 'owner') {
      return { success: false, error: 'Permissions insuffisantes' }
    }

    // Valider les données
    const validatedFields = OrganizationSettingsSchema.safeParse({
      defaultTimezone: formData.get('defaultTimezone'),
      defaultLanguage: formData.get('defaultLanguage'),
      enforce2fa: formData.get('enforce2fa') === 'on',
      sessionTimeoutHours: parseInt(formData.get('sessionTimeoutHours') as string),
      passwordMinLength: parseInt(formData.get('passwordMinLength') as string),
      adminNotifications: formData.get('adminNotifications') === 'on',
      securityNotifications: formData.get('securityNotifications') === 'on',
      apiEnabled: formData.get('apiEnabled') === 'on',
      webhookEnabled: formData.get('webhookEnabled') === 'on',
    })

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // Mettre à jour les paramètres
    const { error: updateError } = await supabase
      .from('organization_settings')
      .upsert({
        organization_id: organizationId,
        default_timezone: data.defaultTimezone,
        default_language: data.defaultLanguage,
        enforce_2fa: data.enforce2fa,
        session_timeout_hours: data.sessionTimeoutHours,
        password_min_length: data.passwordMinLength,
        admin_notifications: data.adminNotifications,
        security_notifications: data.securityNotifications,
        api_enabled: data.apiEnabled,
        webhook_enabled: data.webhookEnabled,
      })

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      return { success: false, error: 'Erreur lors de la mise à jour des paramètres' }
    }

    revalidatePath('/dashboard/settings')
    
    return { 
      success: true, 
      data: { message: 'Paramètres mis à jour avec succès' }
    }

  } catch (error) {
    console.error('Erreur dans updateOrganizationSettings:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Récupérer l'organisation principale de l'utilisateur
export async function getUserPrimaryOrganization() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      role,
      organizations (
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
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !membership) {
    return null
  }

  const org = membership.organizations as any
  return {
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
    userRole: membership.role,
  }
} 