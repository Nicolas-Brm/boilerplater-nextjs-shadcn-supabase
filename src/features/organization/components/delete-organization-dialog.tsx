'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  Trash2, 
  Users,
  AlertCircle
} from 'lucide-react'
import { deleteOrganization, canDeleteOrganization } from '../actions/delete'
import { type Organization } from '../types'

interface DeleteOrganizationDialogProps {
  organization: Organization
  children: React.ReactNode
}

export function DeleteOrganizationDialog({ organization, children }: DeleteOrganizationDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canDelete, setCanDelete] = useState<{
    canDelete: boolean
    reason?: string
    memberCount?: number
  } | null>(null)

  // Vérifier si la suppression est possible quand le dialog s'ouvre
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    setError(null)
    setConfirmText('')
    
    if (newOpen) {
      const deleteCheck = await canDeleteOrganization(organization.id)
      setCanDelete(deleteCheck)
    }
  }

  const handleDelete = async () => {
    if (confirmText !== organization.name) {
      setError('Le nom de l\'organisation ne correspond pas')
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteOrganization(organization.id)
      
      if (result.success) {
        setOpen(false)
        router.push('/dashboard/organizations')
        router.refresh()
      } else {
        setError(result.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue')
    } finally {
      setIsDeleting(false)
    }
  }

  const isConfirmValid = confirmText === organization.name

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer l'organisation
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible et supprimera définitivement votre organisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vérification des conditions */}
          {canDelete && !canDelete.canDelete && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Suppression impossible :</strong> {canDelete.reason}
                {canDelete.memberCount && canDelete.memberCount > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{canDelete.memberCount} membre(s) actif(s)</span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Avertissements */}
          {canDelete?.canDelete && (
            <>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention :</strong> Cette action supprimera définitivement :
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>L'organisation <strong>{organization.name}</strong></li>
                    <li>Tous les paramètres et configurations</li>
                    <li>Toutes les invitations en attente</li>
                    <li>L'historique des membres</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Confirmation du nom */}
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Pour confirmer, tapez le nom de l'organisation : <strong>{organization.name}</strong>
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={organization.name}
                  className={error && !isConfirmValid ? 'border-destructive' : ''}
                />
              </div>
            </>
          )}

          {/* Message d'erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!canDelete?.canDelete || !isConfirmValid || isDeleting}
            className="flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 