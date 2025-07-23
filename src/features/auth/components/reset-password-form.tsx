'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { resetPassword } from '../actions/reset-password'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

    try {
      const result = await resetPassword(null, formData)

      if (result.success && result.data?.message) {
        toast.success(result.data.message)
        if (result.data.redirect) {
          // Délai pour laisser le temps au toast d'apparaître et à l'utilisateur de le lire
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
        <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
        <p className="text-sm text-muted-foreground">
          Saisissez votre nouveau mot de passe sécurisé
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 caractères"
              required
              className="h-11 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              </span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password[0]}</p>
          )}
        </div>
        
        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmez votre mot de passe"
              required
              className="h-11 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <span className="sr-only">
                {showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              </span>
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword[0]}</p>
          )}
        </div>
        
        {/* Security Tips */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Conseils pour un mot de passe sécurisé :</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Au moins 6 caractères (8 recommandés)</li>
            <li>• Mélange de lettres majuscules et minuscules</li>
            <li>• Incluez des chiffres et des caractères spéciaux</li>
            <li>• Évitez les informations personnelles</li>
          </ul>
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
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser le mot de passe'
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