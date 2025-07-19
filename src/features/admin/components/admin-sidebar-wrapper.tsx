import { Suspense } from 'react'
import { getCurrentAdminUser } from '../lib/permissions'
import { AdminSidebarProvider } from './admin-sidebar-provider'
import { getPublicSettings } from '@/lib/settings'

async function AdminSidebarContent() {
  const [adminUser, settings] = await Promise.all([
    getCurrentAdminUser(),
    getPublicSettings()
  ])
  
  return <AdminSidebarProvider user={adminUser} siteName={settings.siteName} />
}

function AdminSidebarSkeleton() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="h-8 w-8 rounded-lg bg-sidebar-accent animate-pulse" />
        <div className="space-y-1">
          <div className="h-4 w-24 bg-sidebar-accent rounded animate-pulse" />
          <div className="h-3 w-20 bg-sidebar-accent rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 px-4 py-2 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-sidebar-accent rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

export function AdminSidebarWrapper() {
  return (
    <Suspense fallback={<AdminSidebarSkeleton />}>
      <AdminSidebarContent />
    </Suspense>
  )
} 