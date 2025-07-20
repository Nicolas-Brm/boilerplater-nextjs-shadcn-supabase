
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search, CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

export function ActivityLogsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentFilters = {
    action: searchParams.get('action') || 'all',
    resource: searchParams.get('resource') || 'all',
    userId: searchParams.get('userId') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  }

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: currentFilters.startDate ? new Date(currentFilters.startDate) : undefined,
    to: currentFilters.endDate ? new Date(currentFilters.endDate) : undefined,
  })

  const [userIdInput, setUserIdInput] = React.useState(currentFilters.userId)

  // Fonction pour mettre à jour les paramètres de recherche
  const updateSearchParams = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all' && value !== '') {
      newSearchParams.set(key, value)
    } else {
      newSearchParams.delete(key)
    }
    // Réinitialiser à la page 1 lors des changements de filtres
    newSearchParams.delete('page')
    
    router.push(`?${newSearchParams.toString()}`)
  }

  // Gérer les changements de dates
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    
    // Mettre à jour les paramètres de recherche en une seule fois
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    if (range?.from) {
      newSearchParams.set('startDate', format(range.from, 'yyyy-MM-dd'))
    } else {
      newSearchParams.delete('startDate')
    }
    
    if (range?.to) {
      newSearchParams.set('endDate', format(range.to, 'yyyy-MM-dd'))
    } else {
      newSearchParams.delete('endDate')
    }
    
    // Réinitialiser à la page 1 lors des changements de filtres
    newSearchParams.delete('page')
    
    router.push(`?${newSearchParams.toString()}`)
  }

  // Debounce pour l'input userId
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchParams('userId', userIdInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [userIdInput])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Filtres de recherche</CardTitle>
              <CardDescription className="text-sm">
                Affiner la recherche dans les logs d'activité
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type d'action</label>
              <Select 
                value={currentFilters.action} 
                onValueChange={(value) => updateSearchParams('action', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="UPDATE">Modification</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="VIEW">Consultation</SelectItem>
                  <SelectItem value="LOGIN">Connexion</SelectItem>
                  <SelectItem value="LOGOUT">Déconnexion</SelectItem>
                  <SelectItem value="EXPORT">Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ressource</label>
              <Select 
                value={currentFilters.resource} 
                onValueChange={(value) => updateSearchParams('resource', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Toutes les ressources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les ressources</SelectItem>
                  <SelectItem value="users">👥 Utilisateurs</SelectItem>
                  <SelectItem value="system">⚙️ Système</SelectItem>
                  <SelectItem value="content">📄 Contenu</SelectItem>
                  <SelectItem value="auth">🔒 Authentification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">ID Utilisateur</label>
              <Input
                placeholder="UUID utilisateur..."
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-foreground">Période</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd LLL y", { locale: fr })} -{" "}
                          {format(dateRange.to, "dd LLL y", { locale: fr })}
                        </>
                      ) : (
                        format(dateRange.from, "dd LLL y", { locale: fr })
                      )
                    ) : (
                      <span>Sélectionner une période</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 