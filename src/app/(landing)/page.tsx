import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRightIcon, 
  DatabaseIcon, 
  ShieldIcon, 
  ZapIcon, 
  CodeIcon,
  UsersIcon,
  CheckCircleIcon,
  GithubIcon,
  PlayIcon,
  RocketIcon,
  LockIcon,
  PaletteIcon,
  SparklesIcon
} from "lucide-react"
import { OnboardingGuard } from "@/components/onboarding-guard"

export default function LandingPage() {
  return (
    <OnboardingGuard>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          <div className="relative px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <div className="space-y-6">
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                  🚀 Next.js 15 + Supabase + Shadcn/ui
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  Le <span className="bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent">Boilerplate</span>
                  <br />
                  Ultime pour vos Apps
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Lancez vos projets en quelques minutes avec notre stack moderne. 
                  Authentification, base de données, interface utilisateur, et bien plus - 
                  tout est configuré et prêt à l'emploi.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/register">
                    <RocketIcon className="mr-2 h-5 w-5" />
                    Commencer Maintenant
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/login">
                    <PlayIcon className="mr-2 h-5 w-5" />
                    Voir la Demo
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">99%</div>
                  <div className="text-sm text-muted-foreground">Gain de temps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10+</div>
                  <div className="text-sm text-muted-foreground">Fonctionnalités</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                ✨ Fonctionnalités
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Une architecture moderne et scalable avec toutes les fonctionnalités essentielles
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <ZapIcon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Performance Optimale</CardTitle>
                  <CardDescription className="text-base">
                    Next.js 15 avec App Router, Server Components, et optimisations automatiques pour des performances exceptionnelles
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                    <DatabaseIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Base de Données Moderne</CardTitle>
                  <CardDescription className="text-base">
                    Supabase avec PostgreSQL, Real-time, Edge Functions, et authentification intégrée
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <ShieldIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Sécurité Renforcée</CardTitle>
                  <CardDescription className="text-base">
                    Authentification complète, gestion des rôles, RLS, et bonnes pratiques de sécurité
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <PaletteIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Design System</CardTitle>
                  <CardDescription className="text-base">
                    Shadcn/ui avec Tailwind CSS, dark mode, composants accessibles et personnalisables
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                    <CodeIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl">DX Exceptionnelle</CardTitle>
                  <CardDescription className="text-base">
                    TypeScript, ESLint, Prettier, tests automatisés, et documentation complète
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                    <UsersIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-xl">Interface Admin</CardTitle>
                  <CardDescription className="text-base">
                    Dashboard admin complet avec gestion des utilisateurs, analytics, et paramètres système
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                🛠️ Technologies
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Stack Technologique Moderne
              </h2>
              <p className="text-xl text-muted-foreground">
                Les meilleures technologies du marché, intégrées et optimisées
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-black text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">N</span>
                </div>
                <h3 className="font-semibold">Next.js 15</h3>
                <p className="text-sm text-muted-foreground">React Framework</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">S</span>
                </div>
                <h3 className="font-semibold">Supabase</h3>
                <p className="text-sm text-muted-foreground">Database & Auth</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">T</span>
                </div>
                <h3 className="font-semibold">TypeScript</h3>
                <p className="text-sm text-muted-foreground">Type Safety</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-cyan-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-bold">T</span>
                </div>
                <h3 className="font-semibold">Tailwind CSS</h3>
                <p className="text-sm text-muted-foreground">Styling</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Checklist */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">
                  ✅ Inclus
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Tout est déjà configuré
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Pas besoin de passer des heures à configurer votre environnement. 
                  Nous avons tout préparé pour vous.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Authentification complète",
                    "Base de données PostgreSQL",
                    "Interface admin",
                    "Gestion des rôles",
                    "Dark mode",
                    "Composants UI",
                    "Tests automatisés",
                    "Documentation",
                    "Docker prêt",
                    "CI/CD configuré",
                    "SEO optimisé",
                    "PWA ready"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <SparklesIcon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Prêt en 5 minutes</h3>
                    <p className="text-muted-foreground">
                      Clone, configure, et lance ton application
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                      <div>
                        <h4 className="font-medium">Clone le repository</h4>
                        <p className="text-sm text-muted-foreground">Récupère le code source complet</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                      <div>
                        <h4 className="font-medium">Configure tes variables</h4>
                        <p className="text-sm text-muted-foreground">Ajoute tes clés Supabase</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                      <div>
                        <h4 className="font-medium">Lance l'application</h4>
                        <p className="text-sm text-muted-foreground">Et commence à développer !</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary via-primary to-blue-600">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative max-w-4xl mx-auto text-center space-y-8 text-white">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Prêt à accélérer votre développement ?
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Rejoignez des centaines de développeurs qui ont choisi notre boilerplate 
                pour lancer leurs projets plus rapidement.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link href="/register">
                  <RocketIcon className="mr-2 h-5 w-5" />
                  Commencer Gratuitement
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10">
                <Link href="https://github.com" target="_blank">
                  <GithubIcon className="mr-2 h-5 w-5" />
                  Voir sur GitHub
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm opacity-75">
              <LockIcon className="h-4 w-4" />
              <span>Aucune carte de crédit requise • Accès immédiat</span>
            </div>
          </div>
        </section>
      </div>
    </OnboardingGuard>
  )
} 