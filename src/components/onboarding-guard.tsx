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
  // Mode debug : bypass temporaire FORCÉ pour Docker
  console.log('🔧 [OnboardingGuard] BYPASS TEMPORAIRE ACTIVÉ pour diagnostiquer')
  return <>{children}</>
  
  // Mode debug : bypass temporaire
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_ONBOARDING === 'true') {
    console.log('🔧 [OnboardingGuard] Bypass activé en mode développement')
    return <>{children}</>
  }

  try {
    // Vérifier s'il y a au moins un superadmin
    const hasAdmin = await hasSuperAdmin()
    
    console.log('🔍 [OnboardingGuard] Vérification superadmin:', hasAdmin)
    
    if (!hasAdmin) {
      // Aucun superadmin trouvé, rediriger vers l'onboarding
      console.log('❌ [OnboardingGuard] Aucun superadmin trouvé, redirection vers /onboarding')
      redirect('/onboarding')
    }

    console.log('✅ [OnboardingGuard] Superadmin trouvé, accès autorisé')
    // Un superadmin existe, afficher le contenu normal
    return <>{children}</>
  } catch (error) {
    console.error('🔥 [OnboardingGuard] Erreur lors de la vérification:', error)
    // En cas d'erreur, rediriger vers l'onboarding par sécurité
    redirect('/onboarding')
  }
} 