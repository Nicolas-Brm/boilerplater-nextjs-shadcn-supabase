import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/features/navigation/components/app-sidebar'
import { Toaster } from '@/components/ui/sonner'
import { OrganizationProvider } from '@/features/organization/components'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OrganizationProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 flex flex-col space-y-4 p-4 pt-6">
            {children}
          </div>
        </main>
        <Toaster />
      </SidebarProvider>
    </OrganizationProvider>
  )
} 