'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getUserOrganizations } from '../actions'
import { type Organization } from '../types'
import { type UserOrganizationMembership } from '../actions/get-user-organizations'

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: UserOrganizationMembership[]
  loading: boolean
  switchOrganization: (organization: Organization) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<UserOrganizationMembership[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const userOrganizations = await getUserOrganizations()
      
      setOrganizations(userOrganizations)
      
      if (userOrganizations.length > 0) {
        // Vérifier si l'organisation actuelle est toujours disponible
        const currentOrgStillExists = currentOrganization && 
          userOrganizations.some(org => org.organization.id === currentOrganization.id)
        
        if (currentOrgStillExists) {
          // Mettre à jour avec les nouvelles données
          const updatedOrg = userOrganizations.find(org => org.organization.id === currentOrganization.id)?.organization
          if (updatedOrg) {
            setCurrentOrganization(updatedOrg)
          }
        } else {
          // Définir la première organisation comme courante
          setCurrentOrganization(userOrganizations[0].organization)
        }
      } else {
        setCurrentOrganization(null)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des organisations:', error)
      setOrganizations([])
      setCurrentOrganization(null)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = (organization: Organization) => {
    setCurrentOrganization(organization)
    
    // Stocker l'organisation sélectionnée dans le localStorage pour la persistance
    try {
      localStorage.setItem('selectedOrganizationId', organization.id)
    } catch (error) {
      console.warn('Impossible de sauvegarder l\'organisation dans localStorage:', error)
    }
    
    // Recharger les données spécifiques à l'organisation
    router.refresh()
  }

  const refreshOrganizations = async () => {
    await loadOrganizations()
  }

  useEffect(() => {
    const loadInitialData = async () => {
      // Essayer de récupérer l'organisation sélectionnée depuis localStorage
      let selectedOrgId: string | null = null
      try {
        selectedOrgId = localStorage.getItem('selectedOrganizationId')
      } catch (error) {
        console.warn('Impossible de lire localStorage:', error)
      }

      const userOrganizations = await getUserOrganizations()
      setOrganizations(userOrganizations)

      if (userOrganizations.length > 0) {
        // Essayer de trouver l'organisation sélectionnée précédemment
        let selectedOrg = null
        if (selectedOrgId) {
          selectedOrg = userOrganizations.find(org => org.organization.id === selectedOrgId)?.organization
        }
        
        // Si pas trouvée, prendre la première
        if (!selectedOrg) {
          selectedOrg = userOrganizations[0].organization
        }
        
        setCurrentOrganization(selectedOrg)
        
        // Mettre à jour localStorage avec l'organisation actuelle
        try {
          localStorage.setItem('selectedOrganizationId', selectedOrg.id)
        } catch (error) {
          console.warn('Impossible de sauvegarder dans localStorage:', error)
        }
      } else {
        setCurrentOrganization(null)
        try {
          localStorage.removeItem('selectedOrganizationId')
        } catch (error) {
          console.warn('Impossible de nettoyer localStorage:', error)
        }
      }
      
      setLoading(false)
    }

    loadInitialData()
  }, [])

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    loading,
    switchOrganization,
    refreshOrganizations,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
} 