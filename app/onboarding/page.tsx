"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { OnboardingFlow, type OnboardingData } from "@/components/onboarding/onboarding-flow"

export default function OnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Store onboarding data
      localStorage.setItem('cloudoptima-onboarding', JSON.stringify(data))
      localStorage.setItem('cloudoptima-user-role', data.selectedRole)

      // Store cloud provider specific data
      if (data.connectedProviders.includes('aws') && data.credentials.aws) {
        const awsProfileName = data.credentials.aws.profileName || 'default'
        localStorage.setItem('cloudoptima-aws-profile', awsProfileName)
      }

      if (data.connectedProviders.includes('azure') && data.credentials.azure) {
        localStorage.setItem('cloudoptima-azure-profile', 'default')
      }

      if (data.connectedProviders.includes('gcp') && data.credentials.gcp) {
        localStorage.setItem('cloudoptima-gcp-profile', 'default')
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to appropriate cloud dashboard based on connected providers
      if (data.connectedProviders.includes('aws')) {
        router.push('/clouds/aws')
      } else if (data.connectedProviders.includes('azure')) {
        router.push('/clouds/azure')
      } else if (data.connectedProviders.includes('gcp')) {
        router.push('/clouds/gcp')
      } else {
        // No cloud provider connected, go to role dashboard
        const dashboardRoute = `/dashboard/${data.selectedRole}`
        router.push(dashboardRoute)
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      throw error
    }
  }

  return (
    <OnboardingFlow onComplete={handleOnboardingComplete} />
  )
}