import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="mt-4 text-red-600">
            Erreur d'authentification
          </CardTitle>
          <CardDescription>
            Il y a eu un problème lors de la vérification de votre code d'authentification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p>Cela peut être dû à :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Un lien d'authentification expiré</li>
              <li>Un lien déjà utilisé</li>
              <li>Un problème de réseau</li>
            </ul>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button asChild>
              <Link href="/login">
                Retourner à la connexion
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/register">
                Créer un nouveau compte
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Erreur d\'authentification',
  description: 'Une erreur est survenue lors de l\'authentification',
} 