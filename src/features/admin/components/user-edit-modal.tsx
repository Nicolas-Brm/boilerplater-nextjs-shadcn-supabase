'use client'

import { useRouter } from 'next/navigation'
import { DialogTitle } from '@/components/ui/dialog'
import { UserEditForm } from './user-edit-form'
import { type AdminUser } from '../types'

interface UserEditModalProps {
  user: AdminUser
}

export function UserEditModal({ user }: UserEditModalProps) {
  const router = useRouter()

  const handleSuccess = () => {
    // Fermer le modal en retournant à la page précédente
    router.back()
  }

  return (
    <div className="max-w-2xl">
      {/* DialogTitle caché pour l'accessibilité */}
      <DialogTitle className="absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden">
        Modifier l'utilisateur {user.firstName} {user.lastName}
      </DialogTitle>
      
      <div className="space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Modifier l'utilisateur
        </h2>
        <p className="text-sm text-muted-foreground">
          Modifiez les informations de l'utilisateur {user.firstName} {user.lastName}
        </p>
      </div>
      
      <UserEditForm user={user} onSuccess={handleSuccess} />
    </div>
  )
} 