'use client'

import { AdminSidebar } from './admin-sidebar'
import { useAdminSidebar } from '../hooks'
import type { AdminUser } from '../types'

interface AdminSidebarProviderProps {
  user: AdminUser | null
  siteName: string
}

export function AdminSidebarProvider({ user, siteName }: AdminSidebarProviderProps) {
  const { navigationItems, quickActions, currentPath } = useAdminSidebar({ 
    user: user || undefined 
  })

  return (
    <AdminSidebar
      navigationItems={navigationItems}
      quickActions={quickActions}
      currentPath={currentPath}
      user={user || undefined}
      siteName={siteName}
    />
  )
} 