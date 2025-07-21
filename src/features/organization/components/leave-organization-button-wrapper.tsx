import { LeaveOrganizationButton } from './leave-organization-button'
import { getOrganizationIdFromSlug } from '../lib'

interface LeaveOrganizationButtonWrapperProps {
  organizationSlug: string
  organizationName: string
  userRole: string
  variant?: "destructive" | "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export async function LeaveOrganizationButtonWrapper({ 
  organizationSlug,
  organizationName,
  userRole,
  variant = "outline",
  size = "default",
  className
}: LeaveOrganizationButtonWrapperProps) {
  const organizationId = await getOrganizationIdFromSlug(organizationSlug)
  
  if (!organizationId) {
    return null
  }

  return (
    <LeaveOrganizationButton
      organizationId={organizationId}
      organizationName={organizationName}
      userRole={userRole}
      variant={variant}
      size={size}
      className={className}
    />
  )
} 