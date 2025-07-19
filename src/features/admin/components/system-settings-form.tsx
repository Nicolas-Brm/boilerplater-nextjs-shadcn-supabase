'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { updateSystemSettings } from '../actions'
import { SystemSettings } from '../types'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'

interface SystemSettingsFormProps {
  settings: SystemSettings
}

export function SystemSettingsForm({ settings }: SystemSettingsFormProps) {
  const [state, formAction] = useActionState(updateSystemSettings, null)

  return (
    <form action={formAction} className="space-y-6">
      {/* Messages de feedback */}
      {state?.success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Paramètres mis à jour avec succès
          </AlertDescription>
        </Alert>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Paramètres généraux */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du site</Label>
            <Input
              id="siteName"
              name="siteName"
              defaultValue={settings.siteName}
              placeholder="Mon Application"
              className={state?.errors?.siteName ? 'border-destructive' : ''}
            />
            {state?.errors?.siteName && (
              <p className="text-sm text-destructive">
                {state.errors.siteName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Description du site</Label>
            <Textarea
              id="siteDescription"
              name="siteDescription"
              defaultValue={settings.siteDescription}
              placeholder="Description de votre application"
              rows={3}
              className={state?.errors?.siteDescription ? 'border-destructive' : ''}
            />
            {state?.errors?.siteDescription && (
              <p className="text-sm text-destructive">
                {state.errors.siteDescription[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Paramètres utilisateurs */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <h3 className="font-semibold">Gestion des utilisateurs</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowRegistration">Autoriser les inscriptions</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux nouveaux utilisateurs de créer un compte
              </p>
            </div>
            <Switch
              id="allowRegistration"
              name="allowRegistration"
              defaultChecked={settings.allowRegistration}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireEmailVerification">Vérification email obligatoire</Label>
              <p className="text-sm text-muted-foreground">
                Exiger la vérification de l'adresse email à l'inscription
              </p>
            </div>
            <Switch
              id="requireEmailVerification"
              name="requireEmailVerification"
              defaultChecked={settings.requireEmailVerification}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Paramètres fichiers */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Gestion des fichiers</h3>
          
          <div className="space-y-2">
            <Label htmlFor="maxUploadSize">Taille maximale d'upload (MB)</Label>
            <Input
              id="maxUploadSize"
              name="maxUploadSize"
              type="number"
              min="1"
              max="50"
              defaultValue={settings.maxUploadSize}
              className={state?.errors?.maxUploadSize ? 'border-destructive' : ''}
            />
            {state?.errors?.maxUploadSize && (
              <p className="text-sm text-destructive">
                {state.errors.maxUploadSize[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Limite entre 1 et 50 MB
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Mode maintenance */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Mode maintenance</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenanceMode">Activer le mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Empêcher l'accès au site pendant la maintenance
              </p>
            </div>
            <Switch
              id="maintenanceMode"
              name="maintenanceMode"
              defaultChecked={settings.maintenanceMode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenanceMessage">Message de maintenance</Label>
            <Textarea
              id="maintenanceMessage"
              name="maintenanceMessage"
              defaultValue={settings.maintenanceMessage || ''}
              placeholder="Le site est temporairement en maintenance..."
              rows={2}
              className={state?.errors?.maintenanceMessage ? 'border-destructive' : ''}
            />
            {state?.errors?.maintenanceMessage && (
              <p className="text-sm text-destructive">
                {state.errors.maintenanceMessage[0]}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Message affiché aux utilisateurs pendant la maintenance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </form>
  )
} 