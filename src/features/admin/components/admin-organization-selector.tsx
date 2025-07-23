'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Building2, Users } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAdminOrganization } from './admin-organization-context'
import { Organization } from '@/features/organization/types'

interface AdminOrganizationSelectorProps {
  organizations: Organization[]
  className?: string
}

export function AdminOrganizationSelector({ 
  organizations, 
  className 
}: AdminOrganizationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  
  const {
    selectedOrganization,
    setSelectedOrganization,
    filterByOrganization,
    setFilterByOrganization,
    organizationMembers
  } = useAdminOrganization()

  // Filtrer les organisations selon la recherche
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    org.description?.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization)
    setOpen(false)
    
    // Activer automatiquement le filtre quand une organisation est sélectionnée
    if (!filterByOrganization) {
      setFilterByOrganization(true)
    }
  }

  const handleFilterToggle = (enabled: boolean) => {
    setFilterByOrganization(enabled)
    
    // Si on désactive le filtre, déselectionner l'organisation
    if (!enabled) {
      setSelectedOrganization(null)
    }
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Filtre par organisation
        </CardTitle>
        <CardDescription>
          Filtrer les utilisateurs par organisation spécifique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toggle du filtre */}
        <div className="flex items-center space-x-2">
          <Switch
            id="filter-toggle"
            checked={filterByOrganization}
            onCheckedChange={handleFilterToggle}
          />
          <Label htmlFor="filter-toggle" className="text-sm">
            Activer le filtre
          </Label>
        </div>

        {/* Sélecteur d'organisation */}
        {filterByOrganization && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Organisation</Label>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={!filterByOrganization}
                >
                  {selectedOrganization ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{selectedOrganization.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectedOrganization.planType}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Sélectionner une organisation...</span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher une organisation..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
                    
                    <CommandGroup>
                      {filteredOrganizations.map((organization) => (
                        <CommandItem
                          key={organization.id}
                          value={organization.name}
                          onSelect={() => handleOrganizationSelect(organization)}
                          className="flex items-center gap-2"
                        >
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">
                                {organization.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {organization.planType}
                              </Badge>
                            </div>
                            
                            {organization.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {organization.description}
                              </span>
                            )}
                          </div>
                          
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedOrganization?.id === organization.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Informations sur l'organisation sélectionnée */}
        {filterByOrganization && selectedOrganization && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Organisation sélectionnée</span>
              <Badge variant="outline" className="text-xs">
                {selectedOrganization.planType}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                <span>
                  {organizationMembers.length} membre{organizationMembers.length > 1 ? 's' : ''}
                </span>
              </div>
              
              {selectedOrganization.description && (
                <p className="mt-1 text-xs leading-relaxed">
                  {selectedOrganization.description}
                </p>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterToggle(false)}
              className="h-7 text-xs"
            >
              Effacer le filtre
            </Button>
          </div>
        )}

        {/* Message d'aide */}
        {!filterByOrganization && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
            Activez le filtre pour voir uniquement les utilisateurs d'une organisation spécifique.
          </div>
        )}
      </CardContent>
    </Card>
  )
}