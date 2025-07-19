'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionResult } from '../types'

export async function logout(): Promise<ActionResult> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: 'Erreur lors de la déconnexion',
      }
    }

    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la déconnexion',
    }
  }
} 