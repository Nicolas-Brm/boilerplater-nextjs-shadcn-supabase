'use client'

import { ChevronRight, Shield } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { AdminNavigationItem } from '../config/navigation'
import { AdminUser } from '../types'
import { AdminUserMenu } from './admin-user-menu'
import { AdminLogo } from './admin-logo'
import { AdminQuickActions } from './admin-quick-actions'

interface AdminSidebarProps {
  navigationItems: AdminNavigationItem[]
  quickActions: AdminNavigationItem[]
  currentPath: string
  user?: AdminUser
}

function AdminNavigationSection({ 
  items, 
  currentPath 
}: { 
  items: AdminNavigationItem[]
  currentPath: string 
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = currentPath === item.url || currentPath.startsWith(item.url + '/')
        const hasSubItems = item.items && item.items.length > 0

        if (hasSubItems) {
          return (
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
                    className="group"
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs px-2 py-0.5 h-5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items!.map((subItem) => {
                      const isSubActive = currentPath === subItem.url || currentPath.startsWith(subItem.url + '/')
                      
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isSubActive}
                          >
                            <a href={subItem.url} className="flex items-center gap-2">
                              <subItem.icon className="size-3" />
                              <span>{subItem.title}</span>
                              {subItem.badge && (
                                <Badge 
                                  variant="destructive" 
                                  className="ml-auto text-xs px-1.5 py-0 h-4"
                                >
                                  {subItem.badge}
                                </Badge>
                              )}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        }

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              asChild 
              isActive={isActive}
              tooltip={item.title}
            >
              <a href={item.url} className="flex items-center gap-2">
                <item.icon className="size-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto text-xs px-2 py-0.5 h-5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function AdminSidebar({ 
  navigationItems, 
  quickActions, 
  currentPath,
  user 
}: AdminSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="floating" >
      <SidebarHeader>
        <AdminLogo />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Actions rapides */}
        {quickActions.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Actions rapides</SidebarGroupLabel>
            <SidebarGroupContent>
              <AdminQuickActions items={quickActions} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <AdminNavigationSection 
              items={navigationItems} 
              currentPath={currentPath}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <AdminUserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
} 