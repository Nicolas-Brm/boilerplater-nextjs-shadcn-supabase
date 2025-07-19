import { ForgotPasswordForm } from '@/features/auth/components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mot de passe oublié - Votre plateforme',
  description: 'Réinitialisez votre mot de passe en toute sécurité pour retrouver l\'accès à votre compte.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
} 