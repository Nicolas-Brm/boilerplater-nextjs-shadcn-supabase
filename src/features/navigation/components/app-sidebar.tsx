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

export async function AppSidebar() {
  const user = await requireAuth()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarLogo />
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