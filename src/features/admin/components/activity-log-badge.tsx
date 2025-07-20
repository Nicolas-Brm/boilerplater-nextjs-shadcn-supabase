import { Badge } from '@/components/ui/badge'

interface ActivityBadgeProps {
  action: string
}

export function ActivityBadge({ action }: ActivityBadgeProps) {
  const actionColors = {
    CREATE: 'default',
    UPDATE: 'secondary',
    DELETE: 'destructive',
    VIEW: 'outline',
    LOGIN: 'default',
    LOGOUT: 'outline',
    EXPORT: 'secondary',
    ENABLE: 'default',
    DISABLE: 'destructive',
  } as const

  const actionType = action.split('_')[0]
  const color = actionColors[actionType as keyof typeof actionColors] || 'outline'

  return (
    <Badge variant={color as any} className="text-xs">
      {action.replace(/_/g, ' ')}
    </Badge>
  )
} 