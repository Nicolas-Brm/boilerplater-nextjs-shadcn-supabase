'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Link as LinkIcon,
  Globe
} from 'lucide-react'
import { createOrganization, checkSlugAvailability } from '../actions/create'

// Wrapper pour useActionState
async function handleCreateOrganization(_prevState: any, formData: FormData) {
  return await createOrganization(formData)
}

export function CreateOrganizationForm() {
  const [state, formAction] = useActionState(handleCreateOrganization, null)
  const [slug, setSlug] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [slugTimer, setSlugTimer] = useState<NodeJS.Timeout | null>(null)

  // Générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .replace(/^-|-$/g, '') // Supprimer les tirets au début et à la fin
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const generatedSlug = generateSlug(name)
    setSlug(generatedSlug)
    checkSlugDebounced(generatedSlug)
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = generateSlug(e.target.value)
    setSlug(newSlug)
    checkSlugDebounced(newSlug)
  }

  const checkSlugDebounced = (slugToCheck: string) => {
    if (slugTimer) {
      clearTimeout(slugTimer)
    }

    if (!slugToCheck || slugToCheck.length < 2) {
      setSlugStatus('idle')
      return
    }

    setSlugStatus('checking')

    const timer = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(slugToCheck)
        setSlugStatus(result.available ? 'available' : 'unavailable')
      } catch (error) {
        setSlugStatus('unavailable')
      }
    }, 500)

    setSlugTimer(timer)
  }

  const getSlugIcon = () => {
    switch (slugStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      case 'available':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <LinkIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getSlugMessage = () => {
    switch (slugStatus) {
      case 'checking':
        return 'Vérification de la disponibilité...'
      case 'available':
        return 'Ce nom est disponible'
      case 'unavailable':
        return 'Ce nom est déjà utilisé'
      default:
        return 'Le nom de votre organisation dans les URLs'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Créer une nouvelle organisation
        </CardTitle>
        <CardDescription>
          Créez votre organisation pour collaborer avec votre équipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Messages de feedback */}
          {state?.success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Organisation créée avec succès ! Vous pouvez maintenant inviter des membres.
              </AlertDescription>
            </Alert>
          )}

          {state?.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Nom de l'organisation */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'organisation *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Mon entreprise"
              onChange={handleNameChange}
              className={state?.errors?.name ? 'border-destructive' : ''}
              required
            />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">
                {state.errors.name[0]}
              </p>
            )}
          </div>

          {/* Slug de l'organisation */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Nom d'organisation (URL) *
            </Label>
            <div className="relative">
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={handleSlugChange}
                placeholder="mon-entreprise"
                className={`pr-10 ${state?.errors?.slug ? 'border-destructive' : ''}`}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getSlugIcon()}
              </div>
            </div>
            <p className={`text-sm ${
              slugStatus === 'unavailable' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {getSlugMessage()}
            </p>
            {slug && (
              <p className="text-sm text-muted-foreground">
                URL: <code className="bg-muted px-1 rounded">/{slug}</code>
              </p>
            )}
            {state?.errors?.slug && (
              <p className="text-sm text-destructive">
                {state.errors.slug[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez votre organisation..."
              rows={3}
              className={state?.errors?.description ? 'border-destructive' : ''}
            />
            {state?.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* Site web */}
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site web
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://monentreprise.com"
              className={state?.errors?.website ? 'border-destructive' : ''}
            />
            {state?.errors?.website && (
              <p className="text-sm text-destructive">
                {state.errors.website[0]}
              </p>
            )}
          </div>

          {/* Plan information */}
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              <strong>Plan gratuit :</strong> Jusqu'à 10 membres. Vous pourrez upgrader plus tard.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full"
            disabled={slugStatus === 'unavailable' || slugStatus === 'checking'}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Créer l'organisation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 