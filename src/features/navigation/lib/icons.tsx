import * as Icons from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Home: Icons.Home,
  Users: Icons.Users,
  Settings: Icons.Settings,
  FileText: Icons.FileText,
  BarChart3: Icons.BarChart3,
  Calendar: Icons.Calendar,
  Mail: Icons.Mail,
  Search: Icons.Search,
  DollarSign: Icons.DollarSign,
  Leaf: Icons.Leaf,
  Box: Icons.Box,
  BarChart: Icons.BarChart,
  PieChart: Icons.PieChart,
  Eye: Icons.Eye,
  Shield: Icons.Shield,
  Folder: Icons.Folder,
  File: Icons.File,
}

interface IconProps {
  name: keyof typeof iconMap
  className?: string
}

export const Icon: React.FC<IconProps> = ({ name, className }) => {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <IconComponent className={className} />
}