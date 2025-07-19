import Link from 'next/link'
import { ArrowLeft, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserNotFound() {
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
          <h1 className="text-3xl font-bold">Utilisateur non trouvé</h1>
          <p className="text-muted-foreground">
            L'utilisateur demandé n'existe pas ou a été supprimé
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <UserX className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Utilisateur introuvable</CardTitle>
          <CardDescription>
            L'utilisateur que vous cherchez n'existe pas ou vous n'avez pas les permissions pour le voir.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Que souhaitez-vous faire ?
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/admin/users">
                  Voir tous les utilisateurs
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">
                  Retour au tableau de bord
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 