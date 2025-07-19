'use server'

import { createClient } from '@/lib/supabase/server'
import { ForgotPasswordSchema, type ActionResult } from '../types'

export async function forgotPassword(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Validation des données
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email } = validatedFields.data

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: { message: 'Un email de réinitialisation a été envoyé' },
    }
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la demande de réinitialisation',
    }
  }
} 