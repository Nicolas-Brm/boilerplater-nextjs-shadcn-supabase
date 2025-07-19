import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUser } from '@/features/admin/actions'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'
import { UserEditForm } from '@/features/admin/components/user-edit-form'

async function UserEditContent({ userId }: { userId: string }) {
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
      {/* Informations utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Modification de l'utilisateur
          </CardTitle>
          <CardDescription>
            Modifier les informations de {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.email
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Créé le:</strong> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'édition */}
      <UserEditForm user={user} />
    </div>
  )
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Vérifier les permissions admin
  await requireAdmin([Permission.UPDATE_USERS])

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
          <Link href={`/admin/users/${userId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails
          </Link>
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold">Modifier l'utilisateur</h1>
          <p className="text-muted-foreground">
            Modifier les informations et permissions de l'utilisateur
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
                  <div className="h-6 w-48 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-10 w-full bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        }
      >
        <UserEditContent userId={userId} />
      </Suspense>
    </div>
  )
} 