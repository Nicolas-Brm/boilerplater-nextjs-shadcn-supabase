'use client'

import { Command } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'

export function SidebarLogo() {
  const { state } = useSidebar()
  
  if (state === "collapsed") {
    return (
      <div className="flex h-12 items-center justify-center">
        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Command className="size-4" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex h-12 items-center gap-2 px-3">
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
        <Command className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Mon Dashboard</span>
        <span className="truncate text-xs text-sidebar-foreground/70">v2.0.0</span>
      </div>
    </div>
  )
} 