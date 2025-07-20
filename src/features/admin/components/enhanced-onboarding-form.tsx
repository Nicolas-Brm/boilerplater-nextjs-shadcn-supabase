'use client'

import { useState, startTransition } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stepper } from '@/components/ui/stepper'
import { createFirstSuperAdmin } from '../actions/onboarding'
import { 
  Shield, 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Database,
  Settings
} from 'lucide-react'
import type { AdminActionResult } from '../types'

const initialState: AdminActionResult<{ userId: string }> = {
  success: false,
  errors: {},
  error: undefined
}

// Wrapper pour adapter la signature de createFirstSuperAdmin à useActionState
async function createSuperAdminWrapper(
  prevState: AdminActionResult<{ userId: string }>,
  formData: FormData
): Promise<AdminActionResult<{ userId: string }>> {
  try {
    const result = await createFirstSuperAdmin(formData)
    return result as AdminActionResult<{ userId: string }>
  } catch (error) {
    // Si c'est une redirection Next.js (NEXT_REDIRECT), on laisse Next.js la gérer
    if (error && typeof error === 'object' && 'digest' in error && 
        (error as any).digest?.includes('NEXT_REDIRECT')) {
      throw error
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    }
  }
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Bienvenue',
    description: 'Introduction'
  },
  {
    id: 'admin-info',
    title: 'Informations',
    description: 'Détails admin'
  },
  {
    id: 'security',
    title: 'Sécurité',
    description: 'Mot de passe'
  },
  {
    id: 'summary',
    title: 'Résumé',
    description: 'Validation'
  }
]

interface OnboardingFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export function EnhancedOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [state, formAction] = useActionState(createSuperAdminWrapper, initialState)

  const updateFormData = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return true // Welcome step
      case 2:
        return formData.firstName && formData.lastName && formData.email
      case 3:
        return formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
      case 4:
        return true // Summary step
      default:
        return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep < onboardingSteps.length) {
      nextStep()
      return
    }

    // Submit final form using startTransition
    const submitFormData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value)
    })
    
    startTransition(() => {
      formAction(submitFormData)
    })
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6 animate-in fade-in-0 duration-500">
            <div className="flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Bienvenue dans votre SaaS !
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Commençons par configurer votre premier compte administrateur.
                Cela ne prendra que quelques minutes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2 hover:scale-105 transition-transform">
                <Shield className="h-8 w-8 text-blue-500 mx-auto" />
                <p className="text-sm font-medium">Sécurisé</p>
                <p className="text-xs text-muted-foreground">Chiffrement de bout en bout</p>
              </div>
              <div className="space-y-2 hover:scale-105 transition-transform">
                <Database className="h-8 w-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium">Moderne</p>
                <p className="text-xs text-muted-foreground">Technologies récentes</p>
              </div>
              <div className="space-y-2 hover:scale-105 transition-transform">
                <Settings className="h-8 w-8 text-purple-500 mx-auto" />
                <p className="text-sm font-medium">Configurable</p>
                <p className="text-xs text-muted-foreground">Personnalisable</p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-3 duration-300">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Informations personnelles</h2>
              <p className="text-muted-foreground">
                Ces informations serviront à identifier votre compte administrateur
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="John"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Adresse email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="admin@votresaas.com"
                required
                className="transition-all focus:scale-[1.02]"
              />
              <p className="text-xs text-muted-foreground">
                Cette adresse servira pour vous connecter à l'administration
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-3 duration-300">
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Sécurité du compte</h2>
              <p className="text-muted-foreground">
                Choisissez un mot de passe fort pour protéger votre compte
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full transition-colors ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Au moins 8 caractères</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="transition-all focus:scale-[1.02]"
                />
                {formData.confirmPassword && (
                  <div className="flex items-center space-x-2 text-xs animate-in fade-in-0 duration-200">
                    <div className={`w-2 h-2 rounded-full transition-colors ${formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>
                      {formData.password === formData.confirmPassword ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Conseils de sécurité :
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Utilisez une combinaison de lettres, chiffres et symboles</li>
                <li>• Évitez les informations personnelles</li>
                <li>• Gardez ce mot de passe confidentiel</li>
              </ul>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-3 duration-300">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Récapitulatif</h2>
              <p className="text-muted-foreground">
                Vérifiez vos informations avant de créer votre compte administrateur
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Nom complet :</span>
                <span>{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email :</span>
                <span>{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rôle :</span>
                <span className="font-semibold text-primary">Super Administrateur</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                🎉 Prêt à commencer !
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Votre compte administrateur va être créé avec tous les privilèges nécessaires 
                pour gérer votre plateforme.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-6 pb-8">
          {/* Progress Stepper */}
          <Stepper steps={onboardingSteps} currentStep={currentStep} />
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Configuration initiale
            </CardTitle>
            <CardDescription className="text-lg">
              Étape {currentStep} sur {onboardingSteps.length}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {state.error && (
            <Alert variant="destructive" className="animate-in fade-in-0 duration-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert className="animate-in fade-in-0 duration-300">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Superadmin créé avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="min-h-[400px]">
              {getStepContent()}
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center transition-all hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>

              <Button
                type="submit"
                disabled={!canProceedToNext() || state.success}
                className="flex items-center transition-all hover:scale-105"
              >
                {currentStep === onboardingSteps.length ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    {state.success ? 'Créé avec succès' : 'Créer le compte'}
                  </>
                ) : (
                  <>
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              🔒 Toutes vos données sont chiffrées et sécurisées
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 