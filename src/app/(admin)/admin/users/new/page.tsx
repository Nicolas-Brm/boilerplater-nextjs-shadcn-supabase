import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserCreateForm } from '@/features/admin/components/user-create-form'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'

export default async function NewUserPage() {
  // Vérifier les permissions admin
  await requireAdmin([Permission.CREATE_USERS])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Créer un utilisateur</h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau compte utilisateur au système
          </p>
        </div>
      </div>

      <UserCreateForm />
    </div>
  )
} 