import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/features/auth/components'
import { Skeleton } from '@/components/ui/skeleton'

function ForgotPasswordSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<ForgotPasswordSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe',
} 