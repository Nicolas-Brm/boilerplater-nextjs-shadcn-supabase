import { requireNoAuth } from '@/lib/auth'
import { ModeToggle } from '@/features/theme/components/modetoggle'
import { Toaster } from '@/components/ui/sonner'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Si l'utilisateur est déjà connecté, le rediriger vers le dashboard
  await requireNoAuth()

  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Pattern/Visual moderne */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        {/* Toggle de thème en haut à gauche */}
        <div className="absolute top-6 left-6 z-10">
          <ModeToggle />
        </div>
        
        {/* Pattern géométrique moderne */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grille subtile */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="h-full w-full" style={{
              backgroundImage: `
                linear-gradient(to right, rgb(0,0,0) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(0,0,0) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }} />
          </div>
          
          {/* Formes géométriques modernes */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 rotate-12 blur-sm" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
          <div className="absolute top-1/2 left-1/2 w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 -rotate-45 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Contenu de la section gauche */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 max-w-lg mx-auto">
          <div className="space-y-8">
            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <div className="w-5 h-5 rounded-md bg-background" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-foreground tracking-tight">
                  Votre plateforme
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Connectez-vous pour accéder à votre espace de travail moderne et sécurisé.
                </p>
              </div>
            </div>
            
            {/* Features simples */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Authentification sécurisée</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Interface moderne et intuitive</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm text-muted-foreground">Performance optimisée</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {/* Toggle de thème pour mobile */}
        <div className="absolute top-6 right-6 lg:hidden">
          <ModeToggle />
        </div>
        
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  )
} 