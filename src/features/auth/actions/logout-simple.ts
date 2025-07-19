'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logoutSimple(): Promise<void> {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // En cas d'erreur, on redirige quand même vers login
    redirect('/login')
  }
} 