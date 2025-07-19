'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DialogTitle } from '@/components/ui/dialog'
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Edit 
} from 'lucide-react'
import { type AdminUser } from '../types'

interface UserDetailsModalProps {
  user: AdminUser
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'destructive'
    case 'ADMIN':
      return 'secondary'
    case 'MODERATOR':
      return 'outline'
    default:
      return 'default'
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Administrateur'
    case 'ADMIN':
      return 'Administrateur'
    case 'MODERATOR':
      return 'Modérateur'
    case 'USER':
      return 'Utilisateur'
    default:
      return role
  }
}

export function UserDetailsModal({ user }: UserDetailsModalProps) {
  return (
    <div className="max-w-2xl">
      {/* DialogTitle caché pour l'accessibilité */}
      <DialogTitle className="absolute left-[-10000px] w-[1px] h-[1px] overflow-hidden">
        Détails de l'utilisateur {user.firstName} {user.lastName}
      </DialogTitle>
      
      <div className="space-y-1.5 text-center sm:text-left mb-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          Détails de l'utilisateur
        </h2>
        <p className="text-sm text-muted-foreground">
          Informations détaillées de {user.firstName} {user.lastName}
        </p>
      </div>

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
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-sm">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statut et rôle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Statut et permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Rôle
                </label>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Statut du compte
                </label>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Actif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">Inactif</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Vérification email
              </label>
              <div className="flex items-center gap-2">
                {user.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Vérifié</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600">Non vérifié</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historique */}
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
            
            {user.lastSignInAt && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Dernière connexion
                </label>
                <p className="text-sm">{formatDate(user.lastSignInAt)}</p>
              </div>
            )}
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
    </div>
  )
} 