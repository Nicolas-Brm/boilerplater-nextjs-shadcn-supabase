import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Users, Settings, Trash2 } from 'lucide-react'
import { CreateOrganizationForm } from '@/features/organization/components/create-organization-form'
import { MembersManagement } from '@/features/organization/components/members-management'
import { OrganizationSettingsForm } from '@/features/organization/components/organization-settings-form'
import { DeleteOrganizationDialog } from '@/features/organization/components/delete-organization-dialog'
import { getCurrentUserOrganization } from '@/features/organization/actions'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function OrganizationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function OrganizationsPage() {
  return (
    <>
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
            <OrganizationOverviewWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Suspense fallback={<OrganizationSkeleton />}>
            <OrganizationMembersWrapper />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de l'organisation
              </CardTitle>
              <CardDescription>
                Configurez les paramètres de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<OrganizationSkeleton />}>
                <OrganizationSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

// Composant wrapper pour l'onglet Vue d'ensemble
async function OrganizationOverviewWrapper() {
  const { organization, membership } = await getCurrentUserOrganization()
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informations générales</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Nom d'organisation:</dt>
                  <dd className="font-mono">{organization.slug}</dd>
                </div>
                {organization.website && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Site web:</dt>
                    <dd>
                      <a 
                        href={organization.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {organization.website}
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Votre rôle:</dt>
                  <dd className="capitalize">{membership.role === 'owner' ? 'Propriétaire' : membership.role}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Plan:</dt>
                  <dd className="capitalize">{organization.planType}</dd>
                </div>
              </dl>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Statistiques</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Limite de membres:</dt>
                  <dd>{organization.maxMembers}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Créée le:</dt>
                  <dd>{new Date(organization.createdAt).toLocaleDateString('fr-FR')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Statut:</dt>
                  <dd className="text-green-600">{organization.subscriptionStatus}</dd>
                </div>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Gérer les membres</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Paramètres</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Building2 className="h-6 w-6" />
              <span>Tableau de bord</span>
            </Button>
            {membership.role === 'owner' && (
              <DeleteOrganizationDialog organization={organization}>
                <Button variant="outline" className="h-20 flex-col gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-6 w-6" />
                  <span>Supprimer</span>
                </Button>
              </DeleteOrganizationDialog>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant wrapper pour récupérer l'organisation et passer les props
async function OrganizationMembersWrapper() {
  const { organization, membership } = await getCurrentUserOrganization()
  
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

  return (
    <MembersManagement 
      organizationId={organization.id} 
      userRole={membership.role} 
    />
  )
}

export const metadata = {
  title: 'Organisations',
  description: 'Gérez vos organisations et leurs membres',
} 