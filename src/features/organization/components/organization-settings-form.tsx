'use client'

import { useActionState } from 'react'
import { useState } from 'react'
import { Building2, Globe, Mail, MapPin, Phone, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { updateOrganizationSettings } from '../actions/settings'
import { type Organization } from '../types'

interface OrganizationSettingsFormProps {
  organization: Organization
  canEdit: boolean
}

const initialState = {
  success: false,
  errors: {},
  error: undefined,
  data: undefined
}

export function OrganizationSettingsForm({ organization, canEdit }: OrganizationSettingsFormProps) {
  const [state, formAction] = useActionState(updateOrganizationSettings, initialState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    formAction(formData)
    setIsSubmitting(false)
  }

  // Extraire le message de success depuis data
  const successMessage = state.success && state.data ? (state.data as any).message : null
  const errorMessage = state.error

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations générales
          </CardTitle>
          <CardDescription>
            Configurez les informations de base de votre organisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <input type="hidden" name="organizationId" value={organization.id} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom de l'organisation *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Mon Entreprise"
                  defaultValue={organization.name}
                  disabled={!canEdit}
                  aria-invalid={state.errors?.name ? 'true' : 'false'}
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug de l'organisation *
                </Label>
                <div className="relative">
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="mon-entreprise"
                    defaultValue={organization.slug}
                    disabled={!canEdit}
                    aria-invalid={state.errors?.slug ? 'true' : 'false'}
                    className="font-mono"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Badge variant="secondary" className="text-xs">
                      URL
                    </Badge>
                  </div>
                </div>
                {state.errors?.slug && (
                  <p className="text-sm text-destructive">
                    {state.errors.slug[0]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Le slug apparaît dans l'URL : /dashboard?org=<span className="font-mono">{organization.slug}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Décrivez votre organisation..."
                defaultValue={organization.description || ''}
                disabled={!canEdit}
                rows={3}
                aria-invalid={state.errors?.description ? 'true' : 'false'}
              />
              {state.errors?.description && (
                <p className="text-sm text-destructive">
                  {state.errors.description[0]}
                </p>
              )}
            </div>

            <Separator />

            {/* Informations de contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Site web
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://www.monentreprise.com"
                    defaultValue={organization.website || ''}
                    disabled={!canEdit}
                    aria-invalid={state.errors?.website ? 'true' : 'false'}
                  />
                  {state.errors?.website && (
                    <p className="text-sm text-destructive">
                      {state.errors.website[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email de contact
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@monentreprise.com"
                    defaultValue=""
                    disabled={!canEdit}
                    aria-invalid={state.errors?.email ? 'true' : 'false'}
                  />
                  {state.errors?.email && (
                    <p className="text-sm text-destructive">
                      {state.errors.email[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    defaultValue=""
                    disabled={!canEdit}
                    aria-invalid={state.errors?.phone ? 'true' : 'false'}
                  />
                  {state.errors?.phone && (
                    <p className="text-sm text-destructive">
                      {state.errors.phone[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 rue de la Paix, 75001 Paris"
                    defaultValue=""
                    disabled={!canEdit}
                    aria-invalid={state.errors?.address ? 'true' : 'false'}
                  />
                  {state.errors?.address && (
                    <p className="text-sm text-destructive">
                      {state.errors.address[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages de feedback */}
            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Boutons d'action */}
            {canEdit && (
              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            )}

            {!canEdit && (
              <Alert>
                <AlertDescription>
                  Vous n'avez pas les permissions nécessaires pour modifier ces paramètres.
                  Contactez le propriétaire de l'organisation.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Informations du plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan et abonnement</CardTitle>
          <CardDescription>
            Informations sur votre plan actuel et les limites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Plan actuel</p>
              <Badge variant="secondary" className="text-sm">
                {organization.planType}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <Badge variant={organization.subscriptionStatus === 'active' ? 'default' : 'destructive'}>
                {organization.subscriptionStatus === 'active' ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Limite de membres</p>
              <p className="text-lg font-semibold">{organization.maxMembers}</p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Créée le</p>
            <p className="text-sm">
              {new Date(organization.createdAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}