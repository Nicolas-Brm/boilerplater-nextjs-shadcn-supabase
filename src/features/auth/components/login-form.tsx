'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '../actions'
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
          Connexion en cours...
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte pour continuer
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {initialMessage && (
            <Alert>
              <AlertDescription>{initialMessage}</AlertDescription>
            </Alert>
          )}
          
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
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          
          <div className="flex flex-col items-center space-y-2 text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
            <div>
              Pas de compte ?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:underline"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  
  return <LoginFormContent initialMessage={message || undefined} />
} 