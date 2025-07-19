'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '../actions/forgot-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
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
          Envoi...
        </>
      ) : (
        'Envoyer le lien'
      )}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, null)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground">
          Nous vous enverrons un lien pour réinitialiser votre mot de passe
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
        
        {/* Submit Button */}
        <SubmitButton />
      </form>
      
      {/* Footer */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
} 