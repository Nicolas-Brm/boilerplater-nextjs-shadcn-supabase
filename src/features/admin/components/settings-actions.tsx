'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
// TODO: Fix these imports
// import { 
//   toggleMaintenanceMode, 
//   resetSettings, 
//   exportSettings 
// } from '../actions'

// Temporary placeholder functions
const toggleMaintenanceMode = async () => ({ success: false, error: 'Non implémenté', data: { message: 'Non implémenté' } })
const resetSettings = async () => ({ success: false, error: 'Non implémenté', data: { message: 'Non implémenté' } })
const exportSettings = async () => ({ success: false, error: 'Non implémenté', data: { downloadUrl: '', message: 'Non implémenté' } })
import { SystemSettings } from '../types'
import { 
  Power, 
  RefreshCw, 
  Download, 
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface SettingsActionsProps {
  settings: SystemSettings
}

export function SettingsActions({ settings }: SettingsActionsProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleToggleMaintenance = async () => {
    setIsToggling(true)
    try {
      const result = await toggleMaintenanceMode()
      
      if (result.success) {
        toast.success(result.data?.message || 'Mode maintenance modifié')
        window.location.reload() // Recharger pour voir le changement
      } else {
        toast.error(result.error || 'Erreur lors du changement de mode')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsToggling(false)
    }
  }

  const handleResetSettings = async () => {
    setIsResetting(true)
    try {
      const result = await resetSettings()
      
      if (result.success) {
        toast.success(result.data?.message || 'Paramètres réinitialisés')
        window.location.reload()
      } else {
        toast.error(result.error || 'Erreur lors de la réinitialisation')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsResetting(false)
    }
  }

  const handleExportSettings = async () => {
    setIsExporting(true)
    try {
      const result = await exportSettings()
      
      if (result.success && result.data?.downloadUrl) {
        // Créer un lien de téléchargement
        const link = document.createElement('a')
        link.href = result.data.downloadUrl
        link.download = `settings-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Paramètres exportés avec succès')
      } else {
        toast.error(result.error || 'Erreur lors de l\'export')
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode maintenance */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Power className="h-4 w-4" />
            <span className="font-medium">Mode maintenance</span>
            <Badge variant={settings.maintenanceMode ? "destructive" : "secondary"}>
              {settings.maintenanceMode ? "Activé" : "Désactivé"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {settings.maintenanceMode 
              ? "Le site est actuellement en maintenance" 
              : "Basculer en mode maintenance pour empêcher l'accès au site"
            }
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant={settings.maintenanceMode ? "default" : "destructive"}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Power className="h-4 w-4" />
              )}
              {settings.maintenanceMode ? "Désactiver" : "Activer"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {settings.maintenanceMode ? "Désactiver" : "Activer"} le mode maintenance
              </AlertDialogTitle>
              <AlertDialogDescription>
                {settings.maintenanceMode 
                  ? "Êtes-vous sûr de vouloir désactiver le mode maintenance ? Les utilisateurs pourront à nouveau accéder au site."
                  : "Êtes-vous sûr de vouloir activer le mode maintenance ? Cela empêchera tous les utilisateurs (sauf les admins) d'accéder au site."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleMaintenance}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Export des paramètres */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="font-medium">Exporter les paramètres</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Télécharger une sauvegarde des paramètres système au format JSON
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={handleExportSettings}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exporter
        </Button>
      </div>

      {/* Réinitialiser les paramètres */}
      <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">Réinitialiser les paramètres</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Restaurer tous les paramètres aux valeurs par défaut
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive"
              disabled={isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Réinitialiser
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Réinitialiser les paramètres
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Tous les paramètres seront restaurés aux valeurs par défaut.
                Assurez-vous d'avoir exporté vos paramètres actuels si vous souhaitez les conserver.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetSettings}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Informations importantes */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Attention :</strong> Les modifications des paramètres système peuvent affecter 
          le fonctionnement de l'application. Testez toujours les changements en environnement 
          de développement avant de les appliquer en production.
        </AlertDescription>
      </Alert>
    </div>
  )
} 