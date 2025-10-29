"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LocaleSelector } from "@/components/i18n/locale-selector"
import { useTranslation } from "@/components/i18n/translation-provider"
import {
  Sparkles,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  DollarSign,
  TrendingUp,
  CloudCog
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { t } = useTranslation()

  const handleGetStarted = () => {
    router.push("/onboarding")
  }

  const handleSignIn = () => {
    // Check if user has already connected to cloud providers
    if (typeof window !== 'undefined') {
      const onboardingData = localStorage.getItem('cloudoptima-onboarding')
      if (onboardingData) {
        const data = JSON.parse(onboardingData)
        const connectedProviders = data.connectedProviders || []

        // Redirect to appropriate cloud dashboard if connected
        if (connectedProviders.includes('aws')) {
          router.push('/clouds/aws')
          return
        } else if (connectedProviders.includes('azure')) {
          router.push('/clouds/azure')
          return
        } else if (connectedProviders.includes('gcp')) {
          router.push('/clouds/gcp')
          return
        }
      }
    }

    // No providers connected, go to onboarding
    router.push("/onboarding")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">CloudOptima</span>
          </div>

          <div className="flex items-center space-x-4">
            <LocaleSelector variant="compact" />
            <Button variant="ghost" onClick={handleSignIn}>
              {t("navigation.signIn", { default: "Sign In" })}
            </Button>
            <Button onClick={handleGetStarted}>
              {t("onboarding.getStarted")}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <Badge variant="secondary" className="inline-flex items-center space-x-2 px-4 py-2">
            <Sparkles className="h-4 w-4" />
            <span>Now supporting multi-cloud environments</span>
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
              {t("dashboard.welcome")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl">
              <div className="w-12 h-12 bg-provider-aws rounded-xl flex items-center justify-center text-white font-bold mb-4 mx-auto">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Cloud Support</h3>
              <p className="text-sm text-muted-foreground">
                Connect and monitor AWS, Azure, and GCP from a unified dashboard with real-time cost tracking
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-2xl">
              <div className="w-12 h-12 bg-financial-profit-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cost Optimization</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered recommendations to reduce cloud costs by up to 30% with automated insights
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-2xl">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Executive Insights</h3>
              <p className="text-sm text-muted-foreground">
                Board-ready reports and strategic financial insights tailored to your role
              </p>
            </div>
          </div>

          {/* Role-Based Dashboards */}
          <div className="mt-20 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Role-Based Experiences</h2>
              <p className="text-lg text-muted-foreground">
                Tailored dashboards for every stakeholder in your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CFO Card */}
              <div className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-financial-profit-500 to-financial-profit-600 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("roles.cfo.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("roles.cfo.subtitle")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-financial-profit-600" />
                    <span>Executive reporting</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-financial-profit-600" />
                    <span>Budget management</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-financial-profit-600" />
                    <span>ROI analysis</span>
                  </div>
                </div>
              </div>

              {/* DevOps Card */}
              <div className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <CloudCog className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("roles.devops.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("roles.devops.subtitle")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Resource optimization</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Anomaly detection</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Infrastructure monitoring</span>
                  </div>
                </div>
              </div>

              {/* CTO Card */}
              <div className="p-6 bg-card border border-border rounded-xl hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t("roles.cto.title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("roles.cto.subtitle")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span>Architecture modeling</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span>Technology roadmap</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                    <span>Innovation tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 space-y-8">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to optimize your cloud costs?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of organizations already saving millions with CloudOptima's intelligent multi-cloud cost management platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" onClick={handleGetStarted} className="px-8">
                  {t("onboarding.getStarted")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleSignIn}>
                  View Demo Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 CloudOptima. Multi-cloud cost optimization platform.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Enterprise-grade security
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}