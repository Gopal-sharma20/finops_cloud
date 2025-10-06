"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

// Focus trap for modals and dialogs
const FocusTrap: React.FC<{
  children: React.ReactNode
  active?: boolean
  className?: string
}> = ({ children, active = true, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [active])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Auto-focus component
const AutoFocus: React.FC<{
  children: React.ReactNode
  delay?: number
  className?: string
}> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        const focusableElement = ref.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement

        if (focusableElement) {
          focusableElement.focus()
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// Focus ring styles
const focusRingStyles = {
  default: "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  inset: "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
  none: "focus:outline-none",
  custom: "focus:outline-none focus:ring-2"
}

const FocusRing: React.FC<{
  children: React.ReactNode
  variant?: keyof typeof focusRingStyles
  color?: string
  className?: string
}> = ({
  children,
  variant = "default",
  color,
  className
}) => {
  const focusClasses = color
    ? `${focusRingStyles.custom} focus:ring-${color}`
    : focusRingStyles[variant]

  return (
    <div className={cn(focusClasses, className)}>
      {children}
    </div>
  )
}

// Skip to content component
const SkipToContent: React.FC<{
  targetId: string
  label?: string
  className?: string
}> = ({
  targetId,
  label = "Skip to main content",
  className
}) => {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      {label}
    </a>
  )
}

// Focus management hook
const useFocusManagement = () => {
  const focusedBeforeRef = useRef<HTMLElement | null>(null)

  const captureFocus = () => {
    focusedBeforeRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (focusedBeforeRef.current) {
      focusedBeforeRef.current.focus()
    }
  }

  const focusElement = (element: HTMLElement | null) => {
    if (element) {
      element.focus()
    }
  }

  const focusById = (id: string) => {
    const element = document.getElementById(id)
    focusElement(element)
  }

  const focusFirstIn = (container: HTMLElement) => {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    focusElement(focusable)
  }

  return {
    captureFocus,
    restoreFocus,
    focusElement,
    focusById,
    focusFirstIn
  }
}

export {
  FocusTrap,
  AutoFocus,
  FocusRing,
  SkipToContent,
  useFocusManagement,
  focusRingStyles
}