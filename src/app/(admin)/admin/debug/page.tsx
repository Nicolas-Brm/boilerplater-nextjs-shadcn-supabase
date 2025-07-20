import { debugDatabase } from '@/features/admin/actions/debug'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function AdminDebugPage() {
  const result = await debugDatabase()

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debug Base de Données</h1>
          <p className="text-muted-foreground">
            Diagnostic des données utilisateurs et super admins
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            Erreur lors de la récupération des données : {result.error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const { data } = result

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debug Base de Données</h1>
          <p className="text-muted-foreground">
            Diagnostic des données utilisateurs et super admins
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription>
            Aucune donnée disponible
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debug Base de Données</h1>
        <p className="text-muted-foreground">
          Diagnostic des données utilisateurs et super admins
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.authUsers}</div>
            <p className="text-xs text-muted-foreground">
              Dans auth.users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.profiles}</div>
            <p className="text-xs text-muted-foreground">
              Dans user_profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.superAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Tous les super admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeSuperAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Actifs uniquement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Détails des utilisateurs auth */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs dans auth.users</CardTitle>
        </CardHeader>
        <CardContent>
          {data.authUsersDetails.length === 0 ? (
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          ) : (
            <div className="space-y-2">
              {data.authUsersDetails.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{user.email}</span>
                    <span className="text-sm text-muted-foreground ml-2">({user.id})</span>
                  </div>
                  <Badge variant={user.confirmed ? 'default' : 'secondary'}>
                    {user.confirmed ? 'Confirmé' : 'Non confirmé'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails des profils */}
      <Card>
        <CardHeader>
          <CardTitle>Profils dans user_profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {data.profilesDetails.length === 0 ? (
            <p className="text-muted-foreground">Aucun profil trouvé</p>
          ) : (
            <div className="space-y-2">
              {data.profilesDetails.map((profile: any) => (
                <div key={profile.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{profile.email || 'Pas d\'email'}</span>
                    <span className="text-sm text-muted-foreground ml-2">({profile.id})</span>
                    <div className="text-sm text-muted-foreground">
                      {profile.first_name} {profile.last_name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{profile.role}</Badge>
                    <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                      {profile.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Super admins spécifiquement */}
      <Card>
        <CardHeader>
          <CardTitle>Super Admins Détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          {data.superAdminsDetails.length === 0 ? (
            <Alert>
              <AlertDescription>
                ❌ Aucun super admin trouvé ! C'est pourquoi vous êtes redirigé vers l'onboarding.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {data.superAdminsDetails.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{admin.email || 'Pas d\'email'}</span>
                    <span className="text-sm text-muted-foreground ml-2">({admin.id})</span>
                    <div className="text-sm text-muted-foreground">
                      {admin.first_name} {admin.last_name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">SUPER_ADMIN</Badge>
                    <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                      {admin.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 