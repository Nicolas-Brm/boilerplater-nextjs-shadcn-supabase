import { RegisterForm } from '@/features/auth/components'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription - Votre plateforme',
  description: 'Créez votre compte pour rejoindre notre plateforme sécurisée et moderne.',
}

export default function RegisterPage() {
  return <RegisterForm />
} 