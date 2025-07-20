import { redirect } from 'next/navigation'
import { hasSuperAdmin } from '@/features/admin/actions/onboarding'
import { EnhancedOnboardingForm } from '@/features/admin/components/enhanced-onboarding-form'

export const metadata = {
  title: 'Configuration initiale - Boilerplate SaaS',
  description: 'Créez le premier compte superadmin pour commencer',
}

export default async function OnboardingPage() {
  // Vérifier s'il y a déjà un superadmin
  const hasAdmin = await hasSuperAdmin()
  
  if (hasAdmin) {
    // Si un superadmin existe déjà, rediriger vers la page de connexion
    redirect('/login')
  }

  return <EnhancedOnboardingForm />
} 