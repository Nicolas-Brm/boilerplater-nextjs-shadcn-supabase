'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  User,
  MoreVertical,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Copy,
  X,
  Clock
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  getPendingInvitations,
  cancelInvitation
} from '../actions/members'
import { OrganizationRole, type OrganizationMember } from '../types'

// Wrappers pour useActionState
function handleInviteMember(organizationId: string) {
  return async (_prevState: any, formData: FormData) => {
    return await inviteMember(organizationId, formData)
  }
}

interface MembersManagementProps {
  organizationId: string
  userRole: string
}

export function MembersManagement({ organizationId, userRole }: MembersManagementProps) {
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  
  const [inviteState, inviteAction] = useActionState(
    handleInviteMember(organizationId), 
    null
  )

  // Charger les données
  useEffect(() => {
    loadData()
  }, [organizationId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [membersData, invitationsData] = await Promise.all([
        getOrganizationMembers(organizationId),
        getPendingInvitations(organizationId)
      ])
      setMembers(membersData)
      setInvitations(invitationsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fermer le dialog après succès
  useEffect(() => {
    if (inviteState?.success) {
      setShowInviteDialog(false)
      loadData() // Recharger les données
    }
  }, [inviteState?.success])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case OrganizationRole.OWNER:
        return <Crown className="h-4 w-4 text-yellow-500" />
      case OrganizationRole.ADMIN:
        return <Shield className="h-4 w-4 text-blue-500" />
      case OrganizationRole.MANAGER:
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case OrganizationRole.OWNER:
        return 'Propriétaire'
      case OrganizationRole.ADMIN:
        return 'Administrateur'
      case OrganizationRole.MANAGER:
        return 'Gestionnaire'
      default:
        return 'Membre'
    }
  }

  const canManageMembers = ['owner', 'admin'].includes(userRole)
  const canManageRoles = userRole === 'owner'

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const formData = new FormData()
    formData.append('role', newRole)
    
    const result = await updateMemberRole(organizationId, memberId, formData)
    if (result.success) {
      loadData()
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      const result = await removeMember(organizationId, memberId)
      if (result.success) {
        loadData()
      }
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const result = await cancelInvitation(organizationId, invitationId)
    if (result.success) {
      loadData()
    }
  }

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(inviteUrl)
    // TODO: Afficher un toast de confirmation
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'invitation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Membres</h2>
          <p className="text-muted-foreground">
            Gérez les membres de votre organisation
          </p>
        </div>
        
        {canManageMembers && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter un membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un nouveau membre</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation pour rejoindre votre organisation
                </DialogDescription>
              </DialogHeader>
              
              <form action={inviteAction} className="space-y-4">
                {inviteState?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{inviteState.error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="utilisateur@exemple.com"
                    required
                    className={inviteState?.errors?.email ? 'border-destructive' : ''}
                  />
                  {inviteState?.errors?.email && (
                    <p className="text-sm text-destructive">
                      {inviteState.errors.email[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select name="role" defaultValue={OrganizationRole.MEMBER}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={OrganizationRole.MEMBER}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Membre
                        </div>
                      </SelectItem>
                      <SelectItem value={OrganizationRole.MANAGER}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Gestionnaire
                        </div>
                      </SelectItem>
                      {userRole === 'owner' && (
                        <SelectItem value={OrganizationRole.ADMIN}>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrateur
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Rejoignez notre équipe..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer l'invitation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Liste des membres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membres actifs ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {members.map((member, index) => (
              <div key={member.id}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Rejoint le {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {(canManageRoles || canManageMembers) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canManageRoles && member.role !== OrganizationRole.OWNER && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(member.id, OrganizationRole.MEMBER)}
                              disabled={member.role === OrganizationRole.MEMBER}
                            >
                              Définir comme Membre
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(member.id, OrganizationRole.MANAGER)}
                              disabled={member.role === OrganizationRole.MANAGER}
                            >
                              Définir comme Gestionnaire
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleRoleChange(member.id, OrganizationRole.ADMIN)}
                              disabled={member.role === OrganizationRole.ADMIN}
                            >
                              Définir comme Administrateur
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {(canManageMembers && member.role !== OrganizationRole.OWNER) && (
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                {index < members.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invitations en attente */}
      {invitations.length > 0 && canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Invitations en attente ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {invitations.map((invitation, index) => (
                <div key={invitation.id}>
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <Mail className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invitation.email}</p>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getRoleIcon(invitation.role)}
                            {getRoleLabel(invitation.role)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Invité le {new Date(invitation.created_at).toLocaleDateString('fr-FR')} • 
                          Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < invitations.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 