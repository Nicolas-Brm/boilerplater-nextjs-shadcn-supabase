import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminStats } from '@/features/admin/actions'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Activity,
  AlertTriangle,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react'

function AdminStatsCards({ stats }: { stats: any }) {

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Tous les utilisateurs enregistrés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Comptes actifs et vérifiés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Inscriptions du mois en cours
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modération</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingModeration}</div>
          <p className="text-xs text-muted-foreground">
            Éléments en attente
          </p>
        </CardContent>
      </Card>
    </>
  )
}

function SystemLoadCards({ systemLoad }: { systemLoad: any }) {

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemLoad.cpu}%</div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${systemLoad.cpu}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mémoire</CardTitle>
          <MemoryStick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemLoad.memory}%</div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${systemLoad.memory}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stockage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{systemLoad.storage}%</div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${systemLoad.storage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AdminDashboardPage() {
  // Fetch stats once here instead of in each component
  let statsResult
  
  try {
    statsResult = await getAdminStats()
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    statsResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }
  }
  
  // For debugging, use a simpler approach  
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Erreur d'authentification</h1>
        <p className="text-destructive">Utilisateur non connecté</p>
      </div>
    )
  }

  // Récupérer le profil admin directement
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Erreur de profil</h1>
        <p className="text-destructive">
          Profil utilisateur non trouvé. Connectez-vous sur <a href="/admin/debug" className="underline">/admin/debug</a> pour diagnostiquer.
        </p>
      </div>
    )
  }

  const adminUser = {
    id: profile.id,
    email: user.email || '',
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    role: profile.role,
    isActive: profile.is_active
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground">
          Bienvenue {adminUser.firstName} {adminUser.lastName}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsResult.success && statsResult.data ? (
          <AdminStatsCards stats={statsResult.data} />
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive">
                  Erreur lors du chargement des statistiques: {statsResult.error || 'Erreur inconnue'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Charge système */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Charge système</h2>
        {statsResult.success && statsResult.data?.systemLoad ? (
          <SystemLoadCards systemLoad={statsResult.data.systemLoad} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Données de charge système non disponibles
              </p>
            </CardContent>
          </Card>
        )}
      </div>

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
              <a 
                href="/admin/users" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Accéder
              </a>
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
              <a 
                href="/admin/logs" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Consulter
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Paramètres système
              </CardTitle>
              <CardDescription>
                Configurer les paramètres de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="/admin/settings" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Configurer
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Badge de rôle */}
      <div className="flex justify-end">
        <Badge variant="outline" className="gap-2">
          <Activity className="h-3 w-3" />
          {adminUser.role.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
    </div>
  )
} 