export interface NavigationItem {
  title: string
  url: string
  icon: string // Utiliser le nom de l'icône comme string
  badge?: string
  items?: Omit<NavigationItem, 'items'>[]
}

export const navigationConfig: NavigationItem[] = [
  {
    title: "Paid",
    url: "/dashboard",
    icon: "DollarSign",
  },
  {
    title: "Organic",
    url: "/global/organic",
    icon: "Leaf",
  },
  {
    title: "Influence",
    url: "/global/influence",
    icon: "Users",
  },
  {
    title: "Newsletters",
    url: "/global/newsletters",
    icon: "Mail",
  },
  {
    title: "Landing pages",
    url: "/global/landing-pages",
    icon: "File",
  },
  {
    title: "Products",
    url: "/global/products",
    icon: "Box",
  },
  {
    title: "Reports",
    url: "/insights/reports",
    icon: "BarChart",
  },
  {
    title: "Sectors",
    url: "/insights/sectors",
    icon: "PieChart",
  },
  {
    title: "Understand",
    url: "/insights/understand",
    icon: "Eye",
  },
  {
    title: "Brand Safety",
    url: "/insights/brand-safety",
    icon: "Shield",
  },
  {
    title: "Collections",
    url: "/insights/collections",
    icon: "Folder",
    items: [
      {
        title: "Collection n°1",
        url: "/insights/collections/1",
        icon: "Folder",
      },
      {
        title: "Collection n°2",
        url: "/insights/collections/2",
        icon: "Folder",
      },
      {
        title: "Collection n°3",
        url: "/insights/collections/3",
        icon: "Folder",
      },
      {
        title: "Collection n°4",
        url: "/insights/collections/4",
        icon: "Folder",
      },
    ],
  },
]