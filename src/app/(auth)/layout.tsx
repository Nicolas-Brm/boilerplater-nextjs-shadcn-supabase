import { requireNoAuth } from '@/lib/auth'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Si l'utilisateur est déjà connecté, le rediriger vers le dashboard
  await requireNoAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Section gauche avec branding/info */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-8">
          <div className="mx-auto max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Accédez à votre espace personnel et gérez vos données en toute sécurité.
            </p>
            <div className="space-y-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 bg-green-500 rounded-full"></div>
                Authentification sécurisée
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 bg-green-500 rounded-full"></div>
                Protection des données
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-2 w-2 bg-green-500 rounded-full"></div>
                Interface moderne et intuitive
              </div>
            </div>
          </div>
        </div>

        {/* Section droite avec le formulaire */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 