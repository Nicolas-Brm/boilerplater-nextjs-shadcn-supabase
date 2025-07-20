import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react'

interface ActivityStatsCardsProps {
  stats?: {
    actionsToday?: number
    recentConnections?: number
    criticalActions?: number
    activeUsers?: number
  }
}

export function ActivityStatsCards({ stats }: ActivityStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actions aujourd'hui
            </CardTitle>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.actionsToday ?? '--'}
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            📊 Activité du jour en cours
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connexions récentes
            </CardTitle>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.recentConnections ?? '--'}
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            🔐 Authentifications réussies
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actions critiques
            </CardTitle>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.criticalActions ?? '--'}
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            ⚠️ Suppressions et modifications
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisateurs actifs
            </CardTitle>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.activeUsers ?? '--'}
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            👥 Sessions en cours
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 