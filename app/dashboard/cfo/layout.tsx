"use client"

import React from "react"
import { ResponsiveLayout } from "@/components/layout/responsive-layout"

export default function CFOLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ResponsiveLayout
      userRole="cfo"
      userName="Sarah Johnson"
      userEmail="sarah.johnson@company.com"
      notifications={3}
      onLogout={() => {
        // Handle logout
        console.log("Logout clicked")
      }}
    >
      {children}
    </ResponsiveLayout>
  )
}