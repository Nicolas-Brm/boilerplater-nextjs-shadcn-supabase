'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserPlus, Edit } from 'lucide-react'

interface UserQuickActionsProps {
  userId?: string
}

export function UserQuickActions({ userId }: UserQuickActionsProps) {
  const router = useRouter()

  const handleCreateUser = () => {
    router.push('/admin/users/new')
  }

  const handleEditUser = () => {
    if (userId) {
      router.push(`/admin/users/${userId}/edit`)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleCreateUser} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        Nouveau
      </Button>
      
      {userId && (
        <Button onClick={handleEditUser} size="sm" variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      )}
    </div>
  )
} 