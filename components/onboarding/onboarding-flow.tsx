"use client"

import React, { useState, useCallback } from "react"
import { StepIndicator, type Step } from "./step-indicator"
import { RoleSelector } from "./role-selector"
import { CloudConnector } from "./cloud-connector"
import { PreferencesSetup, type PreferencesData } from "./preferences-setup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Rocket,
  AlertTriangle,
  Loader2,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => Promise<void>
  className?: string
}

interface OnboardingData {
  selectedRole: string
  connectedProviders: string[]
  preferences: PreferencesData
  credentials: Record<string, Record<string, string>>
}

const onboardingSteps: Step[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Get started with CloudOptima"
  },
  {
    id: "role",
    title: "Select Role",
    description: "Choose your primary role"
  },
  {
    id: "providers",
    title: "Connect Providers",
    description: "Link your cloud accounts"
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Customize your experience"
  },
  {
    id: "complete",
    title: "Complete",
    description: "You're all set!"
  }
]

const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="text-center space-y-8 py-8">
    <div className="space-y-4">
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-financial-profit-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">✓</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome to CloudOptima
        </h1>
        <p className="text-xl text-muted-foreground">
          Your Multi-Cloud FinOps Platform
        </p>
      </div>
    </div>

    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-lg text-muted-foreground leading-relaxed">
        CloudOptima helps you optimize cloud costs across AWS, Azure, and Google Cloud Platform
        with intelligent insights, automated recommendations, and executive-level reporting.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
          <div className="w-12 h-12 bg-provider-aws rounded-lg flex items-center justify-center text-white font-bold mb-3">
            AWS
          </div>
          <h3 className="font-semibold mb-2">Multi-Cloud Support</h3>
          <p className="text-sm text-muted-foreground">
            Connect and monitor AWS, Azure, and GCP from a single dashboard
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
          <div className="w-12 h-12 bg-financial-profit-600 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Cost Optimization</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered recommendations to reduce costs by up to 30%
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2">Executive Insights</h3>
          <p className="text-sm text-muted-foreground">
            Board-ready reports and strategic financial insights
          </p>
        </div>
      </div>
    </div>

    <Button onClick={onNext} size="lg" className="px-8">
      Get Started
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  </div>
)

const CompletionStep: React.FC<{
  data: OnboardingData
  onComplete: () => void
}> = ({ data, onComplete }) => (
  <div className="text-center space-y-8 py-8">
    <div className="space-y-4">
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-financial-profit-500 to-financial-profit-600 rounded-2xl flex items-center justify-center">
        <CheckCircle className="h-12 w-12 text-white" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">You're All Set!</h2>
        <p className="text-lg text-muted-foreground">
          Your CloudOptima account has been configured successfully
        </p>
      </div>
    </div>

    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Setup Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Selected Role</span>
            <span className="font-medium capitalize">{data.selectedRole}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Connected Providers</span>
            <span className="font-medium">{data.connectedProviders.length || 'None'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Notifications</span>
            <span className="font-medium">
              {data.preferences.notifications.email ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium">{data.preferences.display.currency}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="space-y-4">
      <h3 className="text-xl font-semibold">What's Next?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <div className="p-4 bg-muted/50 rounded-lg text-left">
          <h4 className="font-medium mb-2">Explore Your Dashboard</h4>
          <p className="text-sm text-muted-foreground">
            Start with your personalized {data.selectedRole} dashboard
          </p>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg text-left">
          <h4 className="font-medium mb-2">Connect More Providers</h4>
          <p className="text-sm text-muted-foreground">
            Add additional cloud accounts for comprehensive monitoring
          </p>
        </div>
      </div>
    </div>

    <Button onClick={onComplete} size="lg" className="px-8">
      <Rocket className="mr-2 h-4 w-4" />
      Launch Dashboard
    </Button>
  </div>
)

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedRole: "",
    connectedProviders: [],
    preferences: {
      notifications: {
        email: true,
        push: true,
        costAlerts: true,
        weeklyReports: true,
        budgetWarnings: true,
        anomalyDetection: true
      },
      display: {
        theme: "system",
        currency: "USD",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        compactView: false
      },
      alerts: {
        budgetThreshold: 80,
        anomalyThreshold: 20,
        reportFrequency: "weekly",
        costIncreaseAlert: 15
      },
      privacy: {
        shareUsageData: false,
        enableAnalytics: true,
        allowMarketingEmails: false
      }
    },
    credentials: {}
  })

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleRoleSelect = useCallback((roleId: string) => {
    setOnboardingData(prev => ({
      ...prev,
      selectedRole: roleId
    }))
  }, [])

  const handleProviderConnect = useCallback(async (providerId: string, credentials: Record<string, string>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setOnboardingData(prev => ({
        ...prev,
        connectedProviders: [...prev.connectedProviders, providerId],
        credentials: {
          ...prev.credentials,
          [providerId]: credentials
        }
      }))
    } catch (err) {
      throw new Error("Failed to connect provider. Please check your credentials.")
    }
  }, [])

  const handlePreferencesSave = useCallback(async (preferences: PreferencesData) => {
    setOnboardingData(prev => ({
      ...prev,
      preferences
    }))
  }, [])

  const handleComplete = async () => {
    setLoading(true)
    try {
      await onComplete(onboardingData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete onboarding")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Role selection
        return onboardingData.selectedRole !== ""
      case 2: // Provider connection
        return true // Optional step
      case 3: // Preferences
        return true // Has defaults
      default:
        return true
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />
      case 1:
        return (
          <RoleSelector
            onRoleSelect={handleRoleSelect}
            selectedRole={onboardingData.selectedRole}
          />
        )
      case 2:
        return (
          <CloudConnector
            onConnect={handleProviderConnect}
            connectedProviders={onboardingData.connectedProviders}
          />
        )
      case 3:
        return (
          <PreferencesSetup
            onSave={handlePreferencesSave}
            initialData={onboardingData.preferences}
          />
        )
      case 4:
        return (
          <CompletionStep
            data={onboardingData}
            onComplete={handleComplete}
          />
        )
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-background to-muted/20", className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {currentStep > 0 && currentStep < onboardingSteps.length - 1 && (
          <div className="mb-8">
            <StepIndicator
              steps={onboardingSteps}
              currentStep={currentStep}
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < onboardingSteps.length - 1 && (
          <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {onboardingSteps.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { OnboardingFlow, type OnboardingData }