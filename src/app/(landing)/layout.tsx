import { LandingHeader, LandingFooter } from '@/features/navigation/components'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto w-full space-y-12 py-12">
          {children}
        </div>
      </main>
      
      <LandingFooter />
    </div>
  )
}   