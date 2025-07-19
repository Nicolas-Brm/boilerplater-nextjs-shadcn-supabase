import { Suspense } from 'react'
import { RegisterForm } from '@/features/auth/components'
import { Skeleton } from '@/components/ui/skeleton'

function RegisterSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<RegisterSkeleton />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Inscription',
  description: 'Créez votre compte',
} 