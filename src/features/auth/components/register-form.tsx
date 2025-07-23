'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '../actions/register'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      const result = await register(null, formData)

      if (result.success && result.data?.message) {
        toast.success(result.data.message)
        if (result.data.redirect) {
          // Délai plus long pour l'inscription pour laisser le temps de lire le message
          setTimeout(() => {
            router.push(result.data!.redirect!)
          }, 2000)
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
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez-nous et créez votre espace de travail
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
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 caractères"
            required
            className="h-11"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
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
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword[0]}</p>
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
              Création...
            </>
          ) : (
            'Créer un compte'
          )}
        </Button>
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