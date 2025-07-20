'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Shield, 
  Globe, 
  Clock, 
  Lock, 
  Settings,
  AlertCircle,
  Key,
  Webhook,
  AlertTriangle,
  Trash2
} from 'lucide-react'
import { getUserPrimaryOrganization, getOrganizationSettings } from '../actions'
import { CreateOrganizationForm } from './create-organization-form'
import { DeleteOrganizationDialog } from './delete-organization-dialog'

export function OrganizationSettingsForm() {
  const [organization, setOrganization] = useState<any>(null)
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasOrganization, setHasOrganization] = useState(false)

  useEffect(() => {
    getUserPrimaryOrganization().then((org) => {
      if (org) {
        setOrganization(org)
        setHasOrganization(true)
        getOrganizationSettings(org.id).then(setSettings)
      }
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

  if (!hasOrganization) {
    return <CreateOrganizationForm />
  }

  return (
    <div className="space-y-6">
      {/* Informations sur l'organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {organization.name}
          </CardTitle>
          <CardDescription>
            Plan: {organization.planType} • Rôle: {organization.userRole}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Slug</Label>
              <p className="font-mono">{organization.slug}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Créée le</Label>
              <p>{new Date(organization.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres généraux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultLanguage" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Langue par défaut
              </Label>
              <Select name="defaultLanguage" defaultValue={settings?.defaultLanguage || 'fr'}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTimezone">Fuseau horaire par défaut</Label>
              <Select name="defaultTimezone" defaultValue={settings?.defaultTimezone || 'Europe/Paris'}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le fuseau horaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité de l'organisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Authentification à deux facteurs obligatoire
              </Label>
              <p className="text-sm text-muted-foreground">
                Forcer tous les membres à activer l'A2F
              </p>
            </div>
            <Switch 
              id="enforce2fa" 
              name="enforce2fa" 
              defaultChecked={settings?.enforce2fa || false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeoutHours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Délai d'expiration des sessions (heures)
              </Label>
              <Select name="sessionTimeoutHours" defaultValue={settings?.sessionTimeoutHours?.toString() || '24'}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le délai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 heure</SelectItem>
                  <SelectItem value="8">8 heures</SelectItem>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="168">1 semaine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Longueur minimale du mot de passe</Label>
              <Select name="passwordMinLength" defaultValue={settings?.passwordMinLength?.toString() || '8'}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir la longueur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 caractères</SelectItem>
                  <SelectItem value="12">12 caractères</SelectItem>
                  <SelectItem value="16">16 caractères</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intégrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Intégrations et API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Accès API activé
              </Label>
              <p className="text-sm text-muted-foreground">
                Permettre l'accès à l'API pour les intégrations externes
              </p>
            </div>
            <Switch 
              id="apiEnabled" 
              name="apiEnabled" 
              defaultChecked={settings?.apiEnabled || false}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhooks activés
              </Label>
              <p className="text-sm text-muted-foreground">
                Permettre l'envoi de webhooks pour les événements
              </p>
            </div>
            <Switch 
              id="webhookEnabled" 
              name="webhookEnabled" 
              defaultChecked={settings?.webhookEnabled || false}
            />
          </div>
        </CardContent>
      </Card>

      {organization?.userRole === 'owner' && (
        <div className="flex justify-end">
          <Button type="submit" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      )}

      {organization?.userRole !== 'owner' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seuls les propriétaires de l'organisation peuvent modifier ces paramètres.
          </AlertDescription>
        </Alert>
      )}

      {/* Zone de danger - Suppression */}
      {organization?.userRole === 'owner' && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zone de danger
            </CardTitle>
            <CardDescription>
              Actions irréversibles sur votre organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium text-destructive">Supprimer l'organisation</h4>
                <p className="text-sm text-muted-foreground">
                  Supprime définitivement l'organisation et toutes les données associées.
                  Cette action ne peut pas être annulée.
                </p>
              </div>
              <DeleteOrganizationDialog organization={organization}>
                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </DeleteOrganizationDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}