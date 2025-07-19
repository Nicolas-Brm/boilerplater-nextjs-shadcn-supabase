'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import { Icon } from '../lib/icons'
import type { NavigationItem } from '../config/navigation'

interface CollapsibleNavigationProps {
  items: NavigationItem[]
}

export function CollapsibleNavigation({ items }: CollapsibleNavigationProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + '/')
          const hasSubItems = item.items && item.items.length > 0
          
          return hasSubItems ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <Icon name={item.icon} className="size-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <SidebarMenuBadge>
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild
                            isActive={isSubActive}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                              {subItem.badge && (
                                <SidebarMenuBadge>
                                  {subItem.badge}
                                </SidebarMenuBadge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                tooltip={item.title}
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
    </SidebarGroup>
  )
} 