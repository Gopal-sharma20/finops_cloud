"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface SkipLinksProps {
  links?: Array<{
    href: string
    label: string
  }>
  className?: string
}

const defaultLinks = [
  { href: "#main-content", label: "Skip to main content" },
  { href: "#navigation", label: "Skip to navigation" },
  { href: "#search", label: "Skip to search" }
]

const SkipLinks: React.FC<SkipLinksProps> = ({
  links = defaultLinks,
  className
}) => {
  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <div className="fixed top-0 left-0 z-50 bg-primary text-primary-foreground p-2 rounded-br-lg">
        <nav aria-label="Skip navigation links">
          <ul className="flex flex-col space-y-1">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium rounded hover:bg-primary-foreground hover:text-primary focus:bg-primary-foreground focus:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export { SkipLinks }