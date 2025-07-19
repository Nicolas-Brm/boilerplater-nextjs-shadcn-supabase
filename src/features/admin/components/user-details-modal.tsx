import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Edit, Mail, User, Calendar, Shield, Activity } from 'lucide-react'
import Link from 'next/link'
import { AdminModalWithHeader } from './modal-with-header'
import type { AdminUser } from '../types'

interface UserDetailsModalProps {
  user: AdminUser
}

export function UserDetailsModal({ user }: UserDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive'
      case 'admin':
        return 'secondary'
      case 'moderator':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'admin':
        return 'Administrateur'
      case 'moderator':
        return 'Modérateur'
      case 'user':
        return 'Utilisateur'
      default:
        return role
    }
  }

  return (
    <AdminModalWithHeader
      title={`${user.firstName} ${user.lastName}`}
      description={user.email}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Prénom
                </label>
                <p className="text-sm">{user.firstName}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Nom
                </label>
                <p className="text-sm">{user.lastName}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-sm">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rôle et permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rôle et statut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Rôle
                </label>
                <div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <label className="text-sm font-medium text-muted-foreground">
                  Statut
                </label>
                <div>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    <Activity className="mr-1 h-3 w-3" />
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations de dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Historique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Créé le
                </label>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Dernière modification
                </label>
                <p className="text-sm">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>
    </AdminModalWithHeader>
  )
} 