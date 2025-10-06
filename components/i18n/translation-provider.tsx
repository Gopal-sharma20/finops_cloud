"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  Locale,
  DEFAULT_LOCALE,
  Translation,
  getNestedTranslation,
  interpolate,
  loadLocale,
  saveLocale,
  isRTL
} from "@/lib/i18n"

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, values?: Record<string, string | number>) => string
  isLoading: boolean
  direction: "ltr" | "rtl"
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export const useTranslation = () => {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

interface TranslationProviderProps {
  children: React.ReactNode
  defaultLocale?: Locale
  translations?: Record<Locale, Translation>
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  defaultLocale = DEFAULT_LOCALE,
  translations = {}
}) => {
  const [locale, setCurrentLocale] = useState<Locale>(defaultLocale)
  const [currentTranslations, setCurrentTranslations] = useState<Translation>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for current locale
  const loadTranslations = async (targetLocale: Locale) => {
    try {
      setIsLoading(true)

      // Check if translations are provided via props
      if (translations[targetLocale]) {
        setCurrentTranslations(translations[targetLocale])
        setIsLoading(false)
        return
      }

      // Dynamic import for translations
      try {
        const translationModule = await import(`@/locales/${targetLocale}.json`)
        setCurrentTranslations(translationModule.default || translationModule)
      } catch (importError) {
        console.warn(`Failed to load translations for ${targetLocale}, using fallback`)

        // Load default locale as fallback
        if (targetLocale !== DEFAULT_LOCALE) {
          try {
            const fallbackModule = await import(`@/locales/${DEFAULT_LOCALE}.json`)
            setCurrentTranslations(fallbackModule.default || fallbackModule)
          } catch (fallbackError) {
            console.warn("Failed to load fallback translations")
            setCurrentTranslations({})
          }
        }
      }
    } catch (error) {
      console.error("Error loading translations:", error)
      setCurrentTranslations({})
    } finally {
      setIsLoading(false)
    }
  }

  // Set locale and persist
  const setLocale = (newLocale: Locale) => {
    setCurrentLocale(newLocale)
    saveLocale(newLocale)
    loadTranslations(newLocale)

    // Update document direction for RTL languages
    if (typeof document !== "undefined") {
      document.documentElement.dir = isRTL(newLocale) ? "rtl" : "ltr"
      document.documentElement.lang = newLocale
    }
  }

  // Translation function
  const t = (key: string, values?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(currentTranslations, key, key)

    if (values) {
      return interpolate(translation, values)
    }

    return translation
  }

  // Initialize locale on mount
  useEffect(() => {
    const savedLocale = loadLocale()
    setLocale(savedLocale)
  }, [])

  const contextValue: TranslationContextType = {
    locale,
    setLocale,
    t,
    isLoading,
    direction: isRTL(locale) ? "rtl" : "ltr"
  }

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  )
}