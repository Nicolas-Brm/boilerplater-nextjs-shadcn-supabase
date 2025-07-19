import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  BarChart3,
  Calendar,
  Mail,
  Search,
  type LucideIcon 
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Home,
  Users,
  Settings,
  FileText,
  BarChart3,
  Calendar,
  Mail,
  Search,
}

interface IconProps {
  name: string
  className?: string
}

export function Icon({ name, className }: IconProps) {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <IconComponent className={className} />
} 