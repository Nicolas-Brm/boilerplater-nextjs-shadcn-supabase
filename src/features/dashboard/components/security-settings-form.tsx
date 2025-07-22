'use client'

import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, Smartphone, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { getUserProfile } from '../actions'

// TODO: Implémenter updateSecuritySettings dans les actions
async function updateSecuritySettings(formData: FormData) {
  // Placeholder pour l'action de sécurité
  console.log('Security settings update:', Object.fromEntries(formData))
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulation
  return { success: true, data: { message: 'Paramètres de sécurité mis à jour' } }
}

async function handleUpdateSecuritySettings(_prevState: any, formData: FormData) {
  return await updateSecuritySettings(formData)
}

export function SecuritySettingsForm() {
  const [state, formAction] = useActionState(handleUpdateSecuritySettings, null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Messages de feedback */}
      {state?.success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Paramètres de sécurité mis à jour avec succès
          </AlertDescription>
        </Alert>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Mot de passe</h3>
        
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Mot de passe actuel
          </Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="Votre mot de passe actuel"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Nouveau mot de passe"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Authentification à deux facteurs</h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Activer l'authentification à deux facteurs
            </Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
          <Switch id="twoFactorEnabled" name="twoFactorEnabled" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder les paramètres de sécurité
        </Button>
      </div>
    </form>
  )
} 