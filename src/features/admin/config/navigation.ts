import { 
  BarChart3,
  Users, 
  Activity, 
  Settings, 
  UserPlus,
  FileText,
  Database,
  AlertTriangle,
  Home,
  Bug,
  type LucideIcon 
} from 'lucide-react'
import { Permission, UserRole } from '../types'

export interface AdminNavigationItem {
  title: string
  url: string
  icon: LucideIcon
  badge?: string
  requiredPermissions?: Permission[]
  requiredRoles?: UserRole[]
  items?: Omit<AdminNavigationItem, 'items'>[]
}

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
      {
        title: "Liste des utilisateurs",
        url: "/admin/users",
        icon: Users,
        requiredPermissions: [Permission.VIEW_USERS],
      },
      {
        title: "Créer un utilisateur",
        url: "/admin/users/new",
        icon: UserPlus,
        requiredPermissions: [Permission.CREATE_USERS],
      },
    ],
  },
  {
    title: "Contenu",
    url: "/admin/content",
    icon: FileText,
    requiredPermissions: [Permission.VIEW_ALL_CONTENT],
    items: [
      {
        title: "Modération",
        url: "/admin/content/moderation",
        icon: AlertTriangle,
        requiredPermissions: [Permission.MODERATE_CONTENT],
        badge: "3", // Nombre d'éléments en attente
      },
      {
        title: "Tous les contenus",
        url: "/admin/content/all",
        icon: FileText,
        requiredPermissions: [Permission.VIEW_ALL_CONTENT],
      },
    ],
  },
  {
    title: "Logs d'activité",
    url: "/admin/logs",
    icon: Activity,
    requiredPermissions: [Permission.VIEW_LOGS],
  },
  {
    title: "Base de données",
    url: "/admin/database",
    icon: Database,
    requiredRoles: [UserRole.SUPER_ADMIN],
  },
  {
    title: "Paramètres système",
    url: "/admin/settings",
    icon: Settings,
    requiredPermissions: [Permission.MANAGE_SETTINGS],
  },
  {
    title: "Debug",
    url: "/admin/debug",
    icon: Bug,
    requiredRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
]

export const adminQuickActions: AdminNavigationItem[] = [
  {
    title: "Retour au site",
    url: "/dashboard",
    icon: Home,
  },
]

/**
 * Filtre les éléments de navigation selon les permissions de l'utilisateur
 */
export function filterNavigationByPermissions(
  items: AdminNavigationItem[],
  userRole: UserRole,
  userPermissions: Permission[]
): AdminNavigationItem[] {
  return items.filter(item => {
    // Si des rôles spécifiques sont requis
    if (item.requiredRoles && item.requiredRoles.length > 0) {
      if (!item.requiredRoles.includes(userRole)) {
        return false
      }
    }

    // Si des permissions spécifiques sont requises
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      if (!item.requiredPermissions.some(permission => userPermissions.includes(permission))) {
        return false
      }
    }

    // Filtrer les sous-éléments
    if (item.items) {
      item.items = filterNavigationByPermissions(item.items, userRole, userPermissions)
    }

    return true
  })
} 