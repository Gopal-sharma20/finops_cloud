// Internationalization utilities for CloudOptima

export type Locale = "en" | "es" | "fr" | "de" | "pt" | "ja" | "zh" | "ko"

export interface Translation {
  [key: string]: string | Translation
}

// Default locale
export const DEFAULT_LOCALE: Locale = "en"

// Supported locales
export const SUPPORTED_LOCALES: Locale[] = ["en", "es", "fr", "de", "pt", "ja", "zh", "ko"]

// Locale display names
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ja: "日本語",
  zh: "中文",
  ko: "한국어"
}

// Locale flags/icons
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  pt: "🇵🇹",
  ja: "🇯🇵",
  zh: "🇨🇳",
  ko: "🇰🇷"
}

// RTL languages
export const RTL_LOCALES: Locale[] = []

// Currency mappings for locales
export const LOCALE_CURRENCIES: Record<Locale, string> = {
  en: "USD",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  pt: "EUR",
  ja: "JPY",
  zh: "CNY",
  ko: "KRW"
}

// Date format mappings
export const LOCALE_DATE_FORMATS: Record<Locale, string> = {
  en: "MM/DD/YYYY",
  es: "DD/MM/YYYY",
  fr: "DD/MM/YYYY",
  de: "DD.MM.YYYY",
  pt: "DD/MM/YYYY",
  ja: "YYYY/MM/DD",
  zh: "YYYY/MM/DD",
  ko: "YYYY.MM.DD"
}

// Number format mappings - locale strings for Intl.NumberFormat
export const LOCALE_NUMBER_FORMATS: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-PT",
  ja: "ja-JP",
  zh: "zh-CN",
  ko: "ko-KR"
}

// Utility functions
export const isValidLocale = (locale: string): locale is Locale => {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

export const isRTL = (locale: Locale): boolean => {
  return RTL_LOCALES.includes(locale)
}

export const getDefaultCurrency = (locale: Locale): string => {
  return LOCALE_CURRENCIES[locale] || "USD"
}

export const getDefaultDateFormat = (locale: Locale): string => {
  return LOCALE_DATE_FORMATS[locale] || "MM/DD/YYYY"
}

// Translation key utilities
export const getNestedTranslation = (
  translations: Translation,
  key: string,
  fallback?: string
): string => {
  const keys = key.split(".")
  let current: any = translations

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k]
    } else {
      return fallback || key
    }
  }

  return typeof current === "string" ? current : fallback || key
}

// Interpolation for dynamic values
export const interpolate = (
  template: string,
  values: Record<string, string | number>
): string => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}

// Format numbers according to locale
export const formatNumber = (
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string => {
  const localeString = LOCALE_NUMBER_FORMATS[locale]
  return new Intl.NumberFormat(localeString, options).format(value)
}

// Format currency according to locale
export const formatCurrencyForLocale = (
  value: number,
  locale: Locale,
  currency?: string
): string => {
  const currencyCode = currency || getDefaultCurrency(locale)
  const localeString = LOCALE_NUMBER_FORMATS[locale]

  return new Intl.NumberFormat(localeString, {
    style: "currency",
    currency: currencyCode
  }).format(value)
}

// Format dates according to locale
export const formatDateForLocale = (
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string => {
  const localeString = LOCALE_NUMBER_FORMATS[locale]
  return new Intl.DateTimeFormat(localeString, options).format(date)
}

// Relative time formatting
export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale
): string => {
  const localeString = LOCALE_NUMBER_FORMATS[locale]
  const rtf = new Intl.RelativeTimeFormat(localeString, {
    numeric: "auto"
  })
  return rtf.format(value, unit)
}

// Browser locale detection
export const detectBrowserLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE

  const browserLangs = navigator.languages || [navigator.language]

  for (const lang of browserLangs) {
    const locale = lang.split("-")[0].toLowerCase()
    if (isValidLocale(locale)) {
      return locale
    }
  }

  return DEFAULT_LOCALE
}

// Locale persistence
export const saveLocale = (locale: Locale): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cloudoptima-locale", locale)
  }
}

export const loadLocale = (): Locale => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cloudoptima-locale")
    if (saved && isValidLocale(saved)) {
      return saved
    }
  }
  return detectBrowserLocale()
}