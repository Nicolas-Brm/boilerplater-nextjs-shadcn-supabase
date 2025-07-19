'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { LoginSchema, type ActionResult } from '../types'

export async function login(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validation des données
  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: 'Email ou mot de passe incorrect',
      }
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      data: { 
        message: 'Connexion réussie !',
        redirect: '/dashboard'
      },
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la connexion',
    }
  }
} 