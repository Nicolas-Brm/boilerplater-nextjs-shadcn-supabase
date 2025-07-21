'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrganization } from './organization-context'

interface OrganizationDataProviderProps {
  children: React.ReactNode
}

export function OrganizationDataProvider({ children }: OrganizationDataProviderProps) {
  const { currentOrganization } = useOrganization()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (currentOrganization) {
      const params = new URLSearchParams(searchParams.toString())
      
      // Ajouter/mettre à jour le paramètre organizationId
      params.set('organizationId', currentOrganization.id)
      
      // Mettre à jour l'URL sans recharger la page
      const newUrl = `${window.location.pathname}?${params.toString()}`
      router.replace(newUrl)
    }
  }, [currentOrganization, router, searchParams])

  return <>{children}</>
} 