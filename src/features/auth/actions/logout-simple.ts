'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '../types'

export async function logoutSimple(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _prevState: ActionResult | null, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _formData?: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erreur Supabase lors de la déconnexion:', error)
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
      }
    }

    // Revalider le cache
    revalidatePath('/', 'layout')
    
    // Retourner succès avec redirection côté client
    return {
      success: true,
      data: { redirect: '/login' },
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    }
  }
} 