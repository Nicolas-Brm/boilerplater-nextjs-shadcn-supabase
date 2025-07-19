'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Inscription en cours...
        </>
      ) : (
        'S\'inscrire'
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Inscription</CardTitle>
        <CardDescription>
          Créez votre compte pour commencer
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          
          {state?.success && state?.data?.message && (
            <Alert>
              <AlertDescription>{state.data.message}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
            />
            {state?.errors?.email && (
              <p className="text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
            {state?.errors?.password && (
              <p className="text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-red-500">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          
          <div className="text-center text-sm">
            Déjà un compte ?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Se connecter
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 