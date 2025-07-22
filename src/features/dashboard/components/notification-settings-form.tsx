'use client'

import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { updateNotificationSettings, getUserProfile } from '../actions'

async function handleUpdateNotificationSettings(_prevState: any, formData: FormData) {
  return await updateNotificationSettings(formData)
}

export function NotificationSettingsForm() {
  const [state, formAction] = useActionState(handleUpdateNotificationSettings, null)
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

  const preferences = profile?.preferences || {}

  return (
    <form action={formAction} className="space-y-6">
      {/* Messages de feedback */}
      {state?.success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Préférences de notification mises à jour avec succès
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
        <h3 className="text-lg font-medium">Notifications par email</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Notifications générales
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications pour les activités importantes
              </p>
            </div>
            <Switch id="emailNotifications" name="emailNotifications" defaultChecked={preferences.email_notifications ?? true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertes de sécurité
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications importantes concernant la sécurité de votre compte
              </p>
            </div>
            <Switch id="securityAlerts" name="securityAlerts" defaultChecked={preferences.security_alerts ?? true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emails marketing</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des nouvelles sur les produits et fonctionnalités
              </p>
            </div>
            <Switch id="marketingEmails" name="marketingEmails" defaultChecked={preferences.marketing_emails ?? false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Résumé hebdomadaire</Label>
              <p className="text-sm text-muted-foreground">
                Un résumé de votre activité chaque semaine
              </p>
            </div>
            <Switch id="weeklyDigest" name="weeklyDigest" defaultChecked={preferences.weekly_digest ?? true} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notifications push</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications push
              </Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications sur votre appareil
              </p>
            </div>
            <Switch id="pushNotifications" name="pushNotifications" defaultChecked={preferences.push_notifications ?? true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages instantanés
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifications pour les nouveaux messages
              </p>
            </div>
            <Switch id="instantMessages" name="instantMessages" defaultChecked={preferences.instant_messages ?? true} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Fréquence des notifications</h3>
        
        <div className="space-y-2">
          <Label htmlFor="notificationFrequency">Fréquence de groupement</Label>
          <Select name="notificationFrequency" defaultValue={preferences.notification_frequency || "instant"}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir la fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instant">Instantané</SelectItem>
              <SelectItem value="hourly">Chaque heure</SelectItem>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Choisissez à quelle fréquence vous souhaitez recevoir les notifications groupées
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder les préférences
        </Button>
      </div>
    </form>
  )
} 