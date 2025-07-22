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
  // Mode debug : bypass en développement si explicitement configuré
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_ONBOARDING === 'true') {
    console.log('🔧 [OnboardingGuard] Bypass activé en mode développement')
    return <>{children}</>
  }

  try {
    const hasAdmin = await hasSuperAdmin()
    
    if (!hasAdmin) {
      console.log('❌ [OnboardingGuard] Aucun superadmin trouvé, redirection vers /onboarding')
      redirect('/onboarding')
    }

    return <>{children}</>
  } catch (error) {
    console.error('🔥 [OnboardingGuard] Erreur lors de la vérification:', error)
    redirect('/onboarding')
  }
} 