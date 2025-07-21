export const dynamic = 'force-dynamic'

import { getCurrentUser } from '@/lib/auth'
import { hasRole } from '@/features/admin/lib/permissions'
import { UserRole } from '@/features/admin/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Mail, 
  Database, 
  AlertTriangle, 
  CheckCircle2,
  Search,
  Plus
} from 'lucide-react'
import { debugInvitations, debugSpecificInvitation } from '@/features/organization/actions/debug-invitations'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { revalidatePath } from 'next/cache'
import { checkTokenIndex } from '@/features/organization/actions/debug-invitations'

async function DebugInvitationsSection() {
  try {
    const debugInfo = await debugInvitations()
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations Debug
          </CardTitle>
          <CardDescription>
            État de toutes les invitations dans le système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {debugInfo.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erreur: {debugInfo.error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  Total: {debugInfo.totalCount}
                </Badge>
                <Badge variant={debugInfo.invitations.filter(inv => !inv.isExpired).length > 0 ? "default" : "secondary"}>
                  Actives: {debugInfo.invitations.filter(inv => !inv.isExpired).length}
                </Badge>
                <Badge variant={debugInfo.invitations.filter(inv => inv.isExpired).length > 0 ? "destructive" : "secondary"}>
                  Expirées: {debugInfo.invitations.filter(inv => inv.isExpired).length}
                </Badge>
              </div>

              <Separator />

              {debugInfo.invitations.length === 0 ? (
                <p className="text-muted-foreground">Aucune invitation trouvée</p>
              ) : (
                <div className="space-y-2">
                  {debugInfo.invitations.slice(0, 10).map((invitation) => (
                    <div key={invitation.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{invitation.email}</span>
                            <Badge variant={invitation.isExpired ? "destructive" : "default"}>
                              {invitation.role}
                            </Badge>
                            {invitation.isExpired ? (
                              <Badge variant="destructive">Expirée</Badge>
                            ) : (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Organisation: {invitation.organization_name || "?"}</span>
                            <span>Par: {invitation.inviter_email || "?"}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!invitation.isExpired && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={invitation.inviteLink} target="_blank" rel="noopener noreferrer">
                                Tester
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded overflow-auto">
                        <div className="flex flex-wrap gap-y-1 gap-x-3">
                          <div><strong>Token:</strong> {invitation.token.substring(0, 10)}...</div>
                          <div><strong>Créée:</strong> {new Date(invitation.created_at).toLocaleString('fr-FR')}</div>
                          <div><strong>Expire:</strong> {new Date(invitation.expires_at).toLocaleString('fr-FR')}</div>
                        </div>
                        <div className="mt-1">
                          <strong>Lien:</strong> {invitation.fullInviteLink}
                        </div>
                      </div>
                    </div>
                  ))}
                  {debugInfo.invitations.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      ... et {debugInfo.invitations.length - 10} autres
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du debug des invitations: {(error as Error).message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
}

async function DatabaseConnectionSection() {
  try {
    const supabase = await createClient()
    
    // Test de connexion simple
    const { data, error } = await supabase
      .from('organizations')
      .select('count(*)', { count: 'exact', head: true })

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connexion Base de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erreur de connexion: {error.message}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Connexion réussie • {data || 0} organisations trouvées
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur de test de connexion: {(error as Error).message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
}

async function TestSpecificInvitationForm() {
  async function testInvitation(formData: FormData) {
    'use server'
    
    const token = formData.get('token') as string
    if (!token) return
    
    console.log('🔍 [Admin Debug] Test invitation token:', token)
    const result = await debugSpecificInvitation(token)
    console.log('🔍 [Admin Debug] Résultat:', result)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Test Invitation Spécifique
        </CardTitle>
        <CardDescription>
          Tester un token d'invitation spécifique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={testInvitation} className="space-y-4">
          <div>
            <label htmlFor="token" className="text-sm font-medium">
              Token d'invitation
            </label>
            <input
              id="token"
              name="token"
              type="text"
              placeholder="f6d3d23e-9905-46e2-9f1d-5c38635aa040"
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          </div>
          <Button type="submit">
            Tester Token
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-2">
          Vérifiez les logs du serveur pour voir les résultats détaillés
        </p>
      </CardContent>
    </Card>
  )
}

async function CreateTestInvitationForm() {
  async function createInvitation(formData: FormData) {
    'use server'
    
    try {
      const email = formData.get('email') as string
      const organizationId = formData.get('organizationId') as string
      const role = formData.get('role') as string
      const message = formData.get('message') as string
      
      if (!email || !organizationId) {
        return
      }
      
      const supabase = await createClient()
      const currentUser = await getCurrentUser()
      
      if (!currentUser) {
        return
      }
      
      // Créer l'invitation
      const invitationToken = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours
      
      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          email: email,
          role: role || 'member',
          message: message || undefined,
          token: invitationToken,
          expires_at: expiresAt.toISOString(),
          invited_by: currentUser.id
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ [CreateTestInvitation] Erreur:', error)
      } else {
        console.log('✅ [CreateTestInvitation] Invitation créée:', data)
      }
      
      revalidatePath('/admin/debug')
    } catch (error) {
      console.error('❌ [CreateTestInvitation] Erreur inattendue:', error)
    }
  }
  
  // Récupérer les organisations pour le select
  const supabase = await createClient()
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name')
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Créer une Invitation de Test
        </CardTitle>
        <CardDescription>
          Créer une invitation valide pour tester le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createInvitation} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="utilisateur@exemple.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organisation</Label>
            <select 
              id="organizationId" 
              name="organizationId"
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Sélectionnez une organisation</option>
              {organizations?.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <select 
              id="role" 
              name="role"
              className="w-full p-2 border rounded-md"
            >
              <option value="member">Membre</option>
              <option value="admin">Admin</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Input
              id="message"
              name="message"
              placeholder="Message personnel..."
            />
          </div>
          
          <Button type="submit" className="w-full">
            Créer l'invitation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

async function TokenIndexSection() {
  const indexStatus = await checkTokenIndex()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Index sur Invitations
        </CardTitle>
        <CardDescription>
          Vérification de l'index sur la colonne token
        </CardDescription>
      </CardHeader>
      <CardContent>
        {indexStatus.error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erreur: {indexStatus.error}
            </AlertDescription>
          </Alert>
        ) : indexStatus.exists ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              L'index <code>organization_invitations_token_idx</code> existe.
            </AlertDescription>
          </Alert>
        ) : indexStatus.created ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              L'index <code>organization_invitations_token_idx</code> a été créé avec succès.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              L'index <code>organization_invitations_token_idx</code> n'existe pas.
              Créez-le avec la commande SQL: <br />
              <code className="text-xs bg-muted p-1 rounded block mt-2">
                CREATE INDEX IF NOT EXISTS organization_invitations_token_idx ON public.organization_invitations(token);
              </code>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AdminDebugPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Accès non autorisé - Connexion requise
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Pour le debug, on permet l'accès même sans être admin
  const userRole = user.role as UserRole || UserRole.USER
  const isAdmin = hasRole(userRole, [UserRole.ADMIN, UserRole.SUPER_ADMIN])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debug Admin</h1>
          <p className="text-muted-foreground">
            Outils de diagnostic et debug pour les développeurs
          </p>
        </div>
        <Badge variant={isAdmin ? "default" : "secondary"}>
          {isAdmin ? "Admin" : "User"}
        </Badge>
      </div>

      {!isAdmin && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Mode développement - Certaines fonctions peuvent être limitées
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <DatabaseConnectionSection />
        <TokenIndexSection />
        <div className="grid gap-6 md:grid-cols-2">
          <DebugInvitationsSection />
          <TestSpecificInvitationForm />
        </div>
        <CreateTestInvitationForm />
      </div>
    </div>
  )
} 