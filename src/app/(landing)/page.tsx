import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Zap, 
  Users, 
  Palette, 
  Code, 
  Database,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <Badge variant="secondary" className="mx-auto">
            <Star className="w-3 h-3 mr-1" />
            Next.js 15 Ready
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Boilerplate Next.js
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-7">
            Démarrez rapidement votre projet avec Next.js 15, Shadcn/ui, Supabase et TypeScript. 
            Tout ce dont vous avez besoin pour créer une application moderne.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg">
            <Link href="/login">
              Se connecter
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Fonctionnalités incluses</h2>
          <p className="text-muted-foreground">
            Tous les outils essentiels pour développer rapidement
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Authentification</CardTitle>
              <CardDescription>
                Système d'auth complet avec Supabase Auth
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Login / Register</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Mot de passe oublié</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Protection des routes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Design System</CardTitle>
              <CardDescription>
                Interface moderne avec Shadcn/ui et Tailwind
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Composants réutilisables</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Dark/Light mode</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Responsive design</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Base de données</CardTitle>
              <CardDescription>
                Supabase PostgreSQL avec ORM intégré
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>PostgreSQL cloud</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Migrations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Types TypeScript</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Server Actions</CardTitle>
              <CardDescription>
                Next.js 15 Server Actions prêts à l'emploi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Validation Zod</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Gestion d'erreurs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Architecture sécurisée</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Administration</CardTitle>
              <CardDescription>
                Panel d'admin avec gestion des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Gestion utilisateurs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Paramètres système</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Analytics</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Dev Experience</CardTitle>
              <CardDescription>
                Outils de développement optimisés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>TypeScript strict</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ESLint + Prettier</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Hot reload</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Stack technique</h2>
          <p className="text-muted-foreground">
            Technologies modernes et éprouvées
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Next.js 15',
            'React 19',
            'TypeScript',
            'Tailwind CSS',
            'Shadcn/ui',
            'Supabase',
            'Server Actions',
            'PostgreSQL'
          ].map((tech) => (
            <Badge key={tech} variant="secondary" className="px-3 py-1">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 border-t border-border/50 pt-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Prêt à commencer votre projet ?
          </h2>
          <p className="text-muted-foreground">
            Créez votre compte et lancez votre application en quelques minutes
          </p>
          
          <Button asChild size="lg" className="gap-2">
            <Link href="/register">
              Créer un compte gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
