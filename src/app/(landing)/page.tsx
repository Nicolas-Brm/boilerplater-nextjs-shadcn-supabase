import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, DatabaseIcon, ShieldIcon, ZapIcon, SmartphoneIcon } from "lucide-react"
import InputPhoneNumber from "@/components/InputPhoneNumber"
import { OnboardingGuard } from "@/components/onboarding-guard"

export default function LandingPage() {
  return (
    <OnboardingGuard>
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              Next.js 15 + Supabase + Shadcn/ui
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Modern Full-Stack
              <span className="text-primary"> Boilerplate</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build production-ready applications with the latest web technologies.
              Authentication, database, UI components, and more - all configured and ready to go.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Built for Scale
            </h2>
            <p className="text-xl text-muted-foreground">
              Production-ready features that grow with your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <ZapIcon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with Next.js 15 App Router for optimal performance and developer experience
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DatabaseIcon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Database Ready</CardTitle>
                <CardDescription>
                  Supabase integration with real-time capabilities and type-safe queries
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ShieldIcon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure by Default</CardTitle>
                <CardDescription>
                  Built-in authentication, authorization, and security best practices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Phone Input Demo Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SmartphoneIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Enhanced Components
            </h2>
            <p className="text-xl text-muted-foreground">
              Beautiful, accessible, and feature-rich components built with Shadcn/ui
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Phone Input Demo */}
            <Card>
              <CardHeader>
                <CardTitle>International Phone Input</CardTitle>
                <CardDescription>
                  Enhanced phone number input with country selection, validation, and accessibility features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Example */}
                <div>
                  <h4 className="font-medium mb-3">Basic Usage</h4>
                  <InputPhoneNumber
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    description="We'll use this to contact you about your order"
                  />
                </div>

                {/* Required Example */}
                <div>
                  <h4 className="font-medium mb-3">Required Field</h4>
                  <InputPhoneNumber
                    label="Business Phone"
                    placeholder="Enter business phone"
                    required
                  />
                </div>

                {/* Error Example */}
                <div>
                  <h4 className="font-medium mb-3">With Error</h4>
                  <InputPhoneNumber
                    label="Contact Number"
                    placeholder="Enter contact number"
                    error="Please enter a valid phone number"
                    required
                  />
                </div>

                {/* Disabled Example */}
                <div>
                  <h4 className="font-medium mb-3">Disabled State</h4>
                  <InputPhoneNumber
                    label="Verified Phone"
                    value="+15551234567"
                    disabled
                    description="This number has been verified"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
                <CardDescription>
                  Built with modern web standards and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">International Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatic formatting for phone numbers from all countries with flag indicators
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">Real-time Validation</h4>
                      <p className="text-sm text-muted-foreground">
                        Instant feedback with visual indicators for valid and invalid inputs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">Accessibility First</h4>
                      <p className="text-sm text-muted-foreground">
                        Built with ARIA labels, keyboard navigation, and screen reader support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">Customizable Styling</h4>
                      <p className="text-sm text-muted-foreground">
                        Consistent with your design system using Tailwind CSS and CSS variables
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">Form Integration</h4>
                      <p className="text-sm text-muted-foreground">
                        Works seamlessly with React Hook Form, Server Actions, and form libraries
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium">TypeScript Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Fully typed with comprehensive prop interfaces and JSDoc documentation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-muted-foreground">
            Start with our production-ready boilerplate and focus on what matters most - your unique features.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Get Started Today
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
    </OnboardingGuard>
  )
}
