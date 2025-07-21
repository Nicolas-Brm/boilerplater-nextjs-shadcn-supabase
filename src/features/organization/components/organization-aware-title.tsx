'use client'

import { useOrganization } from './organization-context'

interface OrganizationAwareTitleProps {
  title: string
  showOrgName?: boolean
  className?: string
}

export function OrganizationAwareTitle({ 
  title, 
  showOrgName = true,
  className = "text-3xl font-bold tracking-tight"
}: OrganizationAwareTitleProps) {
  const { currentOrganization } = useOrganization()

  return (
    <h1 className={className}>
      {title}
      {showOrgName && currentOrganization && (
        <span className="text-muted-foreground text-base font-normal ml-2">
          · {currentOrganization.name}
        </span>
      )}
    </h1>
  )
} 