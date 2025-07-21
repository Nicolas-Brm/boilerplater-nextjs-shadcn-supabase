import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react'
import { joinOrganization } from '@/features/organization/actions/create'
import { getInvitationDetails } from '@/features/organization/actions/get-invitation-details'
import { debugSpecificInvitation } from '@/features/organization/actions/debug-invitations'
import { getCurrentUser } from '@/lib/auth'

interface InvitePageProps {
  params: Promise<{
    token: string
  }>
  searchParams?: Promise<{
    error?: string
  }>
}

function InvitationError({ type, message, details }: { 
  type: 'expired' | 'not-found' | 'error',
  message: string,
  details?: string
}) {
  const Icon = type === 'expired' ? Clock : AlertTriangle
  const title = 
    type === 'expired' ? "Invitation expirée" : 
    type === 'not-found' ? "Invitation introuvable" : 
    "Erreur d'invitation";
  
  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-4">{message}</p>
          
          {details && process.env.NODE_ENV === 'development' && (
            <Alert className="mt-4 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{details}</AlertDescription>
            </Alert>
          )}

          <Button asChild className="mt-4">
            <a href="/dashboard/organizations">
              Retour aux organisations
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

async function InviteContent({ token, error }: { token: string, error?: string }) {
  console.log('🔍 [InviteContent] Tentative de récupération de l\'utilisateur...')
  const user = await getCurrentUser()
  console.log('🔍 [InviteContent] Utilisateur récupéré:', user ? 'Connecté' : 'Non connecté')
  
  if (!user) {
    console.log('🔍 [InviteContent] Redirection vers login avec token:', token)
    return redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  }

  // Afficher l'erreur si elle existe
  if (error) {
    return <InvitationError 
      type="error" 
      message={decodeURIComponent(error)}
      details="Une erreur est survenue lors du traitement de votre demande."
    />
  }

  try {
    // Récupérer les détails de l'invitation pour affichage
    console.log('🔍 [InviteContent] Récupération des détails de l\'invitation...')
    const invitationDetails = await getInvitationDetails(token)
    console.log('🔍 [InviteContent] Détails invitation:', invitationDetails ? 'Trouvés' : 'Non trouvés')

    // Si pas trouvée, faire un debug
    if (!invitationDetails) {
      console.log('🔍 [InviteContent] Lancement du debug pour comprendre le problème...')
      const debugInfo = await debugSpecificInvitation(token)
      console.log('🔍 [InviteContent] Résultat debug:', debugInfo)

      if (debugInfo.found) {
        if (debugInfo.invitation?.isExpired) {
          return <InvitationError 
            type="expired" 
            message="Cette invitation a expiré et n'est plus valide."
            details={`L'invitation a expiré le ${debugInfo.invitation?.expiresAtFormatted}`}
          />
        }
        
        // Vérifier si l'invitation a déjà été acceptée
        if (debugInfo.invitation?.status === 'accepted') {
          return <InvitationError 
            type="not-found" 
            message="Cette invitation a déjà été acceptée."
            details="Vous ne pouvez pas réutiliser un lien d'invitation déjà accepté."
          />
        }
        
        // Autres statuts non valides
        if (debugInfo.invitation?.status !== 'pending') {
          return <InvitationError 
            type="not-found" 
            message={`Cette invitation a été ${debugInfo.invitation?.status === 'cancelled' ? 'annulée' : 'refusée'}.`}
            details="Cette invitation n'est plus valide."
          />
        }
      }

      return <InvitationError 
        type="not-found" 
        message="Cette invitation n'existe pas."
        details="Aucune invitation trouvée avec ce token."
      />
    }

    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Invitation à rejoindre {invitationDetails.organization.name}</CardTitle>
            <CardDescription>
              {invitationDetails.invitedBy.firstName && invitationDetails.invitedBy.lastName
                ? `${invitationDetails.invitedBy.firstName} ${invitationDetails.invitedBy.lastName}`
                : invitationDetails.invitedBy.email
              } vous a invité à rejoindre cette organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitationDetails.organization.description && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {invitationDetails.organization.description}
              </div>
            )}

            {invitationDetails.message && (
              <div className="text-sm p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="font-medium text-primary mb-1">Message personnel :</p>
                <p>{invitationDetails.message}</p>
              </div>
            )}

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                En acceptant cette invitation, vous rejoindrez l'organisation en tant que <strong>{invitationDetails.role === 'owner' ? 'propriétaire' : invitationDetails.role}</strong> et pourrez collaborer avec les autres membres.
              </AlertDescription>
            </Alert>

            <div className="text-xs text-muted-foreground text-center">
              Invitation envoyée le {new Date(invitationDetails.createdAt).toLocaleDateString('fr-FR')} • 
              Expire le {new Date(invitationDetails.expiresAt).toLocaleDateString('fr-FR')}
            </div>

            <div className="space-y-2">
              <AcceptInvitationForm token={token} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('❌ [InviteContent] Erreur lors de la récupération de l\'invitation:', error)
    return <InvitationError 
      type="error" 
      message="Une erreur est survenue lors du traitement de cette invitation."
      details={error instanceof Error ? error.message : "Erreur inconnue"}
    />
  }
}

function AcceptInvitationForm({ token }: { token: string }) {
  return (
    <form action={handleAcceptInvitation} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Button type="submit" className="w-full">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Accepter l'invitation
      </Button>
      <Button type="button" variant="outline" className="w-full" asChild>
        <a href="/dashboard/organizations">
          Peut-être plus tard
        </a>
      </Button>
    </form>
  )
}

async function handleAcceptInvitation(formData: FormData) {
  'use server'
  
  const token = formData.get('token') as string
  console.log('🔍 [handleAcceptInvitation] Début avec token:', token)
  
  if (!token) {
    console.log('❌ [handleAcceptInvitation] Token manquant')
    redirect('/dashboard?error=token-missing')
  }
  
  try {
    const result = await joinOrganization(token)
    
    if (result.success) {
      console.log('✅ [handleAcceptInvitation] Succès, redirection vers organisations')
      // Rediriger vers la page organisations avec un message de succès
      const orgName = result.data && typeof result.data === 'object' && 'organization' in result.data && result.data.organization && typeof result.data.organization === 'object' && 'name' in result.data.organization ? String(result.data.organization.name) : 'organisation'
      redirect('/dashboard/organizations?success=joined&org=' + encodeURIComponent(orgName))
    } else {
      console.log('❌ [handleAcceptInvitation] Échec:', result.error)
      redirect(`/invite/${token}?error=${encodeURIComponent(result.error || 'Erreur inconnue')}`)
    }
  } catch (error) {
    // Ignorer les erreurs de redirection Next.js qui sont normales
    if (error && typeof error === 'object' && 'digest' in error && 
        (error as any).digest?.includes('NEXT_REDIRECT')) {
      throw error // Re-lancer l'erreur de redirection pour qu'elle fonctionne
    }
    
    console.error('❌ [handleAcceptInvitation] Erreur inattendue:', error)
    redirect(`/invite/${token}?error=${encodeURIComponent('Erreur inattendue lors de l\'adhésion')}`)
  }
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params
  const resolvedSearchParams = await searchParams
  const error = resolvedSearchParams?.error
  
  return (
    <Suspense fallback={
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
              <p className="text-muted-foreground">Chargement de l'invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <InviteContent token={token} error={error} />
    </Suspense>
  )
} 