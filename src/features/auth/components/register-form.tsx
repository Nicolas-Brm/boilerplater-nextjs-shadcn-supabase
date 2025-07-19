'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '../actions/register'
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
          Création...
        </>
      ) : (
        'Créer un compte'
      )}
    </Button>
  )
}

export function RegisterForm() {
  const [state, formAction] = useActionState(register, null)
  const router = useRouter()

  // Gérer la redirection après succès
  useEffect(() => {
    if (state?.success && state?.data?.redirect) {
      // Attendre un peu pour que l'utilisateur puisse voir le message de succès
      const timer = setTimeout(() => {
        router.push(state.data.redirect)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state, router])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez-nous et créez votre espace de travail
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Messages */}
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
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 caractères"
            required
            className="h-11"
          />
          {state?.errors?.password && (
            <p className="text-sm text-destructive">{state.errors.password[0]}</p>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Retapez votre mot de passe"
            required
            className="h-11"
          />
          {state?.errors?.confirmPassword && (
            <p className="text-sm text-destructive">{state.errors.confirmPassword[0]}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <SubmitButton />
      </form>
      
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Se connecter
        </Link>
      </div>
    </div>
  )
} 