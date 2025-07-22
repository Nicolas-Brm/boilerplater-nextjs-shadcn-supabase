# Système d'Onboarding Admin

Ce système gère l'initialisation du premier superadmin lors du démarrage du SaaS.

## Vue d'ensemble

Quand aucun superadmin n'existe dans le système, l'application redirige automatiquement vers une page d'onboarding permettant de créer le premier compte avec tous les privilèges administrateur.

## Architecture

### Fichiers principaux

```
src/features/admin/
├── actions/
│   └── onboarding.ts          # Actions serveur pour l'onboarding
├── components/
│   ├── enhanced-onboarding-form.tsx # Formulaire de création du superadmin (multi-étapes)
│   └── onboarding-success.tsx       # Page de succès post-création
└── README-onboarding.md

src/app/
├── onboarding/
│   ├── layout.tsx             # Layout sans navigation
│   ├── page.tsx               # Page d'onboarding principale
│   └── success/
│       └── page.tsx           # Page de succès
├── api/admin/onboarding/
│   └── status/
│       └── route.ts           # API pour vérifier le statut
└── components/
    └── onboarding-guard.tsx   # Guard serveur
```

## Fonctionnement

### 1. Détection automatique

Le `OnboardingGuard` vérifie s'il existe au moins un superadmin actif :

```typescript
// Utilisé dans les pages principales
import { OnboardingGuard } from '@/components/onboarding-guard'

export default function HomePage() {
  return (
    <OnboardingGuard>
      {/* Contenu normal de la page */}
    </OnboardingGuard>
  )
}
```

### 2. Redirection automatique

Si aucun superadmin n'est trouvé :
- **Serveur** : Redirection immédiate vers `/onboarding` via OnboardingGuard

### 3. Processus de création (Multi-étapes)

1. **Formulaire multi-étapes** : 
   - Étape 1: Bienvenue et présentation
   - Étape 2: Informations personnelles (prénom, nom, email)
   - Étape 3: Sécurité (mot de passe + confirmation)
   - Étape 4: Récapitulatif et validation
2. **Validation** : Zod côté client et serveur avec feedback en temps réel
3. **Création** : 
   - Utilisateur dans `auth.users` (email auto-confirmé)
   - Profil dans `user_profiles` avec rôle `super_admin`
   - Connexion automatique après création
4. **Redirection** : Vers `/onboarding/success`

### 4. Page de succès

Affiche les prochaines étapes et permet :
- Se connecter directement
- Retourner à l'accueil
- Voir les fonctionnalités disponibles

## Utilisation

### Intégration dans une page

```typescript
import { OnboardingGuard } from '@/components/onboarding-guard'

export default function MyPage() {
  return (
    <OnboardingGuard>
      <div>Mon contenu protégé</div>
    </OnboardingGuard>
  )
}
```

### Vérification manuelle

```typescript
import { hasSuperAdmin } from '@/features/admin/actions/onboarding'

export default async function MyComponent() {
  const hasAdmin = await hasSuperAdmin()
  
  if (!hasAdmin) {
    // Logique spéciale pour l'onboarding
  }
  
  // Suite normale
}
```

### API côté client (optionnelle)

Le système privilégie les redirections côté serveur pour de meilleures performances et SEO. L'API `/api/admin/onboarding/status` reste disponible pour des cas spécifiques nécessitant une vérification côté client.

## Configuration requise

### Variables d'environnement

```env
# Obligatoire pour créer le premier superadmin
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# URLs de base
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Base de données

Table `user_profiles` avec :
- `role` : enum incluant `'super_admin'`
- `is_active` : boolean pour les comptes actifs

## Sécurité

### Protections intégrées

1. **Vérification double** : Contrôle avant création
2. **Service Role Key** : Nécessaire pour les opérations admin
3. **Auto-confirmation** : Email confirmé automatiquement pour le premier admin
4. **Nettoyage** : Suppression auto en cas d'échec de profil
5. **Validation stricte** : Schémas Zod pour toutes les entrées

### Bonnes pratiques

- ✅ Mot de passe fort (min 8 caractères)
- ✅ Email valide et accessible
- ✅ Garder les identifiants en sécurité
- ✅ Tester le processus en développement
- ✅ Vérifier les logs en cas de problème

## API de référence

### Actions serveur

```typescript
// Vérifier l'existence d'un superadmin
await hasSuperAdmin(): Promise<boolean>

// Vérifier si l'onboarding est nécessaire
await needsOnboarding(): Promise<AdminActionResult<{ needsOnboarding: boolean }>>

// Créer le premier superadmin
await createFirstSuperAdmin(formData: FormData): Promise<AdminActionResult | never>
```

### API Routes

```typescript
// GET /api/admin/onboarding/status
{
  needsOnboarding: boolean
}
```

## Débogage

### Logs à surveiller

```bash
# Processus de création
🔍 [createFirstSuperAdmin] Début de la création du premier superadmin
✅ [createFirstSuperAdmin] Données validées pour: email@example.com
🔍 [createFirstSuperAdmin] Création de l'utilisateur auth...
✅ [createFirstSuperAdmin] Utilisateur auth créé: uuid
🔍 [createFirstSuperAdmin] Création du profil superadmin...
✅ [createFirstSuperAdmin] Profil superadmin créé avec succès
```

### Problèmes fréquents

1. **Service role key manquante**
   ```
   ❌ Configuration manquante: SUPABASE_SERVICE_ROLE_KEY nécessaire
   ```

2. **Superadmin déjà existant**
   ```
   ❌ Un superadmin existe déjà dans le système
   ```

3. **Erreur de profil**
   ```
   ❌ Erreur lors de la création du profil: [détails]
   ```

### Commandes utiles

```sql
-- Vérifier les superadmins existants
SELECT * FROM user_profiles WHERE role = 'super_admin' AND is_active = true;

-- Promouvoir un utilisateur existant (alternative)
UPDATE user_profiles SET role = 'super_admin' WHERE id = 'user-uuid';

-- Réinitialiser (développement uniquement)
DELETE FROM user_profiles WHERE role = 'super_admin';
```

## Workflow de développement

1. **Premier démarrage** : Naviguer vers n'importe quelle page → redirection automatique
2. **Remplir le formulaire** : Email, mot de passe, nom, prénom
3. **Validation** : Vérification côté client et serveur
4. **Création** : Compte superadmin créé automatiquement
5. **Succès** : Page de confirmation avec prochaines étapes
6. **Connexion** : Utiliser les identifiants créés

## Intégration continue

Pour les tests automatisés, vous pouvez :

1. **Créer un superadmin de test** avant les tests
2. **Nettoyer** après les tests si nécessaire
3. **Mocker** les fonctions d'onboarding pour les tests unitaires

```typescript
// Test setup
beforeEach(async () => {
  await createTestSuperAdmin()
})

afterEach(async () => {
  await cleanupTestData()
})
``` 