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

      // Store AWS profile name if connected
      if (data.connectedProviders.includes('aws') && data.credentials.aws) {
        const awsProfileName = data.credentials.aws.profileName || 'default'
        localStorage.setItem('cloudoptima-aws-profile', awsProfileName)
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to AWS dashboard if AWS is connected, otherwise role dashboard
      if (data.connectedProviders.includes('aws')) {
        router.push('/clouds/aws')
      } else {
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