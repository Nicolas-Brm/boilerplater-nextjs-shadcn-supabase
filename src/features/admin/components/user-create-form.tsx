'use client'

import { useActionState, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createUser } from '../actions'
import { UserRole } from '../types'

interface UserCreateFormProps {
  onSuccess?: () => void
}

export function UserCreateForm({ onSuccess }: UserCreateFormProps) {
  const router = useRouter()
  
  // Wrapper function for createUser to add isActive value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createUserAction = async (prevState: any, formData: FormData) => {
    // Add the isActive value explicitly to formData
    formData.set('isActive', isActive.toString())
    
    return createUser(prevState, formData)
  }
  
  const [state, formAction, isPending] = useActionState(createUserAction, null)
  const [isActive, setIsActive] = useState(true)

  // Gérer le succès de la création
  useEffect(() => {
    if (state?.success && state?.data) {
      if (onSuccess) {
        onSuccess()
      } else {
        // Si pas de callback, rediriger vers la liste des utilisateurs
        router.push('/admin/users')
      }
    }
  }, [state?.success, state?.data, onSuccess, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouvel utilisateur</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="utilisateur@exemple.com"
              required
              aria-invalid={state?.errors?.email ? 'true' : 'false'}
            />
            {state?.errors?.email && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.email[0]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Mot de passe <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mot de passe sécurisé"
              required
              aria-invalid={state?.errors?.password ? 'true' : 'false'}
            />
            {state?.errors?.password && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.password[0]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Prénom */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              Prénom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Prénom"
              required
              aria-invalid={state?.errors?.firstName ? 'true' : 'false'}
            />
            {state?.errors?.firstName && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.firstName[0]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Nom <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Nom"
              required
              aria-invalid={state?.errors?.lastName ? 'true' : 'false'}
            />
            {state?.errors?.lastName && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.lastName[0]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Rôle */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rôle <span className="text-destructive">*</span>
            </Label>
            <Select name="role" defaultValue={UserRole.USER}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.USER}>Utilisateur</SelectItem>
                <SelectItem value={UserRole.MODERATOR}>Modérateur</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrateur</SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>Super Administrateur</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.role && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.role[0]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Statut actif */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">
              Compte actif
            </Label>
          </div>

          {/* Messages d'erreur généraux */}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Message de succès */}
          {state?.success && (
            <Alert>
              <AlertDescription>
                Utilisateur créé avec succès !
              </AlertDescription>
            </Alert>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 