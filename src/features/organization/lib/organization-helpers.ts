import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'

/**
 * Convertit un slug d'organisation en ID, en s'assurant que l'utilisateur a accès à cette organisation
 */
export async function getOrganizationIdFromSlug(slug: string): Promise<string | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()

    // Récupérer l'organisation par slug et vérifier que l'utilisateur en est membre
    const { data: membership } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner (
          id,
          slug
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('organizations.slug', slug)
      .single()

    if (!membership) return null

    return membership.organization_id
  } catch (error) {
    console.error('Erreur lors de la conversion slug vers ID:', error)
    return null
  }
}

/**
 * Convertit un ID d'organisation en slug, en s'assurant que l'utilisateur a accès à cette organisation
 */
export async function getOrganizationSlugFromId(organizationId: string): Promise<string | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()

    // Récupérer l'organisation par ID et vérifier que l'utilisateur en est membre
    const { data: membership } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        organizations!inner (
          id,
          slug
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('organization_id', organizationId)
      .single()

    if (!membership || !membership.organizations) return null

    return (membership.organizations as any).slug
  } catch (error) {
    console.error('Erreur lors de la conversion ID vers slug:', error)
    return null
  }
}

/**
 * Récupère les informations de base d'une organisation par slug (pour les utilisateurs autorisés)
 */
export async function getOrganizationBySlug(slug: string): Promise<{ id: string; slug: string; name: string } | null> {
  try {
    const user = await getCurrentUser()
    if (!user) return null

    const supabase = await createClient()

    const { data: membership } = await supabase
      .from('organization_members')
      .select(`
        organizations!inner (
          id,
          slug,
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('organizations.slug', slug)
      .single()

    if (!membership || !membership.organizations) return null

    const org = membership.organizations as any
    return {
      id: org.id,
      slug: org.slug,
      name: org.name
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'organisation:', error)
    return null
  }
} 