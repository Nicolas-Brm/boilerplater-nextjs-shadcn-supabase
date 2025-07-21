'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { 
  OrganizationSettingsSchema,
  UpdateOrganizationSchema,
  type OrganizationActionResult,
  type OrganizationSettings,
  type OrganizationSettingsData 
} from '../types'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schéma pour la mise à jour des paramètres d'organisation
const UpdateOrganizationSettingsSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(1, 'Le nom est requis').max(100),
  slug: z.string().min(1, 'Le slug est requis').max(50).regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  description: z.string().max(500).optional(),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(200).optional().or(z.literal('')),
})

// Action pour mettre à jour les paramètres d'organisation
export async function updateOrganizationSettings(
  prevState: OrganizationActionResult,
  formData: FormData
): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: 'Utilisateur non authentifié',
        errors: {}
      }
    }

    // Validation des données
    const validatedFields = UpdateOrganizationSettingsSchema.safeParse({
      organizationId: formData.get('organizationId'),
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      website: formData.get('website'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Données invalides',
        errors: validatedFields.error.flatten().fieldErrors
      }
    }

    const { organizationId, ...updateData } = validatedFields.data
    const supabase = await createClient()

    // Vérifier les permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role, is_active')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !membership.is_active || !['owner', 'admin'].includes(membership.role)) {
      return {
        success: false,
        error: 'Permissions insuffisantes',
        errors: {}
      }
    }

    // Récupérer l'organisation actuelle pour comparer
    const { data: currentOrg } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', organizationId)
      .single()

    if (!currentOrg) {
      return {
        success: false,
        error: 'Organisation non trouvée',
        errors: {}
      }
    }

    // Vérifier que le slug est unique (seulement si modifié)
    if (updateData.slug !== currentOrg.slug) {
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', updateData.slug)
        .single()

      if (existingOrg) {
        return {
          success: false,
          error: 'Ce slug est déjà utilisé par une autre organisation',
          errors: { slug: ['Ce slug est déjà utilisé'] }
        }
      }
    }

    // Préparer les données pour la mise à jour
    const organizationUpdate: any = {
      name: updateData.name,
      slug: updateData.slug,
      updated_at: new Date().toISOString()
    }

    // Ajouter les champs optionnels s'ils sont fournis
    if (updateData.description !== undefined) {
      organizationUpdate.description = updateData.description || null
    }
    if (updateData.website !== undefined) {
      organizationUpdate.website = updateData.website || null
    }

    // Mettre à jour l'organisation
    const { error: updateError } = await supabase
      .from('organizations')
      .update(organizationUpdate)
      .eq('id', organizationId)

    if (updateError) {
      console.error('Erreur lors de la mise à jour:', updateError)
      return {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'organisation',
        errors: {}
      }
    }

    // Revalider les pages concernées
    revalidatePath('/dashboard/organizations')
    revalidatePath(`/dashboard/organizations?org=${updateData.slug}`)

    return {
      success: true,
      data: { message: 'Paramètres mis à jour avec succès' },
      errors: {}
    }

  } catch (error) {
    console.error('Erreur inattendue:', error)
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
      errors: {}
    }
  }
}

// Récupérer les paramètres d'une organisation
export async function getOrganizationSettings(organizationId: string): Promise<OrganizationSettings | null> {
  const supabase = await createClient()
  
  // Essayer de récupérer les paramètres existants
  let { data: settings, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  // Si aucun paramètre n'existe, créer des paramètres par défaut
  if (error && error.code === 'PGRST116') {
    const { data: newSettings, error: createError } = await supabase
      .from('organization_settings')
      .insert({
        organization_id: organizationId,
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
      .select()
      .single()

    if (createError) {
      console.error('Erreur lors de la création des paramètres par défaut:', createError)
      return null
    }

    settings = newSettings
  } else if (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
    return null
  }

  // Transformer en format attendu
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
    updatedAt: settings.updated_at
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