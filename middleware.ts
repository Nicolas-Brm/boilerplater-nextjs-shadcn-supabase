import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: any) {
  // Mettre à jour la session avec Supabase
  const response = await updateSession(request)

  // Protection spéciale pour les routes admin uniquement
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Vérifier la session
    const requestHeaders = new Headers(request.headers)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // Ne rien faire dans le middleware
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Rediriger vers la page de connexion
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // On pourrait ajouter ici une vérification supplémentaire du rôle admin
    // mais pour plus de sécurité, on conserve aussi cette vérification dans les composants
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 