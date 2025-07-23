'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ActionResult } from '../types'

interface UseAuthToastOptions {
  redirectDelay?: number
  showFieldErrors?: boolean
}

/**
 * Hook personnalisé pour gérer les toasts et redirections des actions auth
 * @param state - État retourné par l'action
 * @param options - Options de configuration
 */
export function useAuthToast<T extends { message?: string; redirect?: string }>(
  state: ActionResult<T> | null,
  options: UseAuthToastOptions = {}
) {
  const router = useRouter()
  const { redirectDelay = 500, showFieldErrors = true } = options

  useEffect(() => {
    if (!state) return

    if (state.success && state.data?.message) {
      toast.success(state.data.message)
      
      if (state.data.redirect) {
        setTimeout(() => {
          router.push(state.data!.redirect!)
        }, redirectDelay)
      }
    } else if (state.error) {
      toast.error(state.error)
    } else if (state.errors && showFieldErrors) {
      // Afficher les erreurs de validation
      Object.entries(state.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`)
          })
        }
      })
    }
  }, [state, router, redirectDelay, showFieldErrors])
}

/**
 * Hook spécialisé pour les toasts d'inscription avec délai plus long
 */
export function useRegisterToast(state: ActionResult<{ message?: string; redirect?: string }> | null) {
  return useAuthToast(state, { redirectDelay: 2000 })
}

/**
 * Hook spécialisé pour les toasts de connexion
 */
export function useLoginToast(state: ActionResult<{ message?: string; redirect?: string }> | null) {
  return useAuthToast(state, { redirectDelay: 1000 })
}

/**
 * Hook spécialisé pour les toasts de forgot password
 */
export function useForgotPasswordToast(state: ActionResult<{ message?: string }> | null) {
  return useAuthToast(state, { redirectDelay: 0 })
}

/**
 * Hook spécialisé pour les toasts de reset password
 */
export function useResetPasswordToast(state: ActionResult<{ message?: string; redirect?: string }> | null) {
  return useAuthToast(state, { redirectDelay: 2000 })
}

/**
 * Utilitaire pour afficher un toast de message initial (ex: paramètre URL)
 */
export function useInitialMessageToast(message: string | undefined) {
  useEffect(() => {
    if (message) {
      toast.success(message)
    }
  }, [message])
} 