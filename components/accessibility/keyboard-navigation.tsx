"use client"

import React, { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Arrow key navigation for lists
const ArrowKeyNavigation: React.FC<{
  children: React.ReactNode
  orientation?: "horizontal" | "vertical" | "both"
  loop?: boolean
  className?: string
}> = ({
  children,
  orientation = "vertical",
  loop = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const focusableElements = Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]

      if (focusableElements.length === 0) return

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (e.key) {
        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            e.preventDefault()
            nextIndex = currentIndex + 1
            if (nextIndex >= focusableElements.length) {
              nextIndex = loop ? 0 : focusableElements.length - 1
            }
          }
          break
        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            e.preventDefault()
            nextIndex = currentIndex - 1
            if (nextIndex < 0) {
              nextIndex = loop ? focusableElements.length - 1 : 0
            }
          }
          break
        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            e.preventDefault()
            nextIndex = currentIndex + 1
            if (nextIndex >= focusableElements.length) {
              nextIndex = loop ? 0 : focusableElements.length - 1
            }
          }
          break
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            e.preventDefault()
            nextIndex = currentIndex - 1
            if (nextIndex < 0) {
              nextIndex = loop ? focusableElements.length - 1 : 0
            }
          }
          break
        case "Home":
          e.preventDefault()
          nextIndex = 0
          break
        case "End":
          e.preventDefault()
          nextIndex = focusableElements.length - 1
          break
      }

      if (nextIndex !== currentIndex) {
        focusableElements[nextIndex].focus()
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [orientation, loop])

  return (
    <div ref={containerRef} className={className} role="group">
      {children}
    </div>
  )
}

// Tab key navigation
const TabNavigation: React.FC<{
  children: React.ReactNode
  onTabOut?: (direction: "forward" | "backward") => void
  className?: string
}> = ({ children, onTabOut, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const focusableElements = Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey && document.activeElement === firstElement) {
        onTabOut?.("backward")
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        onTabOut?.("forward")
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [onTabOut])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Escape key handler
const EscapeKeyHandler: React.FC<{
  children: React.ReactNode
  onEscape: () => void
  disabled?: boolean
  className?: string
}> = ({ children, onEscape, disabled = false, className }) => {
  useEffect(() => {
    if (disabled) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onEscape()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onEscape, disabled])

  return <div className={className}>{children}</div>
}

// Custom keyboard shortcuts
interface KeyboardShortcut {
  key: string
  modifiers?: {
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
    meta?: boolean
  }
  action: () => void
  description?: string
  disabled?: boolean
}

const KeyboardShortcuts: React.FC<{
  children: React.ReactNode
  shortcuts: KeyboardShortcut[]
  global?: boolean
  className?: string
}> = ({ children, shortcuts, global = false, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        if (shortcut.disabled) return

        const { key, modifiers = {} } = shortcut
        const { ctrl = false, alt = false, shift = false, meta = false } = modifiers

        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          e.ctrlKey === ctrl &&
          e.altKey === alt &&
          e.shiftKey === shift &&
          e.metaKey === meta
        ) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    const target = global ? document : containerRef.current
    if (!target) return

    target.addEventListener("keydown", handleKeyDown)
    return () => target.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, global])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

// Roving tabindex for complex widgets
const RovingTabIndex: React.FC<{
  children: React.ReactNode
  defaultIndex?: number
  onChange?: (index: number) => void
  className?: string
}> = ({ children, defaultIndex = 0, onChange, className }) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateActiveIndex = (newIndex: number) => {
    setActiveIndex(newIndex)
    onChange?.(newIndex)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll('[role="option"], [role="tab"], [role="menuitem"]')
    ) as HTMLElement[]

    focusableElements.forEach((element, index) => {
      element.tabIndex = index === activeIndex ? 0 : -1

      element.addEventListener("focus", () => {
        updateActiveIndex(index)
      })

      element.addEventListener("click", () => {
        updateActiveIndex(index)
      })
    })
  }, [activeIndex])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

export {
  ArrowKeyNavigation,
  TabNavigation,
  EscapeKeyHandler,
  KeyboardShortcuts,
  RovingTabIndex,
  type KeyboardShortcut
}