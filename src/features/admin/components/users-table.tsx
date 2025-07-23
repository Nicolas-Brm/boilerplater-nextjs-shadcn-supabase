'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Users as UsersIcon
} from 'lucide-react'
import { AdminUser, UserRole } from '../types'
import { deleteUser } from '../actions'
import { toast } from 'sonner'

interface UsersTableProps {
  users: AdminUser[]
  onUserUpdate?: () => void
}

export function UsersTable({ users, onUserUpdate }: UsersTableProps) {
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    setDeletingUserId(userId)
    
    try {
      const result = await deleteUser(userId)
      
      if (result.success) {
        toast.success('Utilisateur supprimé avec succès')
        onUserUpdate?.()
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setDeletingUserId(null)
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'destructive'
      case UserRole.ADMIN:
        return 'default'
      case UserRole.MODERATOR:
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin'
      case UserRole.ADMIN:
        return 'Admin'
      case UserRole.MODERATOR:
        return 'Modérateur'
      default:
        return 'Utilisateur'
    }
  }

  if (users.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <UsersIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Aucun utilisateur trouvé</p>
        <p className="text-sm">Modifiez vos filtres ou créez un nouvel utilisateur.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      {user.lastName?.[0]?.toUpperCase() || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : 'Nom non défini'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-xs">
                      Email vérifié
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.lastSignInAt ? (
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(user.lastSignInAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Jamais</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    locale: fr
                  })}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      disabled={deletingUserId === user.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/users/${user.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive"
                      disabled={deletingUserId === user.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deletingUserId === user.id ? 'Suppression...' : 'Supprimer'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function UsersTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-5 bg-muted rounded w-12 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}