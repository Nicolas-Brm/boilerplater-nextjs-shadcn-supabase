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
import { Loader2, Save, X } from 'lucide-react'
import { updateUser } from '../actions'
import { UserRole, type AdminUser } from '../types'

interface UserEditFormProps {
  user: AdminUser
  onSuccess?: () => void
}

export function UserEditForm({ user, onSuccess }: UserEditFormProps) {
  const router = useRouter()
  
  // Wrapper function for updateUser to match useActionState signature
  const updateUserAction = async (prevState: any, formData: FormData) => {
    // Get userId from form data
    const userId = formData.get('userId') as string
    
    // Add the isActive value explicitly to formData
    formData.set('isActive', isActive.toString())
    
    return updateUser(userId, prevState, formData)
  }
  
  const [state, formAction, isPending] = useActionState(updateUserAction, null)
  const [isActive, setIsActive] = useState(user.isActive)

  // Gérer le succès de la modification
  useEffect(() => {
    if (state?.success) {
      if (onSuccess) {
        onSuccess()
      } else {
        // Si pas de callback, rediriger vers la page de détail
        router.push(`/admin/users/${user.id}`)
      }
    }
  }, [state?.success, onSuccess, router, user.id])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifier les informations utilisateur</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {/* Hidden userId field */}
          <input type="hidden" name="userId" value={user.id} />

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              aria-invalid={state?.errors?.email ? 'true' : 'false'}
            />
            {state?.errors?.email && (
              <Alert variant="destructive">
                <AlertDescription>{state.errors.email[0]}</AlertDescription>
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
              defaultValue={user.firstName}
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
              defaultValue={user.lastName}
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
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger>
                <SelectValue />
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
                Utilisateur modifié avec succès !
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
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Sauvegarder
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 