import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Settings } from 'lucide-react'
import { CreateOrganizationForm } from '@/features/organization/components/create-organization-form'
import { MembersManagement } from '@/features/organization/components/members-management'
import { OrganizationSettingsForm } from '@/features/organization/components/organization-settings-form'
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Votre organisation
              </CardTitle>
              <CardDescription>
                Créez ou gérez votre organisation principale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<OrganizationSkeleton />}>
                <CreateOrganizationForm />
              </Suspense>
            </CardContent>
          </Card>
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

// Composant wrapper pour récupérer l'organisation et passer les props
async function OrganizationMembersWrapper() {
  // TODO: Récupérer l'organisation de l'utilisateur
  // Pour l'instant, on utilise un ID factice
  const organizationId = "temp-org-id"
  const userRole = "owner"

  return (
    <MembersManagement 
      organizationId={organizationId} 
      userRole={userRole} 
    />
  )
}

export const metadata = {
  title: 'Organisations',
  description: 'Gérez vos organisations et leurs membres',
} 