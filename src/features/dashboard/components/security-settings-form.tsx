'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Shield, Lock, Smartphone } from 'lucide-react'

export function SecuritySettingsForm() {
  return (
    <div className="space-y-6">
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
          <Shield className="h-4 w-4" />
          Sauvegarder les paramètres de sécurité
        </Button>
      </div>
    </div>
  )
} 