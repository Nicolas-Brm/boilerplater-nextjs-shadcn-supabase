import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Search } from 'lucide-react'
import { getUsers } from '@/features/admin/actions/users'
import { UsersTable, UsersTableSkeleton } from '@/features/admin/components/users-table'
import { UserRole } from '@/features/admin/types/core'

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function UsersContent({ searchParams }: { searchParams: URLSearchParams }) {
  const usersResult = await getUsers(searchParams)

  if (!usersResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur: {usersResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {usersResult.data!.pagination.total} utilisateur{usersResult.data!.pagination.total > 1 ? 's' : ''} trouvé{usersResult.data!.pagination.total > 1 ? 's' : ''}
        </p>
        
        {usersResult.data!.pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {usersResult.data!.pagination.page} sur {usersResult.data!.pagination.totalPages}
            </span>
          </div>
        )}
      </div>
      
      <UsersTable users={usersResult.data!.users} />
    </div>
  )
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await searchParams
  const urlSearchParams = new URLSearchParams()
  
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  })

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Créer, modifier et gérer les comptes utilisateurs
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Créer un utilisateur
          </Link>
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher par nom ou email..."
                  defaultValue={urlSearchParams.get('search') || ''}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select name="role" defaultValue={urlSearchParams.get('role') || 'all'}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value={UserRole.USER}>Utilisateur</SelectItem>
                <SelectItem value={UserRole.MODERATOR}>Modérateur</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select name="isActive" defaultValue={urlSearchParams.get('isActive') || 'all'}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="true">Actifs</SelectItem>
                <SelectItem value="false">Inactifs</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              Filtrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Suspense fallback={<UsersTableSkeleton />}>
        <UsersContent searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
}