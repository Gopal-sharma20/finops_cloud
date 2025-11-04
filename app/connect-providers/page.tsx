"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CloudConnector } from "@/components/onboarding/cloud-connector"
import { ArrowLeft, Cloud, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ConnectProvidersPage() {
  const router = useRouter()
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [credentials, setCredentials] = useState<Record<string, Record<string, string>>>({})

  const handleConnect = async (providerId: string, providerCredentials: Record<string, string>) => {
    try {
      console.log(`🔗 Connecting to ${providerId}...`, providerCredentials)

      // Store credentials in state
      setCredentials(prev => ({
        ...prev,
        [providerId]: providerCredentials
      }))

      // Update connected providers
      if (!connectedProviders.includes(providerId)) {
        setConnectedProviders(prev => [...prev, providerId])
      }

      // Update localStorage
      const existingData = localStorage.getItem('cloudoptima-onboarding')
      let onboardingData: any = {}
      
      if (existingData) {
        onboardingData = JSON.parse(existingData)
      }

      onboardingData.credentials = {
        ...onboardingData.credentials,
        [providerId]: providerCredentials
      }

      onboardingData.connectedProviders = connectedProviders.includes(providerId) 
        ? connectedProviders 
        : [...connectedProviders, providerId]

      localStorage.setItem('cloudoptima-onboarding', JSON.stringify(onboardingData))

      // Store cloud provider specific data
      if (providerId === 'aws' && providerCredentials.profileName) {
        localStorage.setItem('cloudoptima-aws-profile', providerCredentials.profileName)
      } else if (providerId === 'azure') {
        localStorage.setItem('cloudoptima-azure-profile', 'default')
      } else if (providerId === 'gcp') {
        localStorage.setItem('cloudoptima-gcp-profile', 'default')
      }

      console.log(`✅ Connected to ${providerId} successfully`)
    } catch (error) {
      console.error(`❌ Failed to connect to ${providerId}:`, error)
      throw error
    }
  }

  const handleContinue = () => {
    if (connectedProviders.length === 0) {
      alert('Please connect at least one cloud provider before continuing.')
      return
    }

    // Redirect to the first connected provider's dashboard
    if (connectedProviders.includes('aws')) {
      router.push('/clouds/aws')
    } else if (connectedProviders.includes('azure')) {
      router.push('/clouds/azure')
    } else if (connectedProviders.includes('gcp')) {
      router.push('/clouds/gcp')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/onboarding')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Cloud className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Connect Cloud Providers</h1>
          </div>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Main Card */}
        <Card className="border-2">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <p className="text-center text-muted-foreground">
              Securely connect your AWS, Azure, or GCP accounts to start monitoring and optimizing your cloud costs
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <CloudConnector
              onConnect={handleConnect}
              connectedProviders={connectedProviders}
            />
          </CardContent>
        </Card>

        {/* Continue Button */}
        {connectedProviders.length > 0 && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continue to Dashboard
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          </div>
        )}

        {/* Connection Status */}
        {connectedProviders.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Cloud className="h-5 w-5" />
                <span className="font-medium">
                  {connectedProviders.length} provider{connectedProviders.length > 1 ? 's' : ''} connected: {' '}
                  {connectedProviders.map(p => p.toUpperCase()).join(', ')}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
