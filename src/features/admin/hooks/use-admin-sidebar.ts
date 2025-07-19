'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { 
  adminNavigationConfig, 
  adminQuickActions, 
  filterNavigationByPermissions 
} from '../config/navigation'
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types'
import type { AdminUser } from '../types'

interface UseAdminSidebarProps {
  user?: AdminUser
}

export function useAdminSidebar({ user }: UseAdminSidebarProps) {
  const pathname = usePathname()

  const { navigationItems, quickActions } = useMemo(() => {
    if (!user) {
      return {
        navigationItems: [],
        quickActions: adminQuickActions
      }
    }

    // Récupérer les permissions du rôle utilisateur
    const userPermissions = ROLE_PERMISSIONS[user.role] || []

    // Filtrer les éléments de navigation selon les permissions
    const filteredNavigation = filterNavigationByPermissions(
      adminNavigationConfig,
      user.role,
      userPermissions
    )

    return {
      navigationItems: filteredNavigation,
      quickActions: adminQuickActions
    }
  }, [user])

  return {
    navigationItems,
    quickActions,
    currentPath: pathname,
    user
  }
} 