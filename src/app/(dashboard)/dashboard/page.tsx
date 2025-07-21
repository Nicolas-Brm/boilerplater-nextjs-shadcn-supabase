import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'
import { requireAuth } from '@/lib/auth'
import { SystemInfoDisplay } from '@/components/system-info-display'
import { OrganizationDataProvider } from '@/features/organization/components'
import { getCurrentOrganization } from '@/features/organization/actions/get-current-organization'

interface DashboardPageProps {
  searchParams: Promise<{
    organizationId?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  
  return (
    <OrganizationDataProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Tableau de bord de votre application
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-3 space-y-4">
            {/* Informations de l'organisation courante */}
            <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-lg" />}>
              <CurrentOrganizationCard organizationId={params.organizationId} />
            </Suspense>
            
            {/* Informations système */}
            <SystemInfoDisplay />
            
            {/* Informations du compte */}
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-lg" />}>
              <UserInfoCard />
            </Suspense>
          </div>
        </div>
      </div>
    </OrganizationDataProvider>
  )
}

async function CurrentOrganizationCard({ organizationId }: { organizationId?: string }) {
  const { organization, membership } = await getCurrentOrganization(organizationId)
  
  if (!organization || !membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organisation courante
          </CardTitle>
          <CardDescription>
            Aucune organisation sélectionnée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous devez créer ou rejoindre une organisation pour commencer.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organisation courante
        </CardTitle>
        <CardDescription>
          {organization.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Votre rôle</p>
            <Badge variant="outline">
              {membership.role === 'owner' ? 'Propriétaire' : membership.role}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Plan</p>
            <Badge variant="secondary">
              {organization.planType}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <Badge variant={organization.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
              {organization.subscriptionStatus === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Limite membres</p>
            <p className="text-lg font-semibold">{organization.maxMembers}</p>
          </div>
        </div>
        
        {organization.description && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">{organization.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function UserInfoCard() {
  const user = await requireAuth()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations du compte</CardTitle>
        <CardDescription>
          Bienvenue, {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm"><strong>Email:</strong> {user.email}</p>
            <p className="text-sm"><strong>ID:</strong> {user.id.slice(0, 8)}...</p>
            <p className="text-sm"><strong>Créé le:</strong> {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
            <p className="text-sm"><strong>Dernière connexion:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Connecté</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Email vérifié: {user.email_confirmed_at ? 'Oui' : 'Non'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const metadata = {
  title: 'Dashboard',
  description: 'Votre espace personnel',
} 