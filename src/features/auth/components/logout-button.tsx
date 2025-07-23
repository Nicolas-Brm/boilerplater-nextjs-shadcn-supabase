'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logoutSimple } from '../actions/logout-simple'
import type { LogoutSuccessData } from '../types'
import { Loader2, LogOut } from 'lucide-react'
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
  const [isPending, setIsPending] = useState(false)

  const handleLogout = async () => {
    setIsPending(true)

    try {
      const result = await logoutSimple(null)

      if (result.success) {
        toast.success('Déconnexion réussie')
        if (result.data?.redirect) {
          // Délai court pour laisser apparaître le toast
          setTimeout(() => {
            router.push(result.data!.redirect)
          }, 500)
        }
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Une erreur inattendue est survenue lors de la déconnexion')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button 
      type="button"
      onClick={handleLogout}
      variant={variant} 
      size={size}
      className={className}
      disabled={isPending}
    >
      <LogoutButtonContent showIcon={showIcon} isPending={isPending}>
        {children}
      </LogoutButtonContent>
    </Button>
  )
} 