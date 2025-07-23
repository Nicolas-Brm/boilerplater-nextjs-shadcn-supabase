import { 
  BarChart3,
  Users, 
  Activity, 
  Settings, 
  UserPlus,
  Building2,
  Home,
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

// Navigation basée uniquement sur les fonctionnalités avec vraies données
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
    title: "Organisations",
    url: "/admin/organizations",
    icon: Building2,
    requiredPermissions: [Permission.VIEW_ORGANIZATIONS],
  },
  {
    title: "Logs d'activité",
    url: "/admin/logs",
    icon: Activity,
    requiredPermissions: [Permission.VIEW_LOGS],
  },
  {
    title: "Paramètres système",
    url: "/admin/settings",
    icon: Settings,
    requiredPermissions: [Permission.MANAGE_SETTINGS],
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

/**
 * Obtient les permissions de l'utilisateur selon son rôle
 */
export function getUserPermissions(userRole: UserRole): Permission[] {
  const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.USER]: [],
    [UserRole.MODERATOR]: [
      Permission.VIEW_USERS,
      Permission.VIEW_ORGANIZATIONS,
      Permission.VIEW_ANALYTICS,
    ],
    [UserRole.ADMIN]: [
      Permission.VIEW_USERS,
      Permission.CREATE_USERS,
      Permission.UPDATE_USERS,
      Permission.MANAGE_USER_ROLES,
      Permission.VIEW_ORGANIZATIONS,
      Permission.MANAGE_ORGANIZATIONS,
      Permission.VIEW_ANALYTICS,
      Permission.MANAGE_SETTINGS,
      Permission.VIEW_LOGS,
    ],
    [UserRole.SUPER_ADMIN]: Object.values(Permission),
  }
  
  return ROLE_PERMISSIONS[userRole] || []
}