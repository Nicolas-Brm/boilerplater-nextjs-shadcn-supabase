'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type OrganizationActionResult } from '../types'
import { getCurrentUser } from '@/lib/auth'

// Supprimer une organisation
export async function deleteOrganization(organizationId: string): Promise<OrganizationActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Vérifier que l'utilisateur est propriétaire de l'organisation
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || membership.role !== 'owner') {
      return { success: false, error: 'Seuls les propriétaires peuvent supprimer l\'organisation' }
    }

    // Vérifier s'il y a d'autres membres actifs
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (memberCount && memberCount > 1) {
      return { 
        success: false, 
        error: 'Impossible de supprimer une organisation avec des membres. Supprimez d\'abord tous les membres sauf vous-même.' 
      }
    }

    // Supprimer l'organisation (cascade va supprimer les données liées)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organizationId)

    if (deleteError) {
      console.error('Erreur lors de la suppression de l\'organisation:', deleteError)
      return { success: false, error: 'Erreur lors de la suppression de l\'organisation' }
    }

    // Nettoyer les caches
    revalidatePath('/dashboard/organizations')
    revalidatePath('/dashboard/settings')
    
    return { 
      success: true, 
      data: { message: 'Organisation supprimée avec succès' }
    }

  } catch (error) {
    console.error('Erreur dans deleteOrganization:', error)
    return { 
      success: false, 
      error: 'Une erreur inattendue est survenue' 
    }
  }
}

// Vérifier si une organisation peut être supprimée
export async function canDeleteOrganization(organizationId: string): Promise<{
  canDelete: boolean
  reason?: string
  memberCount?: number
}> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { canDelete: false, reason: 'Non authentifié' }
    }

    const supabase = await createClient()

    // Vérifier le rôle de l'utilisateur
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership || membership.role !== 'owner') {
      return { canDelete: false, reason: 'Seuls les propriétaires peuvent supprimer l\'organisation' }
    }

    // Compter les membres
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true)

    if (memberCount && memberCount > 1) {
      return { 
        canDelete: false, 
        reason: 'L\'organisation contient d\'autres membres',
        memberCount 
      }
    }

    return { canDelete: true, memberCount: memberCount || 0 }

  } catch (error) {
    console.error('Erreur dans canDeleteOrganization:', error)
    return { canDelete: false, reason: 'Erreur lors de la vérification' }
  }
} 