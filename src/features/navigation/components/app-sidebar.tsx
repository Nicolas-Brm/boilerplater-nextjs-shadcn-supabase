import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { CollapsibleNavigation } from './collapsible-navigation'
import { SidebarLogo } from './sidebar-logo'
import { UserMenu } from '@/features/auth/components/user-menu'
import { navigationConfig } from '../config/navigation'
import { requireAuth } from '@/lib/auth'
import { getPublicSettings } from '@/lib/settings'

export async function AppSidebar() {
  const user = await requireAuth()
  const settings = await getPublicSettings()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo siteName={settings.siteName} />
      </SidebarHeader>
      
      <SidebarContent>
        <CollapsibleNavigation items={navigationConfig} />
      </SidebarContent>
      
      <SidebarFooter>
        <UserMenu user={user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
} 