'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { RegisterSchema, type ActionResult } from '../types'

export async function register(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validation des données
  const validatedFields = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      data: { 
        message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.',
        redirect: '/login'
      },
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'inscription',
    }
  }
} 