# Feature Admin

Cette feature gère l'interface d'administration de l'application avec une sidebar moderne basée sur Shadcn/ui.

## Structure

```
src/features/admin/
├── actions/           # Server Actions pour les opérations admin
├── components/        # Composants React admin
│   ├── admin-sidebar.tsx              # Sidebar principale
│   ├── admin-sidebar-wrapper.tsx     # Wrapper serveur
│   ├── admin-sidebar-provider.tsx    # Provider client
│   ├── admin-logo.tsx                # Logo admin
│   ├── admin-user-menu.tsx           # Menu utilisateur
│   ├── admin-quick-actions.tsx       # Actions rapides
│   └── user-create-form.tsx          # Formulaire création utilisateur
├── config/
│   └── navigation.ts  # Configuration de la navigation admin
├── hooks/
│   └── use-admin-sidebar.ts  # Hook pour la sidebar
├── lib/               # Utilitaires et permissions
├── types/             # Types TypeScript
└── README.md
```

## Sidebar Admin

### Architecture
La sidebar admin utilise les composants Shadcn/ui Sidebar avec une architecture en couches :

1. **AdminSidebarWrapper** (Serveur) : Récupère les données utilisateur
2. **AdminSidebarProvider** (Client) : Gère l'état et les permissions
3. **AdminSidebar** (Client) : Composant principal de la sidebar

### Configuration de navigation
Le fichier `config/navigation.ts` contient la configuration de la navigation :

```typescript
export const adminNavigationConfig: AdminNavigationItem[] = [
  {
    title: "Tableau de bord",
    url: "/admin",
    icon: BarChart3,
    requiredPermissions: [Permission.VIEW_ANALYTICS],
  },
  {
    title: "Utilisateurs",
    url: "/admin/users",
    icon: Users,
    requiredPermissions: [Permission.VIEW_USERS],
    items: [
      // Sous-éléments...
    ],
  },
  // Autres éléments...
]
```

### Gestion des permissions
La sidebar filtre automatiquement les éléments selon les permissions de l'utilisateur :

- **requiredRoles** : Rôles requis pour voir l'élément
- **requiredPermissions** : Permissions requises pour voir l'élément
- Filtrage récursif des sous-éléments

### Fonctionnalités

#### Navigation collapsible
- Sections qui se déplient/replient
- État actif automatique selon l'URL
- Badges pour notifications (ex: éléments en modération)

#### Menu utilisateur
- Informations de l'utilisateur connecté
- Badge de rôle
- Actions rapides (retour au site, paramètres)
- Déconnexion

#### Actions rapides
- Liens vers des actions fréquentes
- Retour au site principal

#### Responsive
- S'adapte automatiquement sur mobile
- Utilise le système drawer de Shadcn/ui

## Utilisation

### Layout admin
Le layout `/app/(admin)/layout.tsx` intègre automatiquement la sidebar :

```typescript
import { AdminSidebarWrapper } from '@/features/admin/components/admin-sidebar-wrapper'

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider>
      <AdminSidebarWrapper />
      <SidebarInset>
        <header>...</header>
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

### Hook useAdminSidebar
Le hook gère la logique de la sidebar :

```typescript
const { navigationItems, quickActions, currentPath, user } = useAdminSidebar({ user })
```

### Personnalisation

#### Ajouter un élément de navigation
```typescript
// Dans config/navigation.ts
{
  title: "Nouveau module",
  url: "/admin/nouveau",
  icon: NewIcon,
  requiredPermissions: [Permission.CUSTOM_PERMISSION],
  badge: "3", // Optionnel
}
```

#### Permissions
Les permissions sont définies dans `types/admin.ts` et mappées par rôle dans `ROLE_PERMISSIONS`.

## Sécurité

### Vérifications côté serveur
- Authentification obligatoire
- Vérification des rôles admin
- Permissions granulaires par action

### Filtrage de navigation
- Seuls les éléments autorisés sont affichés
- Vérification des permissions en temps réel

## Thème et Design

### Variables CSS Sidebar
La sidebar utilise les variables CSS spécifiques de Shadcn/ui définies dans `globals.css` :

```css
--sidebar: oklch(0.985 0.001 106.423);
--sidebar-foreground: oklch(0.147 0.004 49.25);
--sidebar-primary: oklch(0.216 0.006 56.043);
/* ... autres variables */
```

### Composants UI
- Badge pour les notifications et rôles
- Avatar pour l'utilisateur
- Collapsible pour les sections
- DropdownMenu pour le menu utilisateur

## Types principaux

```typescript
interface AdminNavigationItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  items?: Omit<AdminNavigationItem, 'items'>[]
}

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isActive: boolean
  // ...
}
```

## Bonnes pratiques

1. **Permissions** : Toujours associer des permissions aux éléments sensibles
2. **Icons** : Utiliser des icônes cohérentes de Lucide React
3. **Navigation** : Garder une hiérarchie claire et logique
4. **Performance** : La sidebar se charge de manière asynchrone
5. **Accessibilité** : Navigation au clavier supportée 