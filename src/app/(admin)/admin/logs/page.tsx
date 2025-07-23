import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Search, Download } from 'lucide-react'
import { getActivityLogs } from '@/features/admin/actions/activity-logs'
import { ActivityLogsTable, ActivityLogsTableSkeleton } from '@/features/admin/components/activity-logs-table-clean'

interface LogsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function LogsContent({ searchParams }: { searchParams: URLSearchParams }) {
  const logsResult = await getActivityLogs(searchParams)

  if (!logsResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erreur: {logsResult.error}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {logsResult.data!.pagination.total} activité{logsResult.data!.pagination.total > 1 ? 's' : ''} trouvée{logsResult.data!.pagination.total > 1 ? 's' : ''}
        </p>
        
        <div className="flex items-center gap-4">
          {logsResult.data!.pagination.totalPages > 1 && (
            <span className="text-sm text-muted-foreground">
              Page {logsResult.data!.pagination.page} sur {logsResult.data!.pagination.totalPages}
            </span>
          )}
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
        </div>
      </div>
      
      <ActivityLogsTable logs={logsResult.data!.logs} />
    </div>
  )
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
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
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Logs d'activité</h1>
            <p className="text-muted-foreground">
              Consultation et analyse de l'historique système
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
                  name="action"
                  placeholder="Rechercher par action..."
                  defaultValue={urlSearchParams.get('action') || ''}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select name="resource" defaultValue={urlSearchParams.get('resource') || 'all'}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Toutes les ressources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ressources</SelectItem>
                <SelectItem value="users">Utilisateurs</SelectItem>
                <SelectItem value="organizations">Organisations</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>

            <Input
              name="startDate"
              type="date"
              defaultValue={urlSearchParams.get('startDate') || ''}
              className="w-full sm:w-48"
            />

            <Input
              name="endDate"
              type="date"
              defaultValue={urlSearchParams.get('endDate') || ''}
              className="w-full sm:w-48"
            />

            <Button type="submit">
              Filtrer
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des logs */}
      <Suspense fallback={<ActivityLogsTableSkeleton />}>
        <LogsContent searchParams={urlSearchParams} />
      </Suspense>
    </div>
  )
}