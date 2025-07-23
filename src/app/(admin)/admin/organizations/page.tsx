import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Search } from 'lucide-react'
import { getOrganizations } from '@/features/admin/actions/organizations'
import { OrganizationsTable, OrganizationsTableSkeleton } from '@/features/admin/components/organizations-table'

interface OrganizationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function OrganizationsContent({ searchParams }: { searchParams: URLSearchParams }) {
  const orgsResult = await getOrganizations(searchParams)

  if (!orgsResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur: {orgsResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orgsResult.data!.pagination.total} organisation{orgsResult.data!.pagination.total > 1 ? 's' : ''} trouvée{orgsResult.data!.pagination.total > 1 ? 's' : ''}
        </p>
        
        {orgsResult.data!.pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {orgsResult.data!.pagination.page} sur {orgsResult.data!.pagination.totalPages}
            </span>
          </div>
        )}
      </div>
      
      <OrganizationsTable organizations={orgsResult.data!.organizations} />
    </div>
  )
}

export default async function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const resolvedSearchParams = await searchParams
  const urlSearchParams = new URLSearchParams()
  
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  })

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestion des organisations</h1>
            <p className="text-muted-foreground">
              Superviser les organisations et leurs activités
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Rechercher par nom ou description..."
                  defaultValue={urlSearchParams.get('search') || ''}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select name="planType" defaultValue={urlSearchParams.get('planType') || 'all'}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tous les plans" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select name="subscriptionStatus" defaultValue={urlSearchParams.get('subscriptionStatus') || 'all'}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
                <SelectItem value="suspended">Suspendues</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">
              Filtrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des organisations */}
      <Suspense fallback={<OrganizationsTableSkeleton />}>
        <OrganizationsContent searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
}