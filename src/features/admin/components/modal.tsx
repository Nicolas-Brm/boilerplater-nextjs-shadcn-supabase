'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface AdminModalProps {
  children: React.ReactNode
  className?: string
}

export function AdminModal({ children, className }: AdminModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  // Fermer le modal et naviguer en arrière
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false)
      router.back()
    }
  }

  // Gestion du bouton retour du navigateur
  useEffect(() => {
    const handlePopState = () => {
      setOpen(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        {children}
      </DialogContent>
    </Dialog>
  )
} 