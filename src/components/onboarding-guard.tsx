import { redirect } from 'next/navigation'
import { hasSuperAdmin } from '@/features/admin/actions/onboarding'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/**
 * Composant guard qui vérifie si l'onboarding est nécessaire
 * Si aucun superadmin n'existe, redirige vers /onboarding
 * Sinon, affiche les enfants normalement
 */
export async function OnboardingGuard({ children }: OnboardingGuardProps) {
  // Vérifier s'il y a au moins un superadmin
  const hasAdmin = await hasSuperAdmin()
  
  if (!hasAdmin) {
    // Aucun superadmin trouvé, rediriger vers l'onboarding
    redirect('/onboarding')
  }

  // Un superadmin existe, afficher le contenu normal
  return <>{children}</>
} 