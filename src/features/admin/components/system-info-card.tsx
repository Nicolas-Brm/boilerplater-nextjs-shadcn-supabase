import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getBasicSystemInfo } from '../actions'
import { Settings, Server, AlertTriangle } from 'lucide-react'

async function SystemInfoContent() {
  const result = await getBasicSystemInfo()

  if (!result.success || !result.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les informations système
        </AlertDescription>
      </Alert>
    )
  }

  const { siteName, appVersion, companyName } = result.data

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{siteName}</h3>
          <p className="text-sm text-muted-foreground">{companyName}</p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Server className="h-3 w-3" />
          v{appVersion}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Système opérationnel</span>
      </div>
    </div>
  )
}

export function SystemInfoCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Informations système
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Suspense 
          fallback={
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-5 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
              </div>
              <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
            </div>
          }
        >
          <SystemInfoContent />
        </Suspense>
      </CardContent>
    </Card>
  )
} 