'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import { Icon } from '../lib/icons'
import type { NavigationItem } from '../config/navigation'

interface NavigationMenuProps {
  items: NavigationItem[]
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
        
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild 
              isActive={isActive}
              tooltip={item.title}
              className={cn(
                "transition-colors",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Link href={item.url}>
                <Icon name={item.icon} className="size-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <SidebarMenuBadge>
                    {item.badge}
                  </SidebarMenuBadge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
} 