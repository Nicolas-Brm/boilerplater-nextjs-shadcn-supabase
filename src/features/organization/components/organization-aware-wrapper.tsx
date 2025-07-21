'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from './organization-context'

interface OrganizationAwareWrapperProps {
  children: React.ReactNode
}

export function OrganizationAwareWrapper({ children }: OrganizationAwareWrapperProps) {
  const { currentOrganization } = useOrganization()
  const router = useRouter()
  const [lastOrgId, setLastOrgId] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrganization && currentOrganization.id !== lastOrgId) {
      setLastOrgId(currentOrganization.id)
      
      // Forcer le rechargement des Server Components
      router.refresh()
    }
  }, [currentOrganization, lastOrgId, router])

  return <>{children}</>
} 