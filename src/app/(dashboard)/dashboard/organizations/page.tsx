import { Suspense } from 'react'
import { Building2, Users, Settings, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateOrganizationForm, CreateOrganizationModal, MembersManagementWrapper, LeaveOrganizationButtonWrapper, DeleteOrganizationDialog, OrganizationDataProvider, OrganizationAwareWrapper, OrganizationSettingsForm } from '@/features/organization/components'
import { getCurrentOrganization } from '@/features/organization/actions/get-current-organization'

function OrganizationSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface OrganizationPageProps {
  searchParams: Promise<{
    create?: string
    org?: string
  }>
}

export default async function OrganizationsPage({ searchParams }: OrganizationPageProps) {
  const params = await searchParams
  
  return (
    <OrganizationDataProvider>
      <OrganizationAwareWrapper>
        <Suspense fallback={<div className="h-8 w-20 bg-muted animate-pulse rounded" />}>
          <CreateOrganizationModal />
        </Suspense>
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Organisations</h2>
            <p className="text-muted-foreground">
              Gérez vos organisations et leurs membres
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Membres
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<OrganizationSkeleton />}>
              <OrganizationOverviewWrapper organizationSlug={params.org} />
            </Suspense>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Suspense fallback={<OrganizationSkeleton />}>
              <OrganizationMembersWrapper organizationSlug={params.org} />
            </Suspense>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Suspense fallback={<OrganizationSkeleton />}>
              <OrganizationSettingsWrapper organizationSlug={params.org} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </OrganizationAwareWrapper>
    </OrganizationDataProvider>
  )
}

// Composant wrapper pour l'onglet Vue d'ensemble
async function OrganizationOverviewWrapper({ organizationSlug }: { organizationSlug?: string }) {
  const { organization, membership } = await getCurrentOrganization(organizationSlug)
  
  if (!organization || !membership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Créer une organisation
          </CardTitle>
          <CardDescription>
            Créez votre organisation pour collaborer avec votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informations de l'organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization.name}
          </CardTitle>
          <CardDescription>
            {organization.description || 'Aucune description'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Votre rôle</p>
              <Badge variant="outline">
                {membership.role === 'owner' ? 'Propriétaire' : membership.role}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Slug de l'organisation</p>
            <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {organization.slug}
            </p>
          </div>

          {organization.website && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Site web</p>
              <a 
                href={organization.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {organization.website}
              </a>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Créée le</p>
            <p className="text-sm">
              {new Date(organization.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Zone dangereuse */}
      <OrganizationDangerZone organizationSlug={organizationSlug} />
    </div>
  )
}

// Composant pour la zone dangereuse
async function OrganizationDangerZone({ organizationSlug }: { organizationSlug?: string }) {
  const { organization, membership } = await getCurrentOrganization(organizationSlug)
  
  if (!organization || !membership) {
    return null
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Actions irréversibles concernant votre membership dans cette organisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
          <div>
            <h4 className="font-medium text-sm">Quitter l'organisation</h4>
            <p className="text-sm text-muted-foreground">
              Supprime définitivement votre membership. Vous devrez être réinvité pour rejoindre à nouveau.
            </p>
          </div>
          {organizationSlug && (
            <Suspense fallback={<div className="h-8 w-20 bg-muted animate-pulse rounded" />}>
              <LeaveOrganizationButtonWrapper
                organizationSlug={organizationSlug}
                organizationName={organization.name}
                userRole={membership.role}
                variant="destructive"
                size="sm"
              />
            </Suspense>
          )}
        </div>
        
        {membership.role === 'owner' && (
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium text-sm">Supprimer l'organisation</h4>
              <p className="text-sm text-muted-foreground">
                Supprime définitivement l'organisation et toutes ses données.
              </p>
            </div>
            <DeleteOrganizationDialog organization={organization}>
              <Button variant="destructive" size="sm">
                Supprimer
              </Button>
            </DeleteOrganizationDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Composant wrapper pour récupérer l'organisation et passer les props
async function OrganizationMembersWrapper({ organizationSlug }: { organizationSlug?: string }) {
  const { organization, membership } = await getCurrentOrganization(organizationSlug)
  
  if (!organization || !membership) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune organisation</h3>
        <p className="text-muted-foreground">
          Créez d'abord une organisation dans l'onglet "Vue d'ensemble" pour gérer les membres.
        </p>
      </div>
    )
  }

  if (!organizationSlug) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Slug d'organisation manquant</h3>
        <p className="text-muted-foreground">
          Impossible de charger les membres sans le slug de l'organisation.
        </p>
      </div>
    )
  }

  return (
    <Suspense fallback={<OrganizationSkeleton />}>
      <MembersManagementWrapper 
        organizationSlug={organizationSlug}
        userRole={membership.role} 
      />
    </Suspense>
  )
}

// Composant wrapper pour les paramètres d'organisation
async function OrganizationSettingsWrapper({ organizationSlug }: { organizationSlug?: string }) {
  const { organization, membership } = await getCurrentOrganization(organizationSlug)
  
  if (!organization || !membership) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucune organisation</h3>
        <p className="text-muted-foreground">
          Créez d'abord une organisation dans l'onglet "Vue d'ensemble" pour configurer les paramètres.
        </p>
      </div>
    )
  }

  const canEdit = ['owner', 'admin'].includes(membership.role)

  return (
    <div>
      <OrganizationSettingsForm 
        organization={organization}
        canEdit={canEdit}
      />
    </div>
  )
}

export const metadata = {
  title: 'Organisations',
  description: 'Gérez vos organisations et leurs membres',
} 