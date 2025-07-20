'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Activity, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { LogRow } from './activity-log-row'
import { getActivityLogs } from '../actions/analytics'
import type { ActivityLog } from '../types'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ActivityLogsTableSkeleton } from './activity-logs-skeleton'

interface LogsData {
  logs: ActivityLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function ActivityLogsTable() {
  const searchParams = useSearchParams()
  const [logsData, setLogsData] = useState<LogsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true)
      setError(null)

      const rawAction = searchParams.get('action')
      const rawResource = searchParams.get('resource')
      
      const filters = {
        userId: searchParams.get('userId') || undefined,
        action: rawAction && rawAction !== 'all' ? rawAction : undefined,
        resource: rawResource && rawResource !== 'all' ? rawResource : undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
      }



      const page = parseInt(searchParams.get('page') || '1', 10)
      const limit = parseInt(searchParams.get('limit') || '25', 10)

      try {
        const logsResult = await getActivityLogs(page, limit, filters)

        if (logsResult.success && logsResult.data) {
          setLogsData(logsResult.data)
        } else {
          setError(logsResult.error || 'Erreur inconnue')
        }
      } catch (err) {
        console.error('Erreur lors du chargement des logs:', err)
        setError('Erreur lors du chargement des logs')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [searchParams])

  if (loading) {
    return <ActivityLogsTableSkeleton />
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des logs: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!logsData) {
    return <ActivityLogsTableSkeleton />
  }

  const { logs, pagination } = logsData

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                Logs d'activité
                <Badge variant="secondary" className="ml-2 font-mono text-xs">
                  {pagination.total}
                </Badge>
              </CardTitle>
              <CardDescription>
                Historique détaillé des actions effectuées sur le système
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Page {pagination.page} / {pagination.totalPages}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {logs.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-muted/50">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Aucune activité trouvée</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Aucune activité ne correspond aux critères de recherche appliqués. 
                  Essayez de modifier vos filtres.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Action & Ressource</TableHead>
                      <TableHead className="font-semibold">Utilisateur</TableHead>
                      <TableHead className="font-semibold">Adresse IP</TableHead>
                      <TableHead className="font-semibold">Horodatage</TableHead>
                      <TableHead className="font-semibold text-center">Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <LogRow key={log.id} log={log} />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination améliorée */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    Affichage de <span className="font-medium text-foreground">
                      {((pagination.page - 1) * pagination.limit) + 1}
                    </span> à <span className="font-medium text-foreground">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span> sur <span className="font-medium text-foreground">
                      {pagination.total}
                    </span> entrées
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    asChild={pagination.page > 1}
                    className="h-8 px-3"
                  >
                    {pagination.page > 1 ? (
                      <Link 
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pagination.page - 1).toString()
                        })}`}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </span>
                    )}
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {pagination.page}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    asChild={pagination.page < pagination.totalPages}
                    className="h-8 px-3"
                  >
                    {pagination.page < pagination.totalPages ? (
                      <Link 
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (pagination.page + 1).toString()
                        })}`}
                        className="flex items-center gap-1"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1">
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 