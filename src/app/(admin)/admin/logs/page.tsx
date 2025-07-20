import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'
import { 
  ActivityStatsCards,
  ActivityLogsFilters,
  ActivityLogsTable,
  ActivityLogsExportButton
} from '@/features/admin/components'
import { Activity, Download } from 'lucide-react'

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Vérifier les permissions admin
  await requireAdmin([Permission.VIEW_LOGS])

  // Attendre les searchParams
  const resolvedSearchParams = await searchParams

  // Convertir searchParams en URLSearchParams
  const urlSearchParams = new URLSearchParams()
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Logs d'activité</h1>
              <p className="text-muted-foreground">
                Consultation et analyse de l'historique système
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Suspense fallback={
            <Button variant="outline" size="sm" disabled className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          }>
            <ActivityLogsExportButton />
          </Suspense>
        </div>
      </div>

      {/* Statistiques rapides */}
      <ActivityStatsCards />

      {/* Filtres */}
      <ActivityLogsFilters />

      {/* Tableau des logs */}
      <ActivityLogsTable />
    </div>
  )
} 