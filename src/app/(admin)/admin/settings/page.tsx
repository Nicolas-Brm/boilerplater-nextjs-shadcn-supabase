import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { requireAdmin } from '@/features/admin/lib/permissions'
import { Permission } from '@/features/admin/types'
import { 
  getSystemSettings, 
  toggleMaintenanceMode, 
  resetSettings, 
  exportSettings 
} from '@/features/admin/actions'
import { SystemSettingsForm, SettingsActions } from '@/features/admin/components'
import { 
  Settings, 
  AlertTriangle, 
  Shield, 
  Download,
  RefreshCw,
  Power,
  Server,
  Globe,
  Mail,
  HardDrive
} from 'lucide-react'

async function SystemSettingsContent() {
  const settingsResult = await getSystemSettings()

  if (!settingsResult.success || !settingsResult.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des paramètres: {settingsResult.error}
        </AlertDescription>
      </Alert>
    )
  }

  const settings = settingsResult.data

  return (
    <div className="space-y-6">
      {/* Statut du système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Statut du système
          </CardTitle>
          <CardDescription>
            État actuel du système et informations importantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Power className="h-4 w-4" />
                <span>Mode maintenance</span>
              </div>
              <Badge variant={settings.maintenanceMode ? "destructive" : "secondary"}>
                {settings.maintenanceMode ? "Activé" : "Désactivé"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Inscriptions</span>
              </div>
              <Badge variant={settings.allowRegistration ? "default" : "secondary"}>
                {settings.allowRegistration ? "Autorisées" : "Fermées"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Vérification email</span>
              </div>
              <Badge variant={settings.requireEmailVerification ? "default" : "secondary"}>
                {settings.requireEmailVerification ? "Requise" : "Optionnelle"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span>Taille max upload</span>
              </div>
              <Badge variant="outline">
                {settings.maxUploadSize} MB
              </Badge>
            </div>
            
            {settings.appVersion && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Version</span>
                </div>
                <Badge variant="outline">
                  v{settings.appVersion}
                </Badge>
              </div>
            )}
            
            {settings.debugMode !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Mode debug</span>
                </div>
                <Badge variant={settings.debugMode ? "destructive" : "secondary"}>
                  {settings.debugMode ? "Activé" : "Désactivé"}
                </Badge>
              </div>
            )}
          </div>
          
          {settings.maintenanceMode && settings.maintenanceMessage && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{settings.maintenanceMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Informations de l'entreprise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Informations de l'entreprise
          </CardTitle>
          <CardDescription>
            Informations générales sur votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.companyName && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                <p className="text-sm">{settings.companyName}</p>
              </div>
            )}
            
            {settings.supportEmail && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email de support</p>
                <p className="text-sm">{settings.supportEmail}</p>
              </div>
            )}
            
            {settings.privacyPolicyUrl && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Politique de confidentialité</p>
                <a 
                  href={settings.privacyPolicyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Voir la politique
                </a>
              </div>
            )}
            
            {settings.termsOfServiceUrl && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Conditions d'utilisation</p>
                <a 
                  href={settings.termsOfServiceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Voir les conditions
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Paramètres techniques
          </CardTitle>
          <CardDescription>
            Configuration technique et sécurité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.sessionTimeoutHours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Timeout session</span>
                </div>
                <Badge variant="outline">
                  {settings.sessionTimeoutHours}h
                </Badge>
              </div>
            )}
            
            {settings.passwordMinLength && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Mot de passe min</span>
                </div>
                <Badge variant="outline">
                  {settings.passwordMinLength} car.
                </Badge>
              </div>
            )}
            
            {settings.rateLimitPerMinute && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span className="text-sm">Limite req/min</span>
                </div>
                <Badge variant="outline">
                  {settings.rateLimitPerMinute}
                </Badge>
              </div>
            )}
            
            {settings.backupFrequencyHours && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm">Sauvegarde</span>
                </div>
                <Badge variant="outline">
                  {settings.backupFrequencyHours}h
                </Badge>
              </div>
            )}
            
            {settings.analyticsEnabled !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Analytics</span>
                </div>
                <Badge variant={settings.analyticsEnabled ? "default" : "secondary"}>
                  {settings.analyticsEnabled ? "Activé" : "Désactivé"}
                </Badge>
              </div>
            )}
            
            {settings.cookieConsentRequired !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Cookies RGPD</span>
                </div>
                <Badge variant={settings.cookieConsentRequired ? "default" : "secondary"}>
                  {settings.cookieConsentRequired ? "Requis" : "Optionnel"}
                </Badge>
              </div>
            )}
          </div>
          
          {settings.allowedFileTypes && settings.allowedFileTypes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Types de fichiers autorisés</p>
              <div className="flex flex-wrap gap-1">
                {settings.allowedFileTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    .{type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Connexions sociales</p>
            <div className="flex gap-2">
              {settings.socialLoginGoogle && (
                <Badge variant="default" className="text-xs">
                  Google
                </Badge>
              )}
              {settings.socialLoginGithub && (
                <Badge variant="default" className="text-xs">
                  GitHub
                </Badge>
              )}
              {!settings.socialLoginGoogle && !settings.socialLoginGithub && (
                <Badge variant="outline" className="text-xs">
                  Aucune connexion sociale configurée
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration du système
          </CardTitle>
          <CardDescription>
            Modifier les paramètres de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemSettingsForm settings={settings} />
        </CardContent>
      </Card>

      {/* Actions système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Actions système
          </CardTitle>
          <CardDescription>
            Actions avancées de gestion du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsActions settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}

export default async function AdminSettingsPage() {
  // Vérifier les permissions admin
  await requireAdmin([Permission.MANAGE_SETTINGS])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres système</h1>
        <p className="text-muted-foreground">
          Configurer les paramètres globaux de l'application
        </p>
      </div>

      <Suspense 
        fallback={
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                    <div className="h-20 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <SystemSettingsContent />
      </Suspense>
    </div>
  )
}