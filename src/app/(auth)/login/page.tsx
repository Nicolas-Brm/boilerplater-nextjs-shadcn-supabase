import { LoginForm } from '@/features/auth/components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion - Votre plateforme',
  description: 'Connectez-vous à votre compte pour accéder à votre espace personnel sécurisé.',
}

export default function LoginPage() {
  return <LoginForm />
} 