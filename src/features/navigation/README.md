# Feature Navigation - Sidebar Shadcn/ui

Cette feature implémente une sidebar complète avec Shadcn/ui selon l'architecture basée sur les features de Next.js 15.

## Structure

```
src/features/navigation/
├── components/           # Composants de navigation
│   ├── app-sidebar.tsx   # Sidebar principale
│   ├── navigation-menu.tsx # Menu simple
│   ├── collapsible-navigation.tsx # Navigation avec sections collapsibles
│   └── index.ts         # Barrel exports
├── config/              # Configuration
│   └── navigation.ts    # Configuration des routes
├── hooks/               # Hooks React
│   ├── use-sidebar-layout.ts # Hook pour gérer la sidebar
│   └── index.ts         # Barrel exports
├── index.ts             # Export principal
└── README.md            # Cette documentation
```

## Utilisation

### Sidebar principale

La sidebar est intégrée dans le layout dashboard et gère automatiquement :
- Navigation avec états actifs
- Sections collapsibles (ex: Rapports)
- Menu utilisateur avec déconnexion
- Responsive design (mobile/desktop)
- Raccourci clavier (Cmd/Ctrl + B)

```typescript
// Déjà intégré dans src/app/(dashboard)/layout.tsx
import { AppSidebar } from '@/features/navigation/components'

<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    {/* Contenu */}
  </SidebarInset>
</SidebarProvider>
```

### Configuration de navigation

```typescript
// src/features/navigation/config/navigation.ts
export const navigationConfig: NavigationItem[] = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Rapports", 
    url: "/dashboard/reports",
    icon: BarChart3,
    items: [ // Sous-menu collapsible
      {
        title: "Ventes",
        url: "/dashboard/reports/sales",
        icon: BarChart3,
      }
    ]
  }
]
```

### Hooks disponibles

```typescript
import { useSidebarLayout } from '@/features/navigation/hooks'

function MyComponent() {
  const { 
    isCollapsed, 
    isExpanded, 
    isMobile, 
    toggleSidebar 
  } = useSidebarLayout()
  
  return (
    <button onClick={toggleSidebar}>
      {isCollapsed ? 'Ouvrir' : 'Fermer'} la sidebar
    </button>
  )
}
```

## Fonctionnalités

### Navigation intelligente
- **États actifs** : Détection automatique de la page active
- **Badges** : Affichage de notifications (ex: "12" utilisateurs)
- **Tooltips** : Affichage du titre au survol en mode collapsed
- **Navigation par liens** : Utilise Next.js Link pour la performance

### Design responsive
- **Desktop** : Sidebar collapsible avec icônes
- **Mobile** : Drawer qui s'ouvre par-dessus le contenu
- **Adaptation automatique** : Détection de la taille d'écran

### Menu utilisateur
- **Informations utilisateur** : Email, avatar, initiales
- **Actions** : Profil, paramètres, déconnexion
- **Intégration Supabase** : Données utilisateur automatiques

### Personnalisation
- **Thème** : Variables CSS pour personnaliser les couleurs
- **Icônes** : Lucide React pour une cohérence visuelle
- **Animations** : Transitions fluides avec Tailwind

## Variables CSS

```css
/* Personnalisation du thème sidebar */
:root {
  --sidebar: oklch(0.985 0.001 106.423);
  --sidebar-foreground: oklch(0.147 0.004 49.25);
  --sidebar-primary: oklch(0.216 0.006 56.043);
  --sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --sidebar-accent: oklch(0.97 0.001 106.424);
  --sidebar-accent-foreground: oklch(0.216 0.006 56.043);
  --sidebar-border: oklch(0.923 0.003 48.717);
  --sidebar-ring: oklch(0.709 0.01 56.259);
}
```

## Accessibilité

- **Navigation clavier** : Support complet des touches
- **ARIA labels** : Labels appropriés pour les lecteurs d'écran
- **Focus management** : Gestion du focus cohérente
- **Contraste** : Couleurs conformes aux standards

## Raccourcis clavier

- **Cmd/Ctrl + B** : Toggle de la sidebar
- **Échap** : Fermeture du menu utilisateur
- **Tab/Shift+Tab** : Navigation dans les éléments

## Extension

### Ajouter une nouvelle route

1. Modifier `navigationConfig` dans `config/navigation.ts`
2. Créer la page correspondante dans `app/(dashboard)/`
3. La navigation se met à jour automatiquement

### Ajouter des sous-menus

```typescript
{
  title: "Ma section",
  url: "/dashboard/section",
  icon: MyIcon,
  items: [
    {
      title: "Sous-page 1",
      url: "/dashboard/section/sub1", 
      icon: SubIcon,
    }
  ]
}
```

### Personnaliser l'apparence

```typescript
// Modifier app-sidebar.tsx pour changer le branding
<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
  <MonLogo className="size-4" />
</div>
```

## Bonnes pratiques

1. **URLs cohérentes** : Utiliser le préfixe `/dashboard/` pour toutes les routes
2. **Icônes cohérentes** : Utiliser Lucide React exclusivement  
3. **Noms explicites** : Titres clairs et descriptifs
4. **Hiérarchie logique** : Organiser les menus par domaine fonctionnel
5. **Performance** : Les Server Components sont utilisés pour l'authentification 