'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createFirstSuperAdmin } from '../actions/onboarding'
import { Shield, User, Mail, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import type { AdminActionResult } from '../types'

const initialState: AdminActionResult<{ userId: string }> = {
  success: false,
  errors: {},
  error: undefined
}

// Wrapper pour adapter la signature de createFirstSuperAdmin à useFormState
async function createSuperAdminWrapper(
  prevState: AdminActionResult<{ userId: string }>,
  formData: FormData
): Promise<AdminActionResult<{ userId: string }>> {
  try {
    const result = await createFirstSuperAdmin(formData)
    return result as AdminActionResult<{ userId: string }>
  } catch (error) {
    // Si c'est une redirection, on laisse Next.js la gérer
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue'
    }
  }
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(createSuperAdminWrapper, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Configuration initiale</CardTitle>
            <CardDescription className="text-muted-foreground">
              Créez le premier compte superadmin pour démarrer votre SaaS
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state.success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Superadmin créé avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  <User className="h-4 w-4 inline mr-2" />
                  Prénom
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  aria-invalid={state.errors?.firstName ? 'true' : 'false'}
                />
                {state.errors?.firstName && (
                  <p className="text-sm text-destructive">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  <User className="h-4 w-4 inline mr-2" />
                  Nom
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  aria-invalid={state.errors?.lastName ? 'true' : 'false'}
                />
                {state.errors?.lastName && (
                  <p className="text-sm text-destructive">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@votresaas.com"
                required
                aria-invalid={state.errors?.email ? 'true' : 'false'}
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                <Lock className="h-4 w-4 inline mr-2" />
                Mot de passe
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                aria-invalid={state.errors?.password ? 'true' : 'false'}
              />
              {state.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Au moins 8 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                aria-invalid={state.errors?.confirmPassword ? 'true' : 'false'}
              />
              {state.errors?.confirmPassword && (
                <p className="text-sm text-destructive">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={state.success}
            >
              {state.success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Créé avec succès
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Créer le compte superadmin
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Note :</strong> Ce compte aura tous les privilèges administrateur.
                Assurez-vous d'utiliser un mot de passe fort et de garder ces informations sécurisées.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 