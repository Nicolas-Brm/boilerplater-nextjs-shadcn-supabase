# Paramètres Système Admin

Cette section gère la configuration globale de l'application avec une interface conviviale pour les administrateurs.

## Vue d'ensemble

### Page principale : `/admin/settings`

La page des paramètres système permet aux administrateurs de :

🔧 **Configurer** les paramètres globaux de l'application
🏠 **Gérer** les informations du site (nom, description)  
👥 **Contrôler** l'accès utilisateur (inscriptions, vérifications)
📁 **Ajuster** les limites de fichiers
🚧 **Activer/désactiver** le mode maintenance
📤 **Exporter** la configuration
🔄 **Réinitialiser** aux valeurs par défaut

## Composants

### 1. SystemSettingsForm
**Fichier :** `src/features/admin/components/system-settings-form.tsx`

Formulaire principal avec validation en temps réel utilisant `useFormState`.

**Sections :**
- **Paramètres généraux** : Nom et description du site
- **Gestion des utilisateurs** : Inscriptions et vérification email
- **Gestion des fichiers** : Taille maximale d'upload
- **Mode maintenance** : Activation et message personnalisé

**Fonctionnalités :**
- Validation avec Zod côté client et serveur
- Messages d'erreur contextuel
- Feedback visuel immédiat
- Switch components pour les booléens

### 2. SettingsActions
**Fichier :** `src/features/admin/components/settings-actions.tsx`

Actions système avancées avec confirmations de sécurité.

**Actions disponibles :**
- **Toggle maintenance** : Bascule rapide du mode maintenance
- **Export settings** : Téléchargement JSON de la configuration
- **Reset settings** : Restauration aux valeurs par défaut

**Sécurité :**
- Modales de confirmation pour actions critiques
- States de chargement avec désactivation des boutons
- Messages d'erreur et succès avec Sonner

### 3. Page Settings
**Fichier :** `src/app/(admin)/admin/settings/page.tsx`

Vue principale organisant l'interface en sections avec :
- **Statut système** : Vue d'ensemble avec badges colorés
- **Configuration** : Formulaire de paramètres
- **Actions** : Outils avancés d'administration

## Server Actions

### 1. getSystemSettings()
Récupère tous les paramètres depuis la base de données.

```typescript
const result = await getSystemSettings()
// Transforme les clés de base vers l'interface SystemSettings
```

### 2. updateSystemSettings(prevState, formData)
Met à jour les paramètres avec validation Zod.

```typescript
const result = await updateSystemSettings(prevState, formData)
// Validation + mise à jour + revalidation de la page
```

### 3. toggleMaintenanceMode()
Bascule rapidement le mode maintenance.

```typescript
const result = await toggleMaintenanceMode()
// Lecture état actuel + inversion + mise à jour
```

### 4. resetSettings()
Restaure tous les paramètres aux valeurs par défaut.

```typescript
const result = await resetSettings()
// Réinitialisation complète avec valeurs sécurisées
```

### 5. exportSettings()
Génère un fichier JSON avec tous les paramètres.

```typescript
const result = await exportSettings()
// Création d'un blob téléchargeable avec timestamp
```

## Base de données

### Table `system_settings`

```sql
CREATE TABLE public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Paramètres par défaut

| Clé | Valeur par défaut | Description |
|-----|------------------|-------------|
| `site_name` | "Mon Application" | Nom affiché du site |
| `site_description` | "Description..." | Description courte |
| `allow_registration` | `true` | Autoriser nouvelles inscriptions |
| `require_email_verification` | `true` | Vérification email obligatoire |
| `max_upload_size` | `10` | Taille max upload en MB |
| `maintenance_mode` | `false` | Site en maintenance |
| `maintenance_message` | `""` | Message affiché en maintenance |

### Sécurité RLS

```sql
-- Seuls les admins peuvent accéder aux paramètres
CREATE POLICY "Only admins can access system settings" 
ON public.system_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
    AND is_active = true
  )
);
```

## Permissions

### Permission requise
`Permission.MANAGE_SETTINGS`

### Rôles autorisés
- ✅ **ADMIN** : Accès complet
- ✅ **SUPER_ADMIN** : Accès complet  
- ❌ **MODERATOR** : Pas d'accès par défaut
- ❌ **USER** : Aucun accès

## Utilisation

### Installation
1. Exécuter la migration SQL (`src/features/admin/migrations/system-settings.sql`)
2. Vérifier les permissions admin de l'utilisateur
3. Accéder à `/admin/settings`

### Workflow type
1. **Visualiser** le statut actuel du système
2. **Modifier** les paramètres via le formulaire
3. **Sauvegarder** avec validation automatique
4. **Exporter** la configuration (optionnel)
5. **Activer maintenance** pour déploiements

### Bonnes pratiques

#### 🔒 Sécurité
- Tester les changements en développement
- Exporter avant modifications importantes
- Surveiller les logs d'activité
- Utiliser le mode maintenance pour déploiements

#### 📱 UX
- Messages clairs pour les utilisateurs en maintenance
- Limites de fichiers appropriées au serveur
- Vérification email selon la politique de sécurité

#### 🚀 Performance
- Valeurs raisonnables pour max_upload_size
- Mode maintenance temporaire uniquement
- Export régulier pour sauvegarde

## Logs d'activité

Toutes les actions sont automatiquement loggées :

```typescript
await logActivity('UPDATE_SETTINGS', 'system', undefined, {
  updatedSettings: ['site_name', 'maintenance_mode']
})
```

**Types d'actions :**
- `VIEW_SETTINGS` : Consultation des paramètres
- `UPDATE_SETTINGS` : Modification des paramètres  
- `RESET_SETTINGS` : Réinitialisation
- `EXPORT_SETTINGS` : Export de configuration
- `ENABLE_MAINTENANCE` : Activation maintenance
- `DISABLE_MAINTENANCE` : Désactivation maintenance

## Intégration avec la sidebar

La navigation inclut automatiquement "Paramètres système" pour les utilisateurs avec `Permission.MANAGE_SETTINGS`.

```typescript
{
  title: "Paramètres système",
  url: "/admin/settings", 
  icon: Settings,
  requiredPermissions: [Permission.MANAGE_SETTINGS],
}
```

## Dépannage

### Erreurs communes

1. **Permission denied**
   - Vérifier le rôle utilisateur (`admin`/`super_admin`)
   - Contrôler les politiques RLS
   
2. **Paramètres non sauvegardés**
   - Vérifier la validation Zod
   - Consulter les logs serveur
   
3. **Mode maintenance bloqué**
   - Accès direct en base de données
   - Utiliser compte super_admin

### Debug
- Page `/admin/debug` pour diagnostics
- Logs dans la console navigateur
- Activity logs en base de données

## Migration

Pour migrer une configuration existante :

1. **Exporter** les paramètres actuels
2. **Appliquer** la migration SQL
3. **Importer** les paramètres (développement futur)
4. **Vérifier** le bon fonctionnement

---

**Note :** Cette interface respecte les conventions Shadcn/ui et Next.js 15 pour une expérience cohérente avec le reste de l'application admin. 