'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { updateProfile, getUserProfile } from '../actions'
import { Save, AlertCircle, CheckCircle2, User, Mail, Globe, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
// Removed import for InputPhoneNumber due to module not found error

async function handleUpdateProfile(_prevState: any, formData: FormData) {
  return await updateProfile(formData)
}

export function ProfileSettingsForm() {
  const [state, formAction] = useActionState(handleUpdateProfile, null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Messages de feedback */}
      {state?.success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Profil mis à jour avec succès
          </AlertDescription>
        </Alert>
      )}

      {state?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Prénom
            </Label>
            <Input
              id="firstName"
              name="firstName"
              defaultValue={profile?.firstName || ''}
              placeholder="Votre prénom"
              className={state?.errors?.firstName ? 'border-destructive' : ''}
            />
            {state?.errors?.firstName && (
              <p className="text-sm text-destructive">
                {state.errors.firstName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nom
            </Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={profile?.lastName || ''}
              placeholder="Votre nom"
              className={state?.errors?.lastName ? 'border-destructive' : ''}
            />
            {state?.errors?.lastName && (
              <p className="text-sm text-destructive">
                {state.errors.lastName[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Adresse email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={profile?.email || ''}
            placeholder="votre@email.com"
            className={state?.errors?.email ? 'border-destructive' : ''}
          />
          {state?.errors?.email && (
            <p className="text-sm text-destructive">
              {state.errors.email[0]}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Vous recevrez un email de confirmation si vous changez votre adresse
          </p>
        </div>
      </div>

      <Separator />

      {/* Informations supplémentaires */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations supplémentaires</h3>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Parlez-nous de vous..."
            rows={3}
            maxLength={500}
            className={state?.errors?.bio ? 'border-destructive' : ''}
          />
          {state?.errors?.bio && (
            <p className="text-sm text-destructive">
              {state.errors.bio[0]}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Site web
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://votre-site.com"
              className={state?.errors?.website ? 'border-destructive' : ''}
            />
            {state?.errors?.website && (
              <p className="text-sm text-destructive">
                {state.errors.website[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Localisation
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="Paris, France"
              className={state?.errors?.location ? 'border-destructive' : ''}
            />
            {state?.errors?.location && (
              <p className="text-sm text-destructive">
                {state.errors.location[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
           
            Numéro de téléphone
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+33 1 23 45 67 89"
            className={state?.errors?.phoneNumber ? 'border-destructive' : ''}
          />
          {state?.errors?.phoneNumber && (
            <p className="text-sm text-destructive">
              {state.errors.phoneNumber[0]}
            </p>
          )}
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button type="submit" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Sauvegarder les modifications
        </Button>
      </div>
    </form>
  )
} 