'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateOrganizationForm } from './create-organization-form'
import { createOrganization } from '../actions/create'
import { useOrganization } from './organization-context'

const initialState = {
  success: false,
  errors: {},
  error: '',
}

// Action wrapper qui gère le contexte
async function handleCreateOrganization(prevState: any, formData: FormData) {
  const result = await createOrganization(formData)
  return result
}

export function CreateOrganizationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(handleCreateOrganization, initialState)
  const { refreshOrganizations, switchOrganization } = useOrganization()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Ouvrir le modal si le paramètre create=true est présent
  useEffect(() => {
    const shouldCreate = searchParams.get('create') === 'true'
    setIsOpen(shouldCreate)
  }, [searchParams])

  // Fermer le modal et nettoyer l'URL
  const handleClose = () => {
    setIsOpen(false)
    // Supprimer le paramètre create de l'URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('create')
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/dashboard/organizations${newUrl}`)
  }

  // Fermer le modal et rediriger après succès
  useEffect(() => {
    if (state?.success && state?.data && typeof state.data === 'object' && 'organization' in state.data) {
      setIsOpen(false)
      
      // Rafraîchir la liste des organisations
      refreshOrganizations().then(() => {
        // Sélectionner la nouvelle organisation
        if (state.data && typeof state.data === 'object' && 'organization' in state.data) {
          switchOrganization(state.data.organization as any)
        }
      })
      
      // Supprimer le paramètre et recharger la page
      router.replace('/dashboard/organizations')
    }
  }, [state?.success, state?.data, router, refreshOrganizations, switchOrganization])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle organisation</DialogTitle>
          <DialogDescription>
            Créez votre organisation pour commencer à collaborer avec votre équipe
          </DialogDescription>
        </DialogHeader>
        <CreateOrganizationForm />
      </DialogContent>
    </Dialog>
  )
} 