import { redirect } from 'next/navigation'
import { hasSuperAdmin } from '@/features/admin/actions/onboarding'
import { getCurrentUser } from '@/lib/auth'
import { OnboardingSuccess } from '@/features/admin/components/onboarding-success'

export const metadata = {
  title: 'Configuration terminée - Boilerplate SaaS',
  description: 'Votre SaaS est maintenant configuré et prêt à être utilisé',
}

export default async function OnboardingSuccessPage() {
  // Vérifier qu'un superadmin existe maintenant
  const hasAdmin = await hasSuperAdmin()
  
  if (!hasAdmin) {
    // Si aucun superadmin n'existe, retourner à l'onboarding
    redirect('/onboarding')
  }

  // Vérifier si l'utilisateur est connecté
  const user = await getCurrentUser()

  return <OnboardingSuccess isUserLoggedIn={!!user} />
} 