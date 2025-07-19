'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Home, Search, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Large 404 Number */}
        <div className="relative">
          <h1 className="text-9xl md:text-[12rem] font-bold text-muted-foreground/20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileQuestion className="h-16 w-16 md:h-24 md:w-24 text-muted-foreground/40" />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Page non trouvée
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Désolé, la page que vous recherchez semble avoir disparu ou n'existe pas.
            </p>
          </div>

          {/* Suggestions Card */}
          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                Que souhaitez-vous faire ?
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button 
                  asChild 
                  variant="default" 
                  size="lg"
                  className="w-full justify-start"
                >
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Retour à l'accueil
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full justify-start"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Page précédente
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="w-full justify-start sm:col-span-2"
                >
                  <Link href="/dashboard">
                    <Search className="mr-2 h-4 w-4" />
                    Aller au tableau de bord
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Si vous pensez qu'il s'agit d'une erreur, veuillez vérifier l'URL ou
            </p>
            <p>
              <Link 
                href="/contact" 
                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              >
                contactez notre équipe de support
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/5 blur-3xl"></div>
        </div>
      </div>
    </div>
  )
}