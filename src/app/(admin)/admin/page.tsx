import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Activity,
  Building2,
  Settings
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { getAdminStats } from '@/features/admin/actions/stats'
import { AdminStatsCards, AdminStatsCardsSkeleton } from '@/features/admin/components/admin-stats-cards'

async function StatsSection() {
  const statsResult = await getAdminStats()

  if (!statsResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur: {statsResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return <AdminStatsCards stats={statsResult.data!} />
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du système et accès aux fonctionnalités d'administration
        </p>
      </div>

      {/* Statistiques principales */}
      <Suspense fallback={<AdminStatsCardsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Actions rapides */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription>
                Créer, modifier et gérer les comptes utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/users">
                  Accéder
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Gestion des organisations
              </CardTitle>
              <CardDescription>
                Superviser les organisations et leurs membres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/organizations">
                  Accéder
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs d'activité
              </CardTitle>
              <CardDescription>
                Consulter l'historique des actions système
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/logs">
                  Consulter
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres système
              </CardTitle>
              <CardDescription>
                Configurer les paramètres de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/settings">
                  Configurer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}