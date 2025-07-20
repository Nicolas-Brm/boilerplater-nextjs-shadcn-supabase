import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportLogs } from '../actions/analytics'

export function ActivityLogsExportButton() {
  async function handleExport() {
    'use server'
    const result = await exportLogs()
    
    if (result.success && result.data) {
      // Dans un environnement réel, vous retourneriez l'URL ou déclencheriez le téléchargement
      console.log('Export URL:', result.data.downloadUrl)
    }
  }

  return (
    <form action={handleExport}>
      <Button type="submit" variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Exporter
      </Button>
    </form>
  )
} 