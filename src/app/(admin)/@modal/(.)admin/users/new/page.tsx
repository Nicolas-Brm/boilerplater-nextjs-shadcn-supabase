import { AdminModal } from '@/features/admin/components/modal'
import { UserCreateModal } from '@/features/admin/components/user-create-modal'

export default function CreateUserModalPage() {
  return (
    <AdminModal>
      <UserCreateModal />
    </AdminModal>
  )
} 