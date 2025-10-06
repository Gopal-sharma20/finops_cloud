"use client"

import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, Target, Zap, Eye } from "lucide-react"
import { cn, formatCurrency, formatPercentage, getTrendColor } from "@/lib/utils"

interface Change {
  value: number
  period: string
  trend: "up" | "down" | "neutral"
  isPositive?: boolean
}

interface MetricCardProps {
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
  sparklineData?: number[]
  icon?: React.ReactNode
  className?: string
  onClick?: () => void
}

const ConfidenceBadge: React.FC<{ confidence: number; size: "sm" | "md" }> = ({
  confidence,
  size
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return "bg-financial-profit-100 text-financial-profit-800"
    if (conf >= 70) return "bg-financial-warning-100 text-financial-warning-800"
    return "bg-financial-loss-100 text-financial-loss-800"
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-full font-medium",
      size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm",
      getConfidenceColor(confidence)
    )}>
      <Zap className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {confidence}%
    </div>
  )
}

const TrendIndicator: React.FC<{
  trend: "up" | "down" | "neutral"
  value: number
  isPositive?: boolean
}> = ({ trend, value, isPositive = true }) => {
  const color = getTrendColor(trend, isPositive)

  const getIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4" />
      case "down": return <TrendingDown className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center space-x-1" style={{ color }}>
      {getIcon()}
      <span className="font-medium font-financial">
        {formatPercentage(value)}
      </span>
    </div>
  )
}

const ProgressToTarget: React.FC<{
  current: number
  target: number
  size: "sm" | "md" | "lg"
}> = ({ current, target, size }) => {
  const percentage = Math.min((current / target) * 100, 100)
  const isOnTrack = percentage >= 80

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Progress to target</span>
        <span className="text-xs font-medium">
          {formatPercentage(percentage, 0)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            isOnTrack ? "bg-financial-profit-500" : "bg-financial-warning-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center text-xs">
        <Target className="h-3 w-3 mr-1 text-muted-foreground" />
        <span className="text-muted-foreground">
          Target: {formatCurrency(target)}
        </span>
      </div>
    </div>
  )
}

const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="text-xs text-muted-foreground">Loading...</span>
    </div>
  </div>
)

const MetricCard: React.FC<MetricCardProps> = ({
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
  sparklineData,
  icon,
  className,
  onClick
}) => {
  const isClickable = clickable || !!onClick

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-lg hover:-translate-y-1",
        size === "sm" && "p-4",
        size === "lg" && "p-8",
        className
      )}
      onClick={onClick}
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
              <div className="p-2 bg-primary/10 rounded-lg">
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
              isPositive={change.isPositive}
            />
            <span className="text-xs text-muted-foreground">
              vs {change.period}
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
            <span className="text-xs text-muted-foreground">Forecast</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium font-financial">
                {formatCurrency(forecast, currency)}
              </span>
              {confidence && (
                <span className="text-xs text-muted-foreground">
                  ({confidence}% confidence)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Button */}
      {isClickable && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      )}

      {/* Interactive Hover State */}
      {isClickable && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg" />
      )}
    </Card>
  )
}

export { MetricCard, type MetricCardProps }