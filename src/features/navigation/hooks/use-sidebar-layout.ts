'use client'

import { useSidebar } from '@/components/ui/sidebar'

export function useSidebarLayout() {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  const isCollapsed = state === 'collapsed'
  const isExpanded = state === 'expanded'

  return {
    isCollapsed,
    isExpanded,
    isMobile,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    toggleSidebar: () => {
      if (isMobile) {
        setOpenMobile(!openMobile)
      } else {
        setOpen(!open)
      }
    }
  }
} 