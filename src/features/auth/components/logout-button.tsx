'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { logoutSimple } from '../actions'
import { Loader2, LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

function LogoutButtonContent({ 
  showIcon = true, 
  children 
}: { 
  showIcon?: boolean
  children?: React.ReactNode 
}) {
  const { pending } = useFormStatus()
  
  if (children) {
    return <>{children}</>
  }
  
  return (
    <>
      {pending ? (
        <Loader2 className={`h-4 w-4 animate-spin ${showIcon ? 'mr-2' : ''}`} />
      ) : (
        showIcon && <LogOut className="h-4 w-4 mr-2" />
      )}
      {pending ? 'Déconnexion...' : 'Se déconnecter'}
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
  return (
    <form action={logoutSimple}>
      <Button 
        type="submit" 
        variant={variant} 
        size={size}
        className={className}
      >
        <LogoutButtonContent showIcon={showIcon}>
          {children}
        </LogoutButtonContent>
      </Button>
    </form>
  )
} 