import { Suspense } from 'react'
import { getCurrentUserOrganization } from '../actions'
import { OrganizationSettingsForm } from './organization-settings-form'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, AlertTriangle } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

async function OrganizationSettingsContent() {
  try {
    const result = await getCurrentUserOrganization()
    
    if (!result.organization) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Aucune organisation
            </CardTitle>
            <CardDescription>
              Vous n'êtes membre d'aucune organisation pour le moment.
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }

    const { organization, membership } = result
    const canEdit = membership?.role === 'owner' || membership?.role === 'admin'

    return <OrganizationSettingsForm organization={organization} canEdit={canEdit} />
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres d\'organisation:', error)
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Une erreur est survenue lors du chargement des paramètres d'organisation.
        </AlertDescription>
      </Alert>
    )
  }
}

export function OrganizationSettingsWrapper() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <OrganizationSettingsContent />
    </Suspense>
  )
}