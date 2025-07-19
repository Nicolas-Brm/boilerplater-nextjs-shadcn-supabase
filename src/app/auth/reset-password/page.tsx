import { ResetPasswordForm } from '@/features/auth/components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe - Votre plateforme',
  description: 'Choisissez un nouveau mot de passe sécurisé pour votre compte.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
} 