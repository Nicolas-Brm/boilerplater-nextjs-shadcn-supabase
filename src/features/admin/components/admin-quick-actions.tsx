import { 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from '@/components/ui/sidebar'
import { AdminNavigationItem } from '../config/navigation'

interface AdminQuickActionsProps {
  items: AdminNavigationItem[]
}

export function AdminQuickActions({ items }: AdminQuickActionsProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild size="sm" variant="outline">
            <a href={item.url} className="flex items-center gap-2">
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
} 