'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Download, 
  Trash2, 
  AlertTriangle, 
  Shield, 
  FileJson, 
  FileSpreadsheet,
  FileText 
} from 'lucide-react'
import { exportUserData } from '../actions'

export function DataSettingsForm() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus(null)
    
    try {
      const result = await exportUserData()
      
      if (result.success && result.data) {
        // Créer un fichier de téléchargement
        const dataStr = JSON.stringify(result.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `donnees-utilisateur-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        setExportStatus('Données exportées avec succès')
      } else {
        setExportStatus(`Erreur : ${result.error}`)
      }
    } catch (error) {
      setExportStatus('Une erreur est survenue lors de l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export des données */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter mes données
          </CardTitle>
          <CardDescription>
            Téléchargez une copie de toutes vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inclure les données personnelles</Label>
                <p className="text-sm text-muted-foreground">
                  Profil, préférences et informations de compte
                </p>
              </div>
              <Switch id="includePersonalData" name="includePersonalData" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inclure les journaux d'activité</Label>
                <p className="text-sm text-muted-foreground">
                  Historique des actions et connexions (100 dernières entrées)
                </p>
              </div>
              <Switch id="includeActivityLogs" name="includeActivityLogs" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exportFormat" className="flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                Format d'export
              </Label>
              <Select name="exportFormat" defaultValue="json">
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Choisir le format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="xml">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      XML
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {exportStatus && (
            <Alert variant={exportStatus.includes('Erreur') ? 'destructive' : 'default'}>
              <AlertDescription>{exportStatus}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Export en cours...' : 'Exporter mes données'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Paramètres de rétention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Rétention des données
          </CardTitle>
          <CardDescription>
            Configurez la durée de conservation de vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataRetentionDays">Durée de conservation (jours)</Label>
            <Select name="dataRetentionDays" defaultValue="90">
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Choisir la durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours (recommandé)</SelectItem>
                <SelectItem value="180">180 jours</SelectItem>
                <SelectItem value="365">1 an</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Les données anciennes seront automatiquement supprimées après cette période
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Zone de danger */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Actions irréversibles concernant vos données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Ces actions sont irréversibles. Assurez-vous d'avoir exporté vos données importantes avant de continuer.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Supprimer toutes mes données</h4>
                <p className="text-sm text-muted-foreground">
                  Supprime définitivement toutes vos données personnelles et votre compte
                </p>
              </div>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  )
} 