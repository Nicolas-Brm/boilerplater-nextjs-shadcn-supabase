'use client'

import { useRouter } from 'next/navigation'
import { DialogTitle } from '@/components/ui/dialog'
import { UserCreateForm } from './user-create-form'

export function UserCreateModal() {
  const router = useRouter()

  const handleSuccess = () => {
    // Fermer le modal en retournant à la page précédente
    router.back()
  }

  return (
    <div className="max-w-2xl">
      {/* DialogTitle caché pour l'accessibilité */}
      <DialogTitle className="absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden">
        Créer un nouvel utilisateur
      </DialogTitle>
      
      <div className="space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Créer un utilisateur
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez un nouveau compte utilisateur pour la plateforme
        </p>
      </div>
      
      <UserCreateForm onSuccess={handleSuccess} />
    </div>
  )
} 