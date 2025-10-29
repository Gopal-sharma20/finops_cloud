"use client"

import React from "react"
import { cn } from "@/lib/utils"

// Screen reader only text
const ScreenReaderOnly: React.FC<{
  children: React.ReactNode
  className?: string
  id?: string
}> = ({ children, className, id }) => {
  return (
    <span className={cn("sr-only", className)} id={id}>
      {children}
    </span>
  )
}

// Announce changes to screen readers
const LiveRegion: React.FC<{
  children: React.ReactNode
  politeness?: "polite" | "assertive" | "off"
  atomic?: boolean
  relevant?: "additions" | "removals" | "text" | "all"
  className?: string
}> = ({
  children,
  politeness = "polite",
  atomic = false,
  relevant = "additions",
  className
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Status announcements
const Status: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Alert announcements
const Alert: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

// Progress announcements
const Progress: React.FC<{
  value: number
  max: number
  label: string
  description?: string
  className?: string
}> = ({ value, max, label, description, className }) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${percentage}% complete`}
        aria-label={label}
        aria-describedby={description ? `${label}-description` : undefined}
      >
        <ScreenReaderOnly>
          {label}: {percentage}% complete
        </ScreenReaderOnly>
      </div>
      {description && (
        <ScreenReaderOnly id={`${label}-description`}>
          {description}
        </ScreenReaderOnly>
      )}
    </div>
  )
}

// Loading announcements
const Loading: React.FC<{
  label?: string
  description?: string
  className?: string
}> = ({
  label = "Loading",
  description = "Please wait while content loads",
  className
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={className}
    >
      <ScreenReaderOnly>
        {label}. {description}
      </ScreenReaderOnly>
    </div>
  )
}

export {
  ScreenReaderOnly,
  LiveRegion,
  Status,
  Alert,
  Progress,
  Loading
}
