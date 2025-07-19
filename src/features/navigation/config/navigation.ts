export interface NavigationItem {
  title: string
  url: string
  icon: string // Utiliser le nom de l'icône comme string
  badge?: string
  items?: Omit<NavigationItem, 'items'>[]
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Tableau de bord",
    url: "/dashboard",
    icon: "Home",
  },
  {
    title: "Utilisateurs",
    url: "/dashboard/users",
    icon: "Users",
    badge: "12",
  },
  {
    title: "Messages",
    url: "/dashboard/messages",
    icon: "Mail",
    badge: "3",
  },
  {
    title: "Calendrier",
    url: "/dashboard/calendar",
    icon: "Calendar",
  },
  {
    title: "Rapports",
    url: "/dashboard/reports",
    icon: "BarChart3",
    items: [
      {
        title: "Ventes",
        url: "/dashboard/reports/sales",
        icon: "BarChart3",
      },
      {
        title: "Analytics",
        url: "/dashboard/reports/analytics",
        icon: "BarChart3",
      },
      {
        title: "Trafic",
        url: "/dashboard/reports/traffic",
        icon: "BarChart3",
      },
    ],
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: "FileText",
  },
  {
    title: "Recherche",
    url: "/dashboard/search",
    icon: "Search",
  },
  {
    title: "Paramètres",
    url: "/dashboard/settings",
    icon: "Settings",
  },
] 