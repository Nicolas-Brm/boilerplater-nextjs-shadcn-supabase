import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Shield, Bell, Palette, Database, Building2 } from 'lucide-react'
import { ProfileSettingsForm } from '@/features/dashboard/components/profile-settings-form'
import { SecuritySettingsForm } from '@/features/dashboard/components/security-settings-form'
import { NotificationSettingsForm } from '@/features/dashboard/components/notification-settings-form'
import { AppearanceSettingsForm } from '@/features/dashboard/components/appearance-settings-form'
import { DataSettingsForm } from '@/features/dashboard/components/data-settings-form'
import { OrganizationSettingsForm } from '@/features/organization/components/organization-settings-form'
import { Skeleton } from '@/components/ui/skeleton'

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Données
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Mettez à jour vos informations de profil et coordonnées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <ProfileSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité du compte
              </CardTitle>
              <CardDescription>
                Gérez vos paramètres de sécurité et de confidentialité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <SecuritySettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
              <CardDescription>
                Configurez comment et quand vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <NotificationSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <AppearanceSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Paramètres de l'organisation
              </CardTitle>
              <CardDescription>
                Gérez les paramètres et la configuration de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <OrganizationSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>
                Exportez, sauvegardez ou supprimez vos données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SettingsSkeleton />}>
                <DataSettingsForm />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

export const metadata = {
  title: 'Paramètres',
  description: 'Gérez vos préférences et paramètres de compte et de votre organisation',
} 