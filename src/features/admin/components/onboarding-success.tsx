import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Shield, User, Settings } from 'lucide-react'

interface OnboardingSuccessProps {
  isUserLoggedIn?: boolean
}

export function OnboardingSuccess({ isUserLoggedIn = false }: OnboardingSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">
              🎉 Félicitations !
            </CardTitle>
            <CardDescription className="text-lg">
              Votre SaaS est maintenant configuré et prêt à être utilisé
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Première configuration terminée
            </h3>
            <p className="text-muted-foreground">
              Le premier compte superadmin a été créé avec succès. 
              Vous pouvez maintenant vous connecter et commencer à gérer votre plateforme.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <User className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">Gestion utilisateurs</h4>
                <p className="text-sm text-muted-foreground">Créer et gérer les comptes</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <h4 className="font-medium">Configuration</h4>
                <p className="text-sm text-muted-foreground">Paramètres système</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium">Sécurité</h4>
                <p className="text-sm text-muted-foreground">Rôles et permissions</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Prochaines étapes :</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Compte superadmin créé
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground mr-2" />
                Se connecter avec vos identifiants
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground mr-2" />
                Configurer les paramètres de votre SaaS
              </li>
              <li className="flex items-center">
                <ArrowRight className="h-4 w-4 text-muted-foreground mr-2" />
                Créer d'autres comptes utilisateurs
              </li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            {isUserLoggedIn ? (
              <Button asChild className="flex-1">
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Accéder à l'administration
                </Link>
              </Button>
            ) : (
              <Button asChild className="flex-1">
                <Link href="/login">
                  <Shield className="mr-2 h-4 w-4" />
                  Se connecter maintenant
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/">
                Retour à l'accueil
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4">
            <Badge variant="secondary">
              Configuration initiale terminée
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 