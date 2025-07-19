import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { getCurrentAdminUser } from '@/features/admin/lib/permissions'
import { UserRole } from '@/features/admin/types'
import { AdminSidebarWrapper } from '@/features/admin/components/admin-sidebar-wrapper'

async function AdminGuard() {
  const adminUser = await getCurrentAdminUser()
  
  if (!adminUser) {
    redirect('/login')
  }

  // Vérifier que l'utilisateur a un rôle admin
  const hasAdminRole = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR].includes(adminUser.role)
  
  if (!hasAdminRole) {
    redirect('/dashboard')
  }

  return null
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AdminGuard />
      </Suspense>
      
      <SidebarProvider>
        <AdminSidebarWrapper />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">Administration</h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarInset>

      </SidebarProvider>
    </>
  )
} 