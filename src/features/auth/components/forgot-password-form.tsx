'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '../actions/forgot-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      const result = await forgotPassword(null, formData)

      if (result.success && result.data?.message) {
        toast.success(result.data.message)
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
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="text-sm text-muted-foreground">
          Nous vous enverrons un lien pour réinitialiser votre mot de passe
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
              Envoi...
            </>
          ) : (
            'Envoyer le lien'
          )}
        </Button>
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