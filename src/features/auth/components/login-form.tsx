'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '../actions/login'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams?.get('message')

  // Afficher le message initial si présent
  useEffect(() => {
    if (message) {
      toast.success(message)
    }
  }, [message])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      const result = await login(null, formData)

      if (result.success && result.data?.message) {
        toast.success(result.data.message)
        if (result.data.redirect) {
          setTimeout(() => {
            router.push(result.data!.redirect!)
          }, 1000)
        }
      } else if (result.error) {
        toast.error(result.error)
      } else if (result.errors) {
        setErrors(result.errors)
        // Afficher aussi les erreurs en toast
        Object.entries(result.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(message => {
              toast.error(`${field}: ${message}`)
            })
          }
        })
      }
    } catch (error) {
      toast.error('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

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
      <form onSubmit={handleSubmit} className="space-y-6">
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
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email[0]}</p>
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
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          size="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
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