import { User, Settings, Eye, CheckCircle, Activity } from 'lucide-react'

interface ResourceIconProps {
  resource: string
}

export function ResourceIcon({ resource }: ResourceIconProps) {
  const icons = {
    users: User,
    system: Settings,
    content: Eye,
    auth: CheckCircle,
    default: Activity,
  }

  const IconComponent = icons[resource as keyof typeof icons] || icons.default

  return <IconComponent className="h-4 w-4 text-muted-foreground" />
} 