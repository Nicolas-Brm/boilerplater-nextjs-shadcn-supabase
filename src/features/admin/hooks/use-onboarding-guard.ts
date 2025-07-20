'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook pour vérifier si l'onboarding est nécessaire côté client
 */
export function useOnboardingGuard() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const response = await fetch('/api/admin/onboarding/status')
        const data = await response.json()
        
        if (data.needsOnboarding) {
          setNeedsOnboarding(true)
          router.push('/onboarding')
        } else {
          setNeedsOnboarding(false)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut d\'onboarding:', error)
        // En cas d'erreur, on continue normalement
      } finally {
        setIsChecking(false)
      }
    }

    checkOnboardingStatus()
  }, [router])

  return {
    isChecking,
    needsOnboarding
  }
} 