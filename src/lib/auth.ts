import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireAuthAPI(request?: Request): Promise<User | null> {
  try {
    console.log('🔍 [requireAuthAPI] Création du client Supabase pour API...')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cookieStore: any
    
    if (request) {
      // Utiliser les cookies de la requête si fournis
      console.log('🔍 [requireAuthAPI] Utilisation des cookies de la requête')
      const cookieHeader = request.headers.get('cookie') || ''
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              // Parser les cookies depuis l'en-tête
              return cookieHeader.split(';').map(cookie => {
                const [name, ...rest] = cookie.trim().split('=')
                return { name, value: rest.join('=') }
              }).filter(cookie => cookie.name && cookie.value)
            },
            setAll() {
              // Ne pas essayer de définir des cookies dans une API route
            },
          },
        }
      )
      
      console.log('🔍 [requireAuthAPI] Récupération de l\'utilisateur avec cookies de requête...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('❌ [requireAuthAPI] Erreur lors de la récupération:', error.message)
        return null
      }
      
      if (user) {
        console.log('✅ [requireAuthAPI] Utilisateur trouvé:', user.email)
      } else {
        console.log('❌ [requireAuthAPI] Aucun utilisateur dans la session')
      }
      
      return user
    } else {
      // Fallback vers l'approche originale
      cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch {
                // ignore les erreurs de cookies en API route
              }
            },
          },
        }
      )

      console.log('🔍 [requireAuthAPI] Récupération de l\'utilisateur...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('❌ [requireAuthAPI] Erreur lors de la récupération:', error.message)
        return null
      }
      
      if (user) {
        console.log('✅ [requireAuthAPI] Utilisateur trouvé:', user.email)
      } else {
        console.log('❌ [requireAuthAPI] Aucun utilisateur dans la session')
      }
      
      return user
    }
  } catch (error) {
    console.error('❌ [requireAuthAPI] Erreur:', error)
    return null
  }
}

export async function requireNoAuth(): Promise<void> {
  const user = await getCurrentUser()
  
  if (user) {
    // Utilisateur connecté, déterminer où le rediriger
    try {
      // Importer dynamiquement pour éviter les dépendances circulaires
      const { getCurrentAdminUser } = await import('@/features/admin/lib/permissions')
      const adminUser = await getCurrentAdminUser()
      
      if (adminUser) {
        redirect('/admin')
      }
    } catch (error) {
      // Ignorer les erreurs de redirection Next.js qui sont normales
      if (error && typeof error === 'object' && 'digest' in error && 
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (error as any).digest?.includes('NEXT_REDIRECT')) {
        throw error
      }
      // En cas d'autre erreur, continuer avec redirection normale
      console.log('Erreur lors de la vérification admin:', error)
    }
    
    // Rediriger vers le dashboard par défaut
    redirect('/dashboard')
  }
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
} 