"use client"

import React from "react"
import { ResponsiveHeader } from "./responsive-header"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  userRole: "cfo" | "devops" | "cto"
  userName?: string
  userEmail?: string
  userAvatar?: string
  notifications?: number
  onLogout?: () => void
  children: React.ReactNode
  className?: string
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  userRole,
  userName,
  userEmail,
  userAvatar,
  notifications,
  onLogout,
  children,
  className
}) => {
  return (
    <div className="min-h-screen bg-background">
      <ResponsiveHeader
        userRole={userRole}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        notifications={notifications}
        onLogout={onLogout}
      />

      <main className={cn(
        "container mx-auto px-4 py-6",
        "sm:px-6 lg:px-8",
        className
      )}>
        {children}
      </main>
    </div>
  )
}

// Mobile-optimized container for dashboard content
const MobileDashboardContainer: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "space-y-4",
      "sm:space-y-6 lg:space-y-8",
      className
    )}>
      {children}
    </div>
  )
}

// Responsive grid for dashboard cards
const ResponsiveDashboardGrid: React.FC<{
  children: React.ReactNode
  columns?: "auto" | 1 | 2 | 3 | 4
  className?: string
}> = ({ children, columns = "auto", className }) => {
  const getGridClass = () => {
    if (columns === "auto") {
      return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
    }
    return cn(
      "grid gap-4 sm:gap-6",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    )
  }

  return (
    <div className={cn(getGridClass(), className)}>
      {children}
    </div>
  )
}

// Two-column layout for larger content
const ResponsiveTwoColumnLayout: React.FC<{
  leftColumn: React.ReactNode
  rightColumn: React.ReactNode
  leftSpan?: 1 | 2 | 3
  rightSpan?: 1 | 2 | 3
  className?: string
}> = ({ leftColumn, rightColumn, leftSpan = 2, rightSpan = 1, className }) => {
  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      "grid-cols-1 lg:grid-cols-3",
      className
    )}>
      <div className={cn(
        leftSpan === 1 && "lg:col-span-1",
        leftSpan === 2 && "lg:col-span-2",
        leftSpan === 3 && "lg:col-span-3"
      )}>
        {leftColumn}
      </div>
      <div className={cn(
        rightSpan === 1 && "lg:col-span-1",
        rightSpan === 2 && "lg:col-span-2",
        rightSpan === 3 && "lg:col-span-3"
      )}>
        {rightColumn}
      </div>
    </div>
  )
}

// Stack layout for mobile, side-by-side for desktop
const ResponsiveStackLayout: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className={cn(
      "flex flex-col space-y-4",
      "lg:flex-row lg:space-y-0 lg:space-x-6",
      className
    )}>
      {children}
    </div>
  )
}

// Responsive section with optional title and description
const ResponsiveSection: React.FC<{
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  titleClassName?: string
}> = ({ title, description, children, className, titleClassName }) => {
  return (
    <section className={cn("space-y-4 sm:space-y-6", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className={cn(
              "text-xl sm:text-2xl font-semibold tracking-tight",
              titleClassName
            )}>
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Mobile-first card layout with proper spacing
const ResponsiveCardLayout: React.FC<{
  children: React.ReactNode
  padding?: "sm" | "md" | "lg"
  className?: string
}> = ({ children, padding = "md", className }) => {
  const paddingClass = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  }[padding]

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-sm",
      paddingClass,
      className
    )}>
      {children}
    </div>
  )
}

export {
  ResponsiveLayout,
  MobileDashboardContainer,
  ResponsiveDashboardGrid,
  ResponsiveTwoColumnLayout,
  ResponsiveStackLayout,
  ResponsiveSection,
  ResponsiveCardLayout
}