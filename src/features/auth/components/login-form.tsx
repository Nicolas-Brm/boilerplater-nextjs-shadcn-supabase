'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={pending}
      size="default"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion...
        </>
      ) : (
        'Se connecter'
      )}
    </Button>
  )
}

function LoginFormContent({ initialMessage }: { initialMessage?: string }) {
  const [state, formAction] = useActionState(login, null)
  const router = useRouter()

  // Gérer la redirection après succès
  useEffect(() => {
    if (state?.success && state?.data?.redirect) {
      router.push(state.data.redirect)
    }
  }, [state, router])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-sm text-muted-foreground">
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Messages */}
        {initialMessage && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{initialMessage}</AlertDescription>
          </Alert>
        )}
        
        {state?.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        
        {state?.success && state?.data?.message && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{state.data.message}</AlertDescription>
          </Alert>
        )}
        
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nom@exemple.com"
            required
            className="h-11"
          />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
        
        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="h-11"
          />
          {state?.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <SubmitButton />
      </form>
      
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Pas de compte ?{' '}
        <Link
          href="/register"
          className="font-medium text-foreground hover:underline"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  
  return <LoginFormContent initialMessage={message || undefined} />
} 