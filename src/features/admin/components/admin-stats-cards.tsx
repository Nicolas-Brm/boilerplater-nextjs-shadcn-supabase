'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Building2,
  Activity
} from 'lucide-react'
import { AdminStats } from '../types'

interface AdminStatsCardsProps {
  stats: AdminStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const activeUserPercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0

  const activeOrgPercentage = stats.totalOrganizations > 0 
    ? Math.round((stats.activeOrganizations / stats.totalOrganizations) * 100)
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Total utilisateurs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {stats.activeUsers} actifs
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({activeUserPercentage}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Nouveaux utilisateurs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Inscriptions du mois en cours
          </p>
        </CardContent>
      </Card>

      {/* Organisations */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Organisations</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={stats.activeOrganizations > 0 ? "default" : "secondary"} 
              className="text-xs"
            >
              {stats.activeOrganizations} actives
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({activeOrgPercentage}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activité récente</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recentActivities}</div>
          <p className="text-xs text-muted-foreground">
            Actions effectuées dans les 7 derniers jours
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminStatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-16 animate-pulse mb-2" />
            <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}