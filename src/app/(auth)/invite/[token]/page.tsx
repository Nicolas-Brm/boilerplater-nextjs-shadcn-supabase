import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Users, CheckCircle2 } from 'lucide-react'
import { joinOrganization } from '@/features/organization/actions/create'
import { getCurrentUser } from '@/lib/auth'

interface InvitePageProps {
  params: Promise<{
    token: string
  }>
}

async function InviteContent({ token }: { token: string }) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  }

  // TODO: Récupérer les détails de l'invitation pour affichage
  // const invitationDetails = await getInvitationDetails(token)

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Invitation à rejoindre une organisation</CardTitle>
          <CardDescription>
            Vous avez été invité à rejoindre une organisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              En acceptant cette invitation, vous rejoindrez l'organisation et pourrez collaborer avec les autres membres.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <AcceptInvitationForm token={token} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AcceptInvitationForm({ token }: { token: string }) {
  async function handleAcceptInvitation() {
    'use server'
    
    const result = await joinOrganization(token)
    
    if (result.success) {
      redirect('/dashboard/organizations?success=joined')
    } else {
      // TODO: Gérer l'erreur proprement
      redirect(`/invite/${token}?error=${encodeURIComponent(result.error || 'Erreur inconnue')}`)
    }
  }

  return (
    <form action={handleAcceptInvitation} className="space-y-4">
      <Button type="submit" className="w-full">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Accepter l'invitation
      </Button>
      <Button type="button" variant="outline" className="w-full" asChild>
        <a href="/dashboard">
          Peut-être plus tard
        </a>
      </Button>
    </form>
  )
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  
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
      <InviteContent token={token} />
    </Suspense>
  )
} 