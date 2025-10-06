"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { OnboardingFlow, type OnboardingData } from "@/components/onboarding/onboarding-flow"

export default function OnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      // Store onboarding data (in a real app, this would be an API call)
      localStorage.setItem('cloudoptima-onboarding', JSON.stringify(data))
      localStorage.setItem('cloudoptima-user-role', data.selectedRole)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to appropriate dashboard based on selected role
      const dashboardRoute = `/dashboard/${data.selectedRole}`
      router.push(dashboardRoute)
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      throw error
    }
  }

  return (
    <OnboardingFlow onComplete={handleOnboardingComplete} />
  )
}