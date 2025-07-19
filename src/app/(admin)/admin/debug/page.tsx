import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default async function DebugPage() {
  let debugInfo = {
    user: null as any,
    profile: null as any,
    envVars: {
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    error: null as string | null
  }

  try {
    // Récupérer l'utilisateur connecté
    const user = await requireAuth()
    debugInfo.user = {
      id: user.id,
      email: user.email,
      emailVerified: !!user.email_confirmed_at,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at
    }

    // Récupérer le profil utilisateur
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      debugInfo.error = `Erreur profil: ${profileError.message}`
    } else {
      debugInfo.profile = profile
    }

  } catch (error) {
    debugInfo.error = error instanceof Error ? error.message : 'Erreur inconnue'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Information</h1>
        <p className="text-muted-foreground">
          Informations de débogage pour diagnostiquer les problèmes
        </p>
      </div>

      {/* Variables d'environnement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Variables d'environnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>SUPABASE_SERVICE_ROLE_KEY</span>
            {debugInfo.envVars.hasServiceRole ? (
              <Badge variant="default" className="bg-green-500">Configurée</Badge>
            ) : (
              <Badge variant="destructive">Manquante</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SITE_URL</span>
            {debugInfo.envVars.hasSiteUrl ? (
              <Badge variant="default" className="bg-green-500">Configurée</Badge>
            ) : (
              <Badge variant="secondary">Optionnelle</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_URL</span>
            {debugInfo.envVars.hasSupabaseUrl ? (
              <Badge variant="default" className="bg-green-500">Configurée</Badge>
            ) : (
              <Badge variant="destructive">Manquante</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
            {debugInfo.envVars.hasAnonKey ? (
              <Badge variant="default" className="bg-green-500">Configurée</Badge>
            ) : (
              <Badge variant="destructive">Manquante</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erreur générale */}
      {debugInfo.error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{debugInfo.error}</AlertDescription>
        </Alert>
      )}

      {/* Informations utilisateur */}
      {debugInfo.user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Utilisateur connecté
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">ID:</span>
                <p className="text-sm text-muted-foreground font-mono">{debugInfo.user.id}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-sm text-muted-foreground">{debugInfo.user.email}</p>
              </div>
              <div>
                <span className="font-medium">Email vérifié:</span>
                <p className="text-sm text-muted-foreground">
                  {debugInfo.user.emailVerified ? 'Oui' : 'Non'}
                </p>
              </div>
              <div>
                <span className="font-medium">Créé le:</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(debugInfo.user.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profil utilisateur */}
      {debugInfo.profile ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Profil utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Prénom:</span>
                <p className="text-sm text-muted-foreground">{debugInfo.profile.first_name || 'Non défini'}</p>
              </div>
              <div>
                <span className="font-medium">Nom:</span>
                <p className="text-sm text-muted-foreground">{debugInfo.profile.last_name || 'Non défini'}</p>
              </div>
              <div>
                <span className="font-medium">Rôle:</span>
                <Badge variant={
                  debugInfo.profile.role === 'super_admin' ? 'default' :
                  debugInfo.profile.role === 'admin' ? 'secondary' :
                  debugInfo.profile.role === 'moderator' ? 'outline' : 
                  'destructive'
                }>
                  {debugInfo.profile.role}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Actif:</span>
                <p className="text-sm text-muted-foreground">
                  {debugInfo.profile.is_active ? 'Oui' : 'Non'}
                </p>
              </div>
            </div>

            {/* Recommandations */}
            {debugInfo.profile.role === 'user' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Votre compte a le rôle "user". Pour accéder à l'interface admin, vous devez être promu au rôle "admin" ou "super_admin".
                  <br />
                  Exécutez cette commande SQL dans Supabase : <code>SELECT promote_user_to_admin('{debugInfo.user?.email}');</code>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : debugInfo.user && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Aucun profil trouvé dans la table user_profiles. 
            Vous devez créer un profil ou exécuter les migrations de base de données.
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions pour résoudre les problèmes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">1. Configurer SUPABASE_SERVICE_ROLE_KEY</h4>
            <p className="text-sm text-muted-foreground">
              Ajoutez cette variable dans votre fichier .env.local avec la clé service_role de votre projet Supabase.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Promouvoir votre compte admin</h4>
            <p className="text-sm text-muted-foreground">
              Exécutez cette commande SQL dans l'éditeur SQL de Supabase :
            </p>
            <code className="block mt-1 p-2 bg-muted rounded text-sm">
              SELECT promote_user_to_admin('{debugInfo.user?.email}');
            </code>
          </div>

          <div>
            <h4 className="font-medium">3. Créer la table user_profiles</h4>
            <p className="text-sm text-muted-foreground">
              Si la table n'existe pas, exécutez les migrations SQL fournies dans le README.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 