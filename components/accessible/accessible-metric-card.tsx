"use client"

import React, { useId } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Target, Zap, Eye } from "lucide-react"
import { ScreenReaderOnly, Status } from "@/components/accessibility/screen-reader"
import { FocusRing } from "@/components/accessibility/focus-management"
import { useTranslation } from "@/components/i18n/translation-provider"
import { cn, formatCurrency, formatPercentage, getTrendColor } from "@/lib/utils"

interface Change {
  value: number
  period: string
  trend: "up" | "down" | "neutral"
  isPositive?: boolean
}

interface AccessibleMetricCardProps {
  title: string
  value: number | string
  currency?: string
  change?: Change
  target?: number
  forecast?: number
  confidence?: number
  size?: "sm" | "md" | "lg"
  loading?: boolean
  clickable?: boolean
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
  // Accessibility props
  ariaLabel?: string
  ariaDescription?: string
  role?: string
  tabIndex?: number
}

const ConfidenceBadge: React.FC<{
  confidence: number
  size: "sm" | "md"
}> = ({ confidence, size }) => {
  const { t } = useTranslation()
  const confidenceId = useId()

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return "bg-financial-profit-100 text-financial-profit-800"
    if (conf >= 70) return "bg-financial-warning-100 text-financial-warning-800"
    return "bg-financial-loss-100 text-financial-loss-800"
  }

  const getConfidenceLevel = (conf: number) => {
    if (conf >= 90) return t("metrics.highConfidence", { default: "High confidence" })
    if (conf >= 70) return t("metrics.mediumConfidence", { default: "Medium confidence" })
    return t("metrics.lowConfidence", { default: "Low confidence" })
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm",
        getConfidenceColor(confidence)
      )}
      role="status"
      aria-labelledby={confidenceId}
      aria-describedby={`${confidenceId}-description`}
    >
      <Zap className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} aria-hidden="true" />
      <span id={confidenceId}>{confidence}%</span>
      <ScreenReaderOnly id={`${confidenceId}-description`}>
        {getConfidenceLevel(confidence)} - {confidence} percent confidence score
      </ScreenReaderOnly>
    </div>
  )
}

const TrendIndicator: React.FC<{
  trend: "up" | "down" | "neutral"
  value: number
  period: string
  isPositive?: boolean
}> = ({ trend, value, period, isPositive = true }) => {
  const { t } = useTranslation()
  const trendId = useId()
  const color = getTrendColor(trend, isPositive)

  const getIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4" aria-hidden="true" />
      case "down": return <TrendingDown className="h-4 w-4" aria-hidden="true" />
      default: return <Minus className="h-4 w-4" aria-hidden="true" />
    }
  }

  const getTrendDescription = () => {
    const direction = trend === "up" ? "increased" : trend === "down" ? "decreased" : "remained stable"
    const sentiment = isPositive
      ? (trend === "up" ? "positive" : "negative")
      : (trend === "up" ? "negative" : "positive")

    return `${direction} by ${formatPercentage(value)} compared to ${period}, which is a ${sentiment} change`
  }

  return (
    <div
      className="flex items-center space-x-1"
      style={{ color }}
      role="status"
      aria-labelledby={trendId}
      aria-describedby={`${trendId}-description`}
    >
      {getIcon()}
      <span className="font-medium font-financial" id={trendId}>
        {formatPercentage(value)}
      </span>
      <ScreenReaderOnly id={`${trendId}-description`}>
        {getTrendDescription()}
      </ScreenReaderOnly>
    </div>
  )
}

const ProgressToTarget: React.FC<{
  current: number
  target: number
  size: "sm" | "md" | "lg"
}> = ({ current, target, size }) => {
  const { t } = useTranslation()
  const progressId = useId()
  const percentage = Math.min((current / target) * 100, 100)
  const isOnTrack = percentage >= 80

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {t("metrics.progressToTarget")}
        </span>
        <span className="text-xs font-medium" id={`${progressId}-value`}>
          {formatPercentage(percentage, 0)}
        </span>
      </div>

      <div
        className="w-full bg-muted rounded-full h-2"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-labelledby={`${progressId}-value`}
        aria-describedby={`${progressId}-description`}
      >
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            isOnTrack ? "bg-financial-profit-500" : "bg-financial-warning-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center text-xs">
        <Target className="h-3 w-3 mr-1 text-muted-foreground" aria-hidden="true" />
        <span className="text-muted-foreground">
          {t("metrics.target")}: {formatCurrency(target)}
        </span>
      </div>

      <ScreenReaderOnly id={`${progressId}-description`}>
        Progress towards target of {formatCurrency(target)} is {formatPercentage(percentage, 0)}.
        {isOnTrack ? " You are on track to meet your target." : " You may need to take action to meet your target."}
      </ScreenReaderOnly>
    </div>
  )
}

const LoadingOverlay: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div
      className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">
          {t("common.loading")}
        </span>
      </div>
      <ScreenReaderOnly>
        Loading metric data. Please wait.
      </ScreenReaderOnly>
    </div>
  )
}

const AccessibleMetricCard: React.FC<AccessibleMetricCardProps> = ({
  title,
  value,
  currency = "USD",
  change,
  target,
  forecast,
  confidence,
  size = "md",
  loading,
  clickable,
  icon,
  className,
  onClick,
  ariaLabel,
  ariaDescription,
  role = "article",
  tabIndex
}) => {
  const { t } = useTranslation()
  const cardId = useId()
  const isClickable = clickable || !!onClick

  // Generate accessible label if not provided
  const accessibleLabel = ariaLabel || `${title}: ${
    typeof value === "number" ? formatCurrency(value, currency) : value
  }`

  // Generate accessible description
  const accessibleDescription = ariaDescription || [
    change && `Changed by ${formatPercentage(change.value)} ${change.trend} compared to ${change.period}`,
    target && `Target is ${formatCurrency(target)}`,
    forecast && `Forecast is ${formatCurrency(forecast)}`,
    confidence && `Confidence level is ${confidence} percent`
  ].filter(Boolean).join(". ")

  return (
    <FocusRing>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          isClickable && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
          size === "sm" && "p-4",
          size === "lg" && "p-8",
          className
        )}
        onClick={onClick}
        role={role}
        aria-label={accessibleLabel}
        aria-describedby={accessibleDescription ? `${cardId}-description` : undefined}
        tabIndex={isClickable ? tabIndex || 0 : undefined}
        onKeyDown={isClickable ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick?.()
          }
        } : undefined}
      >
        {loading && <LoadingOverlay />}

        <CardHeader className={cn(
          "pb-2",
          size === "sm" && "p-0 pb-2",
          size === "lg" && "pb-4"
        )}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              {icon && (
                <div className="p-2 bg-primary/10 rounded-lg" aria-hidden="true">
                  {icon}
                </div>
              )}
              <h3 className={cn(
                "font-medium text-muted-foreground",
                size === "sm" && "text-xs",
                size === "md" && "text-sm",
                size === "lg" && "text-base"
              )}>
                {title}
              </h3>
            </div>

            {confidence && (
              <ConfidenceBadge
                confidence={confidence}
                size={size === "lg" ? "md" : "sm"}
              />
            )}
          </div>
        </CardHeader>

        <CardContent className={cn(
          "space-y-3",
          size === "sm" && "p-0 space-y-2",
          size === "lg" && "space-y-4"
        )}>
          {/* Main Value */}
          <div className={cn(
            "font-semibold font-financial tracking-tight",
            size === "sm" && "text-lg",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl"
          )}>
            {typeof value === "number" ? formatCurrency(value, currency) : value}
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="flex items-center justify-between">
              <TrendIndicator
                trend={change.trend}
                value={change.value}
                period={change.period}
                isPositive={change.isPositive}
              />
              <span className="text-xs text-muted-foreground">
                {t("metrics.vs")} {change.period}
              </span>
            </div>
          )}

          {/* Target Progress */}
          {target && (
            <ProgressToTarget
              current={typeof value === "number" ? value : 0}
              target={target}
              size={size}
            />
          )}

          {/* Forecast */}
          {forecast && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span className="text-xs text-muted-foreground">
                {t("metrics.forecast")}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium font-financial">
                  {formatCurrency(forecast, currency)}
                </span>
                {confidence && (
                  <span className="text-xs text-muted-foreground">
                    ({confidence}% {t("metrics.confidence")})
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        {/* Action Button */}
        {isClickable && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" tabIndex={-1}>
              <Eye className="h-4 w-4 mr-1" aria-hidden="true" />
              {t("common.view")} Details
            </Button>
          </div>
        )}

        {/* Interactive Hover State */}
        {isClickable && (
          <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />
        )}

        {/* Hidden description for screen readers */}
        {accessibleDescription && (
          <ScreenReaderOnly id={`${cardId}-description`}>
            {accessibleDescription}
          </ScreenReaderOnly>
        )}

        {/* Live region for status updates */}
        {loading && (
          <Status>
            {t("common.loading")} {title} data
          </Status>
        )}
      </Card>
    </FocusRing>
  )
}

export { AccessibleMetricCard }