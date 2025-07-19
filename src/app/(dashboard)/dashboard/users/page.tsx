import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function UsersPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des utilisateurs
            </CardTitle>
            <CardDescription>
              Gérez les utilisateurs de votre application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              Interface de gestion des utilisateurs à venir...
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export const metadata = {
  title: 'Utilisateurs',
  description: 'Gestion des utilisateurs',
} 