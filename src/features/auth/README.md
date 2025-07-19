# Feature Auth - Système d'authentification

Cette feature implémente un système d'authentification complet avec Supabase selon l'architecture basée sur les features de Next.js 15.

## Structure

```
src/features/auth/
├── actions/           # Server Actions pour l'authentification
│   ├── login.ts      # Connexion
│   ├── register.ts   # Inscription
│   ├── logout.ts     # Déconnexion (avec état)
│   ├── logout-simple.ts # Déconnexion (sans état)
│   ├── forgot-password.ts # Mot de passe oublié
│   └── index.ts      # Barrel exports
├── components/        # Composants d'interface
│   ├── login-form.tsx
│   ├── register-form.tsx
│   ├── forgot-password-form.tsx
│   ├── logout-button.tsx
│   └── index.ts      # Barrel exports
├── hooks/            # Hooks React
│   ├── use-auth.ts   # Hook d'authentification côté client
│   └── index.ts      # Barrel exports
├── types/            # Types TypeScript
│   ├── auth.ts       # Types et schémas de validation
│   └── index.ts      # Barrel exports
└── README.md         # Cette documentation
```

## Utilisation

### Server Actions

```typescript
import { login, register, logout, forgotPassword } from '@/features/auth/actions'

// Dans un composant client avec useFormState
const [state, formAction] = useFormState(login, null)

// Pour la déconnexion simple
import { logoutSimple } from '@/features/auth/actions'
```

### Composants

```typescript
import { 
  LoginForm, 
  RegisterForm, 
  ForgotPasswordForm,
  LogoutButton 
} from '@/features/auth/components'

// Utilisation du bouton de déconnexion
<LogoutButton variant="outline" className="w-full" />
```

### Hooks

```typescript
import { useAuth } from '@/features/auth/hooks'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Chargement...</div>
  if (!user) return <div>Non connecté</div>
  
  return <div>Bonjour {user.email}</div>
}
```

### Utilitaires d'authentification

```typescript
import { requireAuth, requireNoAuth, getCurrentUser } from '@/lib/auth'

// Server Component qui nécessite une authentification
export default async function ProtectedPage() {
  const user = await requireAuth() // Redirige vers /login si non connecté
  return <div>Page protégée pour {user.email}</div>
}

// Layout qui ne doit pas être accessible aux utilisateurs connectés
export default async function AuthLayout({ children }) {
  await requireNoAuth() // Redirige vers /dashboard si connecté
  return <div>{children}</div>
}
```

## Configuration

### Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Middleware

Le middleware gère automatiquement la redirection des utilisateurs non authentifiés vers `/login`.

Les routes publiques sont :
- `/` (page d'accueil)
- `/login`
- `/register` 
- `/forgot-password`
- `/auth/*` (callbacks Supabase)

## Pages d'authentification

Les pages sont organisées dans `src/app/(auth)/` :

- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/forgot-password` - Page de réinitialisation du mot de passe

Le layout `(auth)` inclut une interface moderne avec :
- Section informative sur la gauche (desktop)
- Formulaire centré sur la droite
- Design responsive

## Sécurité

- Validation côté serveur avec Zod
- Protection CSRF native avec Next.js
- Gestion sécurisée des cookies
- Middleware de protection des routes
- Messages d'erreur sécurisés (pas d'exposition d'informations sensibles)

## Bonnes pratiques

1. **Utiliser `requireAuth()`** dans les Server Components protégés
2. **Utiliser `requireNoAuth()`** dans les layouts d'authentification
3. **Utiliser le hook `useAuth()`** pour l'état d'authentification côté client
4. **Utiliser `LogoutButton`** au lieu de créer ses propres boutons de déconnexion
5. **Valider toujours les données** avec les schémas Zod fournis

## Extension

Pour ajouter de nouvelles fonctionnalités d'authentification :

1. Créer de nouvelles actions dans `actions/`
2. Ajouter les types correspondants dans `types/auth.ts`
3. Créer les composants dans `components/`
4. Mettre à jour les exports dans `index.ts`

Exemple pour l'authentification OAuth :

```typescript
// actions/oauth.ts
'use server'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })
  // ...
}
``` 