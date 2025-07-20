'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Home, Search, FileX, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8">
        {/* Header avec Badge de statut */}
        <div className="space-y-4">
          <Badge variant="destructive" className="mx-auto flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erreur 404
          </Badge>
          
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-muted/20 rounded-full blur-xl"></div>
            <div className="relative bg-card border rounded-full p-6">
              <FileX className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
              Page introuvable
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              La page que vous recherchez n'existe pas ou a été déplacée vers un autre emplacement.
            </p>
          </div>

          <Separator className="my-6" />

          {/* Actions rapides */}
          <div className="space-y-3">
            <Button asChild size="default" className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
              
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <Search className="h-4 w-4 mr-1" />
                  Explorer
                </Link>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Recharger la page
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Aide et support */}
        <Card className="text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Besoin d'aide ?</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Vérifiez l'URL ou contactez notre équipe si le problème persiste.
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Support disponible</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href="/contact">
                  Contactez-nous
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Navigation suggestions */}
        <Card className="text-left">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pages populaires</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start h-8" asChild>
                <Link href="/dashboard">
                  <Search className="h-3 w-3 mr-2" />
                  Tableau de bord
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8" asChild>
                <Link href="/admin">
                  <Home className="h-3 w-3 mr-2" />
                  Administration
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}