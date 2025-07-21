'use client'

import { useRouter } from 'next/navigation'
import { createOrganization as baseCreateOrganization, joinOrganization as baseJoinOrganization } from '../actions'
import { useOrganization } from '../components/organization-context'

export function useOrganizationActions() {
  const { refreshOrganizations, switchOrganization } = useOrganization()
  const router = useRouter()

  const createOrganization = async (formData: FormData) => {
    const result = await baseCreateOrganization(formData)
    
    if (result.success && result.data && typeof result.data === 'object' && 'organization' in result.data) {
      // Rafraîchir la liste des organisations
      await refreshOrganizations()
      
      // Sélectionner la nouvelle organisation
      switchOrganization(result.data.organization as any)
      
      // Rediriger vers la page des organisations
      router.push('/dashboard/organizations')
    }
    
    return result
  }

  const joinOrganization = async (token: string) => {
    const result = await baseJoinOrganization(token)
    
    if (result.success) {
      // Rafraîchir la liste des organisations
      await refreshOrganizations()
      
      // Rediriger vers la page des organisations
      router.push('/dashboard/organizations')
    }
    
    return result
  }

  return {
    createOrganization,
    joinOrganization,
  }
} 