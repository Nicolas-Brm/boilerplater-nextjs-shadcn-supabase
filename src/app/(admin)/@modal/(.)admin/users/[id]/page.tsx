import { AdminModal } from '@/features/admin/components/modal'
import { UserDetailsModal } from '@/features/admin/components/user-view-modal'
import { getUser } from '@/features/admin/actions/users'

interface UserViewModalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserViewModalPage({ params }: UserViewModalPageProps) {
  const { id } = await params
  const userResult = await getUser(id)

  if (!userResult.success || !userResult.data) {
    return (
      <AdminModal>
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold">Utilisateur non trouvé</h2>
          <p className="text-muted-foreground">L'utilisateur demandé n'existe pas.</p>
        </div>
      </AdminModal>
    )
  }

  return (
    <AdminModal>
      <UserDetailsModal user={userResult.data} />
    </AdminModal>
  )
} 