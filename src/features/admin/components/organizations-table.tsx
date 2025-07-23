'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MoreHorizontal, 
  Eye, 
  Users, 
  Building2,
  Activity,
  Shield,
  ShieldOff
} from 'lucide-react'
import { OrganizationWithStats } from '../types'
import { toggleOrganizationStatus } from '../actions'
import { toast } from 'sonner'

interface OrganizationsTableProps {
  organizations: OrganizationWithStats[]
  onOrganizationUpdate?: () => void
}

export function OrganizationsTable({ organizations, onOrganizationUpdate }: OrganizationsTableProps) {
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null)

  const handleToggleStatus = async (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId)
    if (!org) return

    const action = org.subscriptionStatus === 'active' ? 'suspendre' : 'réactiver'
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action} cette organisation ?`)) {
      return
    }

    setTogglingStatusId(organizationId)
    
    try {
      const result = await toggleOrganizationStatus(organizationId)
      
      if (result.success) {
        toast.success(`Organisation ${action === 'suspendre' ? 'suspendue' : 'réactivée'} avec succès`)
        onOrganizationUpdate?.()
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setTogglingStatusId(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'suspended':
        return 'destructive'
      case 'inactive':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'suspended':
        return 'Suspendue'
      case 'inactive':
        return 'Inactive'
      default:
        return status
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default'
      case 'pro':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (organizations.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Aucune organisation trouvée</p>
        <p className="text-sm">Modifiez vos filtres de recherche.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Membres</TableHead>
            <TableHead>Activité</TableHead>
            <TableHead>Créée le</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">
                      /{org.slug}
                    </div>
                    {org.description && (
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">
                        {org.description}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getPlanBadgeVariant(org.planType)}>
                  {org.planType.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(org.subscriptionStatus)}>
                  {getStatusLabel(org.subscriptionStatus)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{org.memberCount}</span>
                  {org.activeMembers < org.memberCount && (
                    <span className="text-xs text-muted-foreground">
                      ({org.activeMembers} actifs)
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{org.recentActivity}</span>
                  <span className="text-xs text-muted-foreground">
                    derniers 30j
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDistanceToNow(new Date(org.createdAt), {
                    addSuffix: true,
                    locale: fr
                  })}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      disabled={togglingStatusId === org.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/organizations/${org.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/organizations/${org.id}/members`}>
                        <Users className="mr-2 h-4 w-4" />
                        Voir les membres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(org.id)}
                      disabled={togglingStatusId === org.id}
                      className={org.subscriptionStatus === 'active' ? 'text-destructive' : 'text-green-600'}
                    >
                      {org.subscriptionStatus === 'active' ? (
                        <>
                          <ShieldOff className="mr-2 h-4 w-4" />
                          {togglingStatusId === org.id ? 'Suspension...' : 'Suspendre'}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          {togglingStatusId === org.id ? 'Réactivation...' : 'Réactiver'}
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function OrganizationsTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organisation</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Membres</TableHead>
            <TableHead>Activité</TableHead>
            <TableHead>Créée le</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="h-5 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-5 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-12 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-16 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}