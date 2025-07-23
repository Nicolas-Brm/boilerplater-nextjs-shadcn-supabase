'use client'

import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Activity,
  User,
  Building2,
  Settings,
  Database,
  Shield
} from 'lucide-react'
import { ActivityLog } from '../types'

interface ActivityLogsTableProps {
  logs: ActivityLog[]
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  const getActionIcon = (action: string) => {
    if (action.includes('USER')) return User
    if (action.includes('ORGANIZATION')) return Building2
    if (action.includes('SETTINGS')) return Settings
    if (action.includes('SYSTEM')) return Database
    if (action.includes('ADMIN')) return Shield
    return Activity
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('CREATE')) return 'default'
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'secondary'
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'destructive'
    if (action.includes('VIEW') || action.includes('LOGIN')) return 'outline'
    return 'secondary'
  }

  const getActionLabel = (action: string) => {
    // Conversion des actions en français
    const actionMap: Record<string, string> = {
      'VIEW_USERS': 'Consultation utilisateurs',
      'VIEW_USER': 'Consultation utilisateur',
      'CREATE_USER': 'Création utilisateur',
      'UPDATE_USER': 'Modification utilisateur',
      'DELETE_USER': 'Suppression utilisateur',
      'VIEW_ORGANIZATIONS': 'Consultation organisations',
      'VIEW_ORGANIZATION': 'Consultation organisation',
      'CREATE_ORGANIZATION': 'Création organisation',
      'UPDATE_ORGANIZATION': 'Modification organisation',
      'VIEW_ADMIN_STATS': 'Consultation statistiques',
      'VIEW_ANALYTICS': 'Consultation analytics',
      'VIEW_LOGS': 'Consultation logs',
      'EXPORT_LOGS': 'Export logs',
      'UPDATE_SETTINGS': 'Modification paramètres',
      'LOGIN': 'Connexion',
      'LOGOUT': 'Déconnexion'
    }
    
    return actionMap[action] || action.replace(/_/g, ' ')
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'users':
        return User
      case 'organizations':
        return Building2
      case 'system':
        return Database
      default:
        return Activity
    }
  }

  if (logs.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <Activity className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Aucune activité trouvée</p>
        <p className="text-sm">Modifiez vos filtres de recherche.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Ressource</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Adresse IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const ActionIcon = getActionIcon(log.action)
            const ResourceIcon = getResourceIcon(log.resource)
            
            return (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {log.user?.firstName?.[0]?.toUpperCase() || 
                         log.user?.email?.[0]?.toUpperCase() || 
                         '?'}
                        {log.user?.lastName?.[0]?.toUpperCase() || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {log.user?.firstName && log.user?.lastName 
                          ? `${log.user.firstName} ${log.user.lastName}`
                          : log.user?.email || 'Utilisateur supprimé'
                        }
                      </div>
                      {log.user?.email && (log.user?.firstName || log.user?.lastName) && (
                        <div className="text-sm text-muted-foreground">
                          {log.user.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ActionIcon className="h-4 w-4 text-muted-foreground" />
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ResourceIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{log.resource}</span>
                    {log.resourceId && (
                      <span className="text-xs text-muted-foreground font-mono">
                        #{log.resourceId.substring(0, 8)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {log.ipAddress}
                  </code>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function ActivityLogsTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Ressource</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Adresse IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-48 animate-pulse" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-muted rounded w-24 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-32 animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-6 bg-muted rounded w-24 animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}