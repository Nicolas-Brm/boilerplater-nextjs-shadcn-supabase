import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getUsers } from '@/features/admin/actions'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission, UserRole, type AdminUser } from '@/features/admin/types'
import { 
  UserPlus, 
  Eye, 
  Edit, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function UserRoleBadge({ role }: { role: UserRole }) {
  const roleColors = {
    [UserRole.USER]: 'default',
    [UserRole.MODERATOR]: 'secondary',
    [UserRole.ADMIN]: 'destructive',
    [UserRole.SUPER_ADMIN]: 'destructive',
  } as const

  return (
    <Badge variant={roleColors[role] as "default" | "secondary" | "destructive" | "outline"}>
      {role.replace('_', ' ')}
    </Badge>
  )
}

function UserStatusBadge({ isActive, emailVerified }: { isActive: boolean; emailVerified: boolean }) {
  if (!isActive) {
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Désactivé
      </Badge>
    )
  }

  if (!emailVerified) {
    return (
      <Badge variant="outline" className="gap-1">
        <Clock className="h-3 w-3" />
        Email non vérifié
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <CheckCircle className="h-3 w-3" />
      Actif
    </Badge>
  )
}

async function UsersTable({ searchParams }: { searchParams: URLSearchParams }) {
  const usersResult = await getUsers(searchParams)

  if (!usersResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur lors du chargement des utilisateurs: {usersResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!usersResult.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Données non disponibles</p>
        </CardContent>
      </Card>
    )
  }

  const { users, pagination } = usersResult.data

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun utilisateur ne correspond aux critères de recherche.
            </p>
            <Button asChild>
              <Link href="/admin/users/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un utilisateur
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({pagination.total})</CardTitle>
          <CardDescription>
            Page {pagination.page} sur {pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: AdminUser) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : 'Nom non renseigné'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <UserStatusBadge 
                      isActive={user.isActive} 
                      emailVerified={user.emailVerified} 
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastSignInAt 
                      ? new Date(user.lastSignInAt).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir le détail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} 
            {' '}sur {pagination.total} utilisateurs
          </div>
          
          <div className="flex items-center space-x-2">
            {pagination.page > 1 && (
              <Button variant="outline" size="sm" asChild>
                <Link 
                  href={`/admin/users?${new URLSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: (pagination.page - 1).toString()
                  })}`}
                >
                  Précédent
                </Link>
              </Button>
            )}
            
            <span className="text-sm">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            
            {pagination.page < pagination.totalPages && (
              <Button variant="outline" size="sm" asChild>
                <Link 
                  href={`/admin/users?${new URLSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: (pagination.page + 1).toString()
                  })}`}
                >
                  Suivant
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Vérifier les permissions admin
  await requireAdmin([Permission.VIEW_USERS])

  // Attendre les searchParams
  const resolvedSearchParams = await searchParams

  // Convertir searchParams en URLSearchParams
  const urlSearchParams = new URLSearchParams()
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérer les comptes utilisateurs et leurs permissions
          </p>
        </div>
        
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Créer un utilisateur
          </Link>
        </Button>
      </div>

      {/* Filtres de recherche - À implémenter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Filtres de recherche à implémenter...
          </p>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Suspense 
        fallback={
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <UsersTable searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
} 