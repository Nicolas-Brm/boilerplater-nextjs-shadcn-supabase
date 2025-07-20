import Link from 'next/link'
import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { ActivityBadge } from './activity-log-badge'
import { ResourceIcon } from './activity-log-resource-icon'
import type { ActivityLog } from '../types'

interface LogRowProps {
  log: ActivityLog
}

export function LogRow({ log }: LogRowProps) {
  // Formatage simple du temps relatif
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Il y a ${diffInDays}j`
    
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <ResourceIcon resource={log.resource} />
          <div>
            <ActivityBadge action={log.action} />
            <p className="text-sm text-muted-foreground mt-1">
              {log.resource}
              {log.resourceId && (
                <span className="ml-1 font-mono text-xs">
                  ({log.resourceId.slice(0, 8)}...)
                </span>
              )}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {log.userId ? (
            <Link 
              href={`/admin/users/${log.userId}`}
              className="text-primary hover:underline transition-colors"
            >
              <span className="font-mono">{log.userId.slice(0, 8)}...</span>
            </Link>
          ) : (
            <span className="text-muted-foreground">Système</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <Badge variant="outline" className="font-mono text-xs">
            {log.ipAddress}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <time 
            dateTime={log.createdAt}
            title={new Date(log.createdAt).toLocaleString('fr-FR')}
            className="text-muted-foreground"
          >
            {getRelativeTime(log.createdAt)}
          </time>
        </div>
      </TableCell>
      <TableCell>
        {Object.keys(log.metadata).length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors list-none">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </summary>
            <div className="mt-2 p-3 bg-muted/50 rounded-md border">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </TableCell>
    </TableRow>
  )
} 