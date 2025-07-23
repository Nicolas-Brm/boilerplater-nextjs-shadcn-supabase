'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ResetPasswordSchema, type ActionResult, type ResetPasswordSuccessData } from '../types'

export async function resetPassword(
  prevState: ActionResult<ResetPasswordSuccessData> | null,
  formData: FormData
): Promise<ActionResult<ResetPasswordSuccessData>> {
  const supabase = await createClient()

  // Validation des données
  const validatedFields = ResetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { password } = validatedFields.data

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return {
        success: false,
        error: 'Erreur lors de la réinitialisation du mot de passe',
      }
    }

    revalidatePath('/', 'layout')
    return {
      success: true,
      data: { 
        message: 'Mot de passe réinitialisé avec succès !',
        redirect: '/dashboard'
      },
    }
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la réinitialisation',
    }
  }
} 