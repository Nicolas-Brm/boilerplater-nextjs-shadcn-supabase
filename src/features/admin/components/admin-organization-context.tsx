'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Organization, OrganizationMember, OrganizationRole } from '@/features/organization/types'

interface AdminOrganizationContextType {
  // Contexte d'organisation pour l'admin
  selectedOrganization: Organization | null
  setSelectedOrganization: (org: Organization | null) => void
  
  // Filtrage par organisation
  filterByOrganization: boolean
  setFilterByOrganization: (filter: boolean) => void
  
  // Statistiques par organisation
  organizationStats: Record<string, any> | null
  setOrganizationStats: (stats: Record<string, any> | null) => void
  
  // Membres de l'organisation sélectionnée
  organizationMembers: OrganizationMember[]
  setOrganizationMembers: (members: OrganizationMember[]) => void
  
  // Méthodes utilitaires
  canManageUser: (userId: string) => boolean
  getUserOrganizationRole: (userId: string) => OrganizationRole | null
}

const AdminOrganizationContext = createContext<AdminOrganizationContextType | undefined>(undefined)

interface AdminOrganizationProviderProps {
  children: React.ReactNode
  initialOrganization?: Organization | null
}

export function AdminOrganizationProvider({ 
  children, 
  initialOrganization = null 
}: AdminOrganizationProviderProps) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(initialOrganization)
  const [filterByOrganization, setFilterByOrganization] = useState(false)
  const [organizationStats, setOrganizationStats] = useState<Record<string, any> | null>(null)
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([])

  // Effet pour charger les membres quand une organisation est sélectionnée
  useEffect(() => {
    if (selectedOrganization && filterByOrganization) {
      loadOrganizationMembers(selectedOrganization.id)
    } else {
      setOrganizationMembers([])
    }
  }, [selectedOrganization, filterByOrganization])

  const loadOrganizationMembers = async (organizationId: string) => {
    try {
      // Appel API pour récupérer les membres de l'organisation
      const response = await fetch(`/api/admin/organizations/${organizationId}/members`)
      if (response.ok) {
        const data = await response.json()
        setOrganizationMembers(data.members || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error)
      setOrganizationMembers([])
    }
  }

  const canManageUser = (userId: string): boolean => {
    if (!selectedOrganization || !filterByOrganization) {
      return true // Si pas de filtre, on peut gérer tous les utilisateurs
    }
    
    // Vérifier si l'utilisateur fait partie de l'organisation sélectionnée
    return organizationMembers.some(member => member.userId === userId)
  }

  const getUserOrganizationRole = (userId: string): OrganizationRole | null => {
    if (!selectedOrganization || !filterByOrganization) {
      return null
    }
    
    const member = organizationMembers.find(member => member.userId === userId)
    return member?.role || null
  }

  const value: AdminOrganizationContextType = {
    selectedOrganization,
    setSelectedOrganization,
    filterByOrganization,
    setFilterByOrganization,
    organizationStats,
    setOrganizationStats,
    organizationMembers,
    setOrganizationMembers,
    canManageUser,
    getUserOrganizationRole,
  }

  return (
    <AdminOrganizationContext.Provider value={value}>
      {children}
    </AdminOrganizationContext.Provider>
  )
}

export function useAdminOrganization() {
  const context = useContext(AdminOrganizationContext)
  if (context === undefined) {
    throw new Error('useAdminOrganization must be used within an AdminOrganizationProvider')
  }
  return context
}

// Hook pour les composants qui ont besoin du contexte organisation en admin
export function useAdminOrganizationFilter() {
  const { 
    selectedOrganization, 
    filterByOrganization, 
    canManageUser, 
    getUserOrganizationRole 
  } = useAdminOrganization()

  return {
    selectedOrganization,
    filterByOrganization,
    canManageUser,
    getUserOrganizationRole,
    
    // Helpers pour les filtres
    getOrganizationFilter: () => {
      if (!filterByOrganization || !selectedOrganization) {
        return null
      }
      return selectedOrganization.id
    },
    
    // Helper pour les labels
    getFilterLabel: () => {
      if (!filterByOrganization || !selectedOrganization) {
        return 'Tous les utilisateurs'
      }
      return `Utilisateurs de ${selectedOrganization.name}`
    }
  }
}