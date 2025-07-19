import { Command } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { CollapsibleNavigation } from './collapsible-navigation'
import { UserMenu } from '@/features/auth/components/user-menu'
import { navigationConfig } from '../config/navigation'
import { requireAuth } from '@/lib/auth'

export async function AppSidebar() {
  const user = await requireAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Mon Dashboard</span>
            <span className="truncate text-xs">v2.0.0</span>
          </div>
        </div>
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