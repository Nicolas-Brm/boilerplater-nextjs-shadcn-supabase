'use client'

import { useActionState } from 'react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Palette, Moon, Sun, Monitor, Globe, Calendar, Layout, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { ModeToggle } from '@/features/theme/components/modetoggle'
import { updateAppearanceSettings, getUserProfile } from '../actions'

async function handleUpdateAppearanceSettings(_prevState: any, formData: FormData) {
  return await updateAppearanceSettings(formData)
}

export function AppearanceSettingsForm() {
  const [state, formAction] = useActionState(handleUpdateAppearanceSettings, null)
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
            Préférences d'apparence mises à jour avec succès
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
        <h3 className="text-lg font-medium">Thème</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mode d'affichage</Label>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <p className="text-sm text-muted-foreground">
                Choisissez entre le mode clair, sombre, ou automatique selon votre système
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-4 w-4" />
                  <span className="font-medium">Clair</span>
                </div>
                <div className="h-16 bg-background border rounded" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-4 w-4" />
                  <span className="font-medium">Sombre</span>
                </div>
                <div className="h-16 bg-slate-900 border rounded" />
              </CardContent>
            </Card>

            <Card className="cursor-pointer border-2 hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4" />
                  <span className="font-medium">Système</span>
                </div>
                <div className="h-16 bg-gradient-to-r from-background to-slate-900 border rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Langue et région</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langue
            </Label>
            <Select name="language" defaultValue={preferences.language || "fr"}>
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
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select name="timezone" defaultValue={preferences.timezone || "Europe/Paris"}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir le fuseau horaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-8)</SelectItem>
                <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFormat" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Format de date
          </Label>
          <Select name="dateFormat" defaultValue={preferences.date_format || "DD/MM/YYYY"}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Choisir le format de date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Interface</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Mode compact
              </Label>
              <p className="text-sm text-muted-foreground">
                Réduire l'espacement pour afficher plus d'informations
              </p>
            </div>
            <Switch id="compactMode" name="compactMode" defaultChecked={preferences.compact_mode ?? false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Barre latérale réduite</Label>
              <p className="text-sm text-muted-foreground">
                Réduire la barre latérale par défaut
              </p>
            </div>
            <Switch id="sidebarCollapsed" name="sidebarCollapsed" defaultChecked={preferences.sidebar_collapsed ?? false} />
          </div>
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