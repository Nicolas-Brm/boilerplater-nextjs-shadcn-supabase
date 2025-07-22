'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { UserRole, type AdminActionResult, CreateSuperAdminSchema } from '../types'

/**
 * Vérifie s'il existe au moins un superadmin dans le système
 */
export async function hasSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', UserRole.SUPER_ADMIN)
      .eq('is_active', true)

    if (error) {
      console.error('Erreur lors de la vérification des superadmins:', error)
      return false
    }

    return (count ?? 0) > 0
  } catch (error) {
    console.error('Erreur lors de la vérification des superadmins:', error)
    return false
  }
}

/**
 * Vérifie si l'onboarding est nécessaire (pas de superadmin)
 */
export async function needsOnboarding(): Promise<AdminActionResult<{ needsOnboarding: boolean }>> {
  try {
    const hasAdmin = await hasSuperAdmin()
    
    return {
      success: true,
      data: {
        needsOnboarding: !hasAdmin
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'onboarding:', error)
    // En cas d'erreur, on assume qu'il faut faire l'onboarding par sécurité
    return {
      success: false,
      error: 'Erreur lors de la vérification du statut d\'onboarding',
      data: {
        needsOnboarding: true
      }
    }
  }
}

/**
 * Crée le premier superadmin du système
 */
export async function createFirstSuperAdmin(formData: FormData): Promise<AdminActionResult<{ userId: string }> | never> {
  try {
    console.log('🔍 [createFirstSuperAdmin] Début de la création du premier superadmin')
    
    // Vérifier d'abord qu'il n'y a pas déjà de superadmin
    const hasAdmin = await hasSuperAdmin()
    if (hasAdmin) {
      console.log('❌ [createFirstSuperAdmin] Un superadmin existe déjà')
      return {
        success: false,
        error: 'Un superadmin existe déjà dans le système'
      }
    }

    // Vérifier que la service role key est configurée
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ [createFirstSuperAdmin] Service role key manquante')
      return {
        success: false,
        error: 'Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire pour créer le premier superadmin'
      }
    }

    // Valider les données
    const validatedData = CreateSuperAdminSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      confirmPassword: formData.get('confirmPassword'),
    })

    console.log('✅ [createFirstSuperAdmin] Données validées pour:', validatedData.email)

    // Client Supabase avec service_role pour créer l'utilisateur
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 [createFirstSuperAdmin] Vérification de l\'existence de l\'utilisateur...')
    let userId: string
    let userExists = false

    // Essayer de récupérer l'utilisateur existant par email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(user => user.email === validatedData.email)

    if (existingUser) {
      console.log('✅ [createFirstSuperAdmin] Utilisateur existant trouvé:', existingUser.id)
      userId = existingUser.id
      userExists = true
      
      // Mettre à jour le mot de passe de l'utilisateur existant
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: validatedData.password,
        email_confirm: true,
        user_metadata: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName
        }
      })

      if (updateError) {
        console.log('❌ [createFirstSuperAdmin] Erreur lors de la mise à jour:', updateError.message)
        throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${updateError.message}`)
      }

      console.log('✅ [createFirstSuperAdmin] Utilisateur existant mis à jour')
    } else {
      // Créer un nouvel utilisateur
      console.log('🔍 [createFirstSuperAdmin] Création d\'un nouvel utilisateur auth...')
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: true,
        user_metadata: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName
        }
      })

      if (authError || !authUser.user) {
        console.log('❌ [createFirstSuperAdmin] Erreur lors de la création auth:', authError?.message)
        throw new Error(`Erreur lors de la création de l'utilisateur: ${authError?.message}`)
      }

      userId = authUser.user.id
      console.log('✅ [createFirstSuperAdmin] Nouvel utilisateur auth créé:', userId)
    }

    // Créer ou mettre à jour le profil utilisateur avec le rôle superadmin
    // Utiliser le client admin pour contourner les politiques RLS
    console.log('🔍 [createFirstSuperAdmin] Création/mise à jour du profil superadmin...')
    
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        role: UserRole.SUPER_ADMIN,
        is_active: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (profileError) {
      console.log('❌ [createFirstSuperAdmin] Erreur lors de la création/mise à jour du profil:', profileError.message)
      
      // Nettoyer l'utilisateur auth créé si le profil échoue (seulement pour les nouveaux utilisateurs)
      if (!userExists) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(userId)
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError)
        }
      }
      
      throw new Error(`Erreur lors de la création/mise à jour du profil: ${profileError.message}`)
    }

    if (userExists) {
      console.log('✅ [createFirstSuperAdmin] Utilisateur existant promu superadmin avec succès')
    } else {
      console.log('✅ [createFirstSuperAdmin] Nouveau profil superadmin créé avec succès')
    }

    // Connecter automatiquement l'utilisateur après création/promotion
    console.log('🔍 [createFirstSuperAdmin] Connexion automatique...')
    const supabaseForAuth = await createClient()
    const { error: signInError } = await supabaseForAuth.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (signInError) {
      console.log('⚠️ [createFirstSuperAdmin] Erreur lors de la connexion automatique:', signInError.message)
      // On continue même si la connexion automatique échoue
    } else {
      console.log('✅ [createFirstSuperAdmin] Connexion automatique réussie')
    }

    // Revalider les caches pertinents
    revalidatePath('/admin')
    revalidatePath('/admin/users')
    revalidatePath('/dashboard')
    revalidatePath('/')

    // Rediriger automatiquement vers la page de succès
    redirect('/onboarding/success')
  } catch (error) {
    console.error('❌ [createFirstSuperAdmin] Erreur lors de la création du premier superadmin:', error)
    
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du superadmin'
    }
  }
}

/**
 * Marque l'onboarding comme terminé (redirection vers la page de succès)
 */
export async function completeOnboarding(): Promise<never> {
  console.log('✅ [completeOnboarding] Onboarding terminé, redirection vers page de succès')
  redirect('/onboarding/success')
} 