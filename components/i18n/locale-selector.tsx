"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Globe, Check, ChevronDown } from "lucide-react"
import {
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  LOCALE_FLAGS,
  type Locale
} from "@/lib/i18n"
import { useTranslation } from "./translation-provider"
import { cn } from "@/lib/utils"

interface LocaleSelectorProps {
  variant?: "button" | "compact" | "minimal"
  showFlag?: boolean
  showName?: boolean
  className?: string
}

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  variant = "button",
  showFlag = true,
  showName = true,
  className
}) => {
  const { locale, setLocale, t, isLoading } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setIsOpen(false)
  }

  if (variant === "minimal") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", className)}>
            {showFlag ? (
              <span className="text-sm">{LOCALE_FLAGS[locale]}</span>
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          {SUPPORTED_LOCALES.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{LOCALE_FLAGS[loc]}</span>
                <span>{LOCALE_NAMES[loc]}</span>
              </div>
              {locale === loc && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === "compact") {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("flex items-center space-x-1", className)}
            disabled={isLoading}
          >
            {showFlag && <span className="text-sm">{LOCALE_FLAGS[locale]}</span>}
            <span className="text-xs font-medium uppercase">{locale}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[200px]">
          {SUPPORTED_LOCALES.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{LOCALE_FLAGS[loc]}</span>
                <span>{LOCALE_NAMES[loc]}</span>
              </div>
              {locale === loc && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default button variant
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn("flex items-center space-x-2", className)}
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          {showFlag && <span className="text-sm">{LOCALE_FLAGS[locale]}</span>}
          {showName && <span>{LOCALE_NAMES[locale]}</span>}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
          {t("common.selectLanguage", { default: "Select Language" })}
        </div>
        {SUPPORTED_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm">{LOCALE_FLAGS[loc]}</span>
              <div>
                <div className="font-medium">{LOCALE_NAMES[loc]}</div>
                <div className="text-xs text-muted-foreground uppercase">{loc}</div>
              </div>
            </div>
            {locale === loc && (
              <Badge variant="secondary" className="text-xs">
                {t("common.active", { default: "Active" })}
              </Badge>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact language switcher for mobile
export const MobileLocaleSelector: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <LocaleSelector
      variant="compact"
      showFlag={true}
      showName={false}
      className={className}
    />
  )
}

// Simple flag-only selector
export const FlagLocaleSelector: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <LocaleSelector
      variant="minimal"
      showFlag={true}
      showName={false}
      className={className}
    />
  )
}