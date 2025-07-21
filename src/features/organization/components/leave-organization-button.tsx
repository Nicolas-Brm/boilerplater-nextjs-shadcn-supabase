'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { LogOut } from 'lucide-react'
import { leaveOrganization } from '../actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface LeaveOrganizationButtonProps {
  organizationId: string
  organizationName: string
  userRole: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function LeaveOrganizationButton({
  organizationId,
  organizationName,
  userRole,
  variant = 'outline',
  size = 'default',
  className
}: LeaveOrganizationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLeaveOrganization = async () => {
    setIsLoading(true)
    
    try {
      const result = await leaveOrganization(organizationId)
      
      if (result.success) {
        const message = result.data && typeof result.data === 'object' && 'message' in result.data ? String(result.data.message) : 'Vous avez quitté l\'organisation'
        toast.success(message)
        setIsOpen(false)
        // Rediriger vers la page des organisations
        router.push('/dashboard/organizations')
      } else {
        toast.error(result.error || 'Erreur lors de la sortie de l\'organisation')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie:', error)
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Message d'avertissement différent pour les propriétaires
  const isOwner = userRole === 'owner'
  const warningMessage = isOwner
    ? `Attention : En tant que propriétaire, si vous êtes le seul propriétaire de "${organizationName}", vous ne pourrez pas quitter l'organisation. Vous devrez d'abord transférer la propriété à un autre membre.`
    : `Êtes-vous sûr de vouloir quitter "${organizationName}" ? Cette action supprimera définitivement votre membership et vous devrez être réinvité pour rejoindre à nouveau l'organisation.`

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Quitter l'organisation
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-destructive" />
            Quitter l'organisation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {warningMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeaveOrganization}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'En cours...' : 'Quitter l\'organisation'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}