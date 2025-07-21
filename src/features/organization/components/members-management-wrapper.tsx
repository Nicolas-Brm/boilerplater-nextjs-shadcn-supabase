import { MembersManagement } from './members-management'
import { getOrganizationIdFromSlug } from '../lib'

interface MembersManagementWrapperProps {
  organizationSlug: string
  userRole: string
}

export async function MembersManagementWrapper({ 
  organizationSlug, 
  userRole 
}: MembersManagementWrapperProps) {
  const organizationId = await getOrganizationIdFromSlug(organizationSlug)
  
  if (!organizationId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Organisation non trouvée ou accès non autorisé.
        </p>
      </div>
    )
  }

  return (
    <MembersManagement 
      organizationId={organizationId}
      userRole={userRole}
    />
  )
} 