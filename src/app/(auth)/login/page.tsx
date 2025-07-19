import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components'
import { Skeleton } from '@/components/ui/skeleton'

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte',
} 