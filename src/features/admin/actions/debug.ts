'use server'

import { createClient } from '@/lib/supabase/server'
import { UserRole } from '../types'

/**
 * Action de debug pour examiner les données en base
 */
export async function debugDatabase() {
  try {
    const supabase = await createClient()
    
    console.log('🔍 [DEBUG] Vérification des utilisateurs en base...')
    
    // 1. Vérifier les utilisateurs dans auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    console.log('🔍 [DEBUG] Utilisateurs auth.users:', authUsers?.users?.length || 0)
    
    if (authUsers?.users) {
      authUsers.users.forEach(user => {
        console.log(`- ${user.email} (${user.id}) - confirmé: ${user.email_confirmed_at ? 'oui' : 'non'}`)
      })
    }
    
    // 2. Vérifier les profils utilisateurs
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
    
    console.log('🔍 [DEBUG] Profils utilisateurs:', profiles?.length || 0)
    if (profilesError) {
      console.error('🔍 [DEBUG] Erreur profils:', profilesError)
    }
    
    if (profiles) {
      profiles.forEach(profile => {
        console.log(`- ${profile.email || 'pas d\'email'} (${profile.id}) - rôle: ${profile.role} - actif: ${profile.is_active}`)
      })
    }
    
    // 3. Vérifier spécifiquement les super admins
    const { data: superAdmins, error: superAdminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', UserRole.SUPER_ADMIN)
    
    console.log('🔍 [DEBUG] Super admins trouvés:', superAdmins?.length || 0)
    if (superAdminError) {
      console.error('🔍 [DEBUG] Erreur super admins:', superAdminError)
    }
    
    if (superAdmins) {
      superAdmins.forEach(admin => {
        console.log(`- Super admin: ${admin.email || 'pas d\'email'} (${admin.id}) - actif: ${admin.is_active}`)
      })
    }
    
    // 4. Vérifier les super admins actifs
    const { data: activeSuperAdmins, error: activeSuperAdminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', UserRole.SUPER_ADMIN)
      .eq('is_active', true)
    
    console.log('🔍 [DEBUG] Super admins actifs:', activeSuperAdmins?.length || 0)
    if (activeSuperAdminError) {
      console.error('🔍 [DEBUG] Erreur super admins actifs:', activeSuperAdminError)
    }
    
    return {
      success: true,
      data: {
        authUsers: authUsers?.users?.length || 0,
        profiles: profiles?.length || 0,
        superAdmins: superAdmins?.length || 0,
        activeSuperAdmins: activeSuperAdmins?.length || 0,
        authUsersDetails: authUsers?.users?.map(u => ({ email: u.email, id: u.id, confirmed: !!u.email_confirmed_at })) || [],
        profilesDetails: profiles || [],
        superAdminsDetails: superAdmins || [],
        activeSuperAdminsDetails: activeSuperAdmins || []
      }
    }
  } catch (error) {
    console.error('🔍 [DEBUG] Erreur:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
} 