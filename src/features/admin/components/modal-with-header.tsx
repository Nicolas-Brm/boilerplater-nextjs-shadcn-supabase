'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AdminModal } from './modal'

interface AdminModalWithHeaderProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AdminModalWithHeader({
  title,
  description,
  children,
  className
}: AdminModalWithHeaderProps) {
  const router = useRouter()

  return (
    <AdminModal className={className}>
      <DialogHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </Button>
      </DialogHeader>
      {children}
    </AdminModal>
  )
} 