'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutSimple } from '../actions/logout-simple'
import { Loader2, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

function LogoutButtonContent({ 
  showIcon = true, 
  children,
  isPending = false
}: { 
  showIcon?: boolean
  children?: React.ReactNode
  isPending?: boolean
}) {
  if (children) {
    return <>{children}</>
  }
  
  return (
    <>
      {isPending ? (
        <Loader2 className={`h-4 w-4 animate-spin ${showIcon ? 'mr-2' : ''}`} />
      ) : (
        showIcon && <LogOut className="h-4 w-4 mr-2" />
      )}
      {isPending ? 'Déconnexion...' : 'Se déconnecter'}
    </>
  )
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default',
  className = '',
  showIcon = true,
  children 
}: LogoutButtonProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(logoutSimple, null)

  // Gérer les résultats de l'action
  useEffect(() => {
    if (state) {
      if (state.success) {
        // Redirection côté client
        if (state.data?.redirect) {
          router.push(state.data.redirect)
        }
        toast.success('Déconnexion réussie')
      } else if (state.error) {
        toast.error(state.error)
      }
    }
  }, [state, router])

  return (
    <form action={formAction}>
      <Button 
        type="submit" 
        variant={variant} 
        size={size}
        className={className}
        disabled={isPending}
      >
        <LogoutButtonContent showIcon={showIcon} isPending={isPending}>
          {children}
        </LogoutButtonContent>
      </Button>
    </form>
  )
} 