'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useOrganization } from './organization-context'

export function OrganizationSwitcher() {
  const [open, setOpen] = useState(false)
  const { currentOrganization, organizations, loading, switchOrganization } = useOrganization()
  const router = useRouter()
  const pathname = usePathname()

  const handleOrganizationSelect = (organizationSlug: string) => {
    const selectedOrg = organizations.find(org => org.organization.slug === organizationSlug)?.organization
    if (selectedOrg) {
      switchOrganization(selectedOrg)
      setOpen(false)
      
      // Si on est sur une page spécifique à l'organisation, on reste dessus
      // Sinon on redirige vers la page organisations
      if (!pathname.includes('/dashboard/organizations')) {
        router.push('/dashboard/organizations')
      }
    }
  }

  const handleCreateNew = () => {
    setOpen(false)
    router.push('/dashboard/organizations?create=true')
  }

  if (loading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Organisation</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-2">
            <div className="h-8 bg-muted animate-pulse rounded" />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (!currentOrganization) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Organisation</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-1">
            <p className="text-xs text-muted-foreground">
              Aucune organisation
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organisation</SidebarGroupLabel>
      <SidebarGroupContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary/10">
                    {currentOrganization.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-medium text-sm truncate">
                    {currentOrganization.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {currentOrganization.planType}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher une organisation..." />
              <CommandList>
                <CommandEmpty>Aucune organisation trouvée.</CommandEmpty>
                
                {organizations.length > 0 && (
                  <CommandGroup heading="Vos organisations">
                    {organizations.map(({ organization, membership }) => (
                      <CommandItem
                        key={organization.id}
                        value={organization.name}
                        onSelect={() => handleOrganizationSelect(organization.slug)}
                        className="flex items-center gap-2"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {organization.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium text-sm truncate">
                            {organization.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {membership.role === 'owner' ? 'Propriétaire' : membership.role}
                            </Badge>
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              {organization.planType}
                            </Badge>
                          </div>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            currentOrganization.id === organization.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                <CommandSeparator />
                
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreateNew}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">
                      Créer une organisation
                    </span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </SidebarGroupContent>
    </SidebarGroup>
  )
} 