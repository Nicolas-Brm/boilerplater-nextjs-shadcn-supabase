import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Edit, Shield, Mail, Calendar, Activity, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getUser } from '@/features/admin/actions'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission, UserRole } from '@/features/admin/types'

function UserRoleBadge({ role }: { role: UserRole }) {
  const roleConfig = {
    [UserRole.USER]: { color: 'default', icon: null },
    [UserRole.MODERATOR]: { color: 'secondary', icon: <Shield className="h-3 w-3" /> },
    [UserRole.ADMIN]: { color: 'destructive', icon: <Shield className="h-3 w-3" /> },
    [UserRole.SUPER_ADMIN]: { color: 'destructive', icon: <Shield className="h-3 w-3" /> },
  } as const

  const config = roleConfig[role]

  return (
    <Badge variant={config.color as "default" | "secondary" | "destructive" | "outline"} className="gap-1">
      {config.icon}
      {role.replace('_', ' ')}
    </Badge>
  )
}

function UserStatusBadge({ isActive, emailVerified }: { isActive: boolean; emailVerified: boolean }) {
  if (!isActive) {
    return <Badge variant="destructive">Désactivé</Badge>
  }

  if (!emailVerified) {
    return <Badge variant="outline">Email non vérifié</Badge>
  }

  return <Badge variant="default">Actif</Badge>
}

async function UserDetailsContent({ userId }: { userId: string }) {
  const userResult = await getUser(userId)

  if (!userResult.success || !userResult.data) {
    if (userResult.error === 'Utilisateur non trouvé') {
      notFound()
    }
    
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur lors du chargement de l'utilisateur: {userResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  const user = userResult.data

  return (
    <div className="space-y-6">
      {/* En-tête utilisateur */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'Nom non renseigné'
                    }
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <UserRoleBadge role={user.role} />
                  <UserStatusBadge isActive={user.isActive} emailVerified={user.emailVerified} />
                </div>
              </div>
            </div>
            
            <Button asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground">Prénom</dt>
              <dd className="text-sm">{user.firstName || 'Non renseigné'}</dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground">Nom</dt>
              <dd className="text-sm">{user.lastName || 'Non renseigné'}</dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </dt>
              <dd className="text-sm">{user.email}</dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground">Rôle</dt>
              <dd className="text-sm">
                <UserRoleBadge role={user.role} />
              </dd>
            </div>
          </CardContent>
        </Card>

        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground">Statut</dt>
              <dd className="text-sm">
                <UserStatusBadge isActive={user.isActive} emailVerified={user.emailVerified} />
              </dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground">Email vérifié</dt>
              <dd className="text-sm">
                {user.emailVerified ? (
                  <Badge variant="default">Vérifié</Badge>
                ) : (
                  <Badge variant="outline">Non vérifié</Badge>
                )}
              </dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Créé le
              </dt>
              <dd className="text-sm">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
            
            <Separator />
            
            <div className="grid gap-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Dernière connexion
              </dt>
              <dd className="text-sm">
                {user.lastSignInAt 
                  ? new Date(user.lastSignInAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Jamais connecté'
                }
              </dd>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Actions rapides pour la gestion de cet utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier les informations
              </Link>
            </Button>
            
            <Button variant="outline" disabled>
              <Shield className="mr-2 h-4 w-4" />
              Gérer les permissions
            </Button>
            
            <Button variant="outline" disabled>
              <Activity className="mr-2 h-4 w-4" />
              Voir l'activité
            </Button>
            
            {user.isActive ? (
              <Button variant="destructive" disabled>
                Désactiver le compte
              </Button>
            ) : (
              <Button variant="default" disabled>
                Activer le compte
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Vérifier les permissions admin
  await requireAdmin([Permission.VIEW_USERS])

  // Attendre les params
  const resolvedParams = await params
  const { id: userId } = resolvedParams

  // Validation basique de l'ID
  if (!userId || typeof userId !== 'string') {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
          <p className="text-muted-foreground">
            Informations détaillées et gestion du compte utilisateur
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <Suspense 
        fallback={
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-6 w-48 bg-muted rounded" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="animate-pulse space-y-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-4 bg-muted rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <UserDetailsContent userId={userId} />
      </Suspense>
    </div>
  )
} 