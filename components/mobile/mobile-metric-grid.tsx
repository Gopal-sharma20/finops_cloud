"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn, formatCurrency, formatPercentage, getTrendColor } from "@/lib/utils"

interface MobileMetric {
  title: string
  value: number | string
  currency?: string
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
    period: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
  color?: string
}

interface MobileMetricGridProps {
  metrics: MobileMetric[]
  columns?: 1 | 2
  className?: string
}

const TrendIndicator: React.FC<{
  trend: "up" | "down" | "neutral"
  value: number
  isPositive?: boolean
  size?: "sm" | "md"
}> = ({ trend, value, isPositive = true, size = "sm" }) => {
  const color = getTrendColor(trend, isPositive)
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  const getIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className={iconSize} />
      case "down": return <TrendingDown className={iconSize} />
      default: return <Minus className={iconSize} />
    }
  }

  return (
    <div className="flex items-center space-x-1" style={{ color }}>
      {getIcon()}
      <span className={cn("font-medium font-financial", size === "sm" ? "text-xs" : "text-sm")}>
        {formatPercentage(value)}
      </span>
    </div>
  )
}

const MobileMetricCard: React.FC<{
  metric: MobileMetric
  compact?: boolean
}> = ({ metric, compact = false }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className={cn("p-3", compact && "p-2")}>
        <div className="flex items-center justify-between space-x-2">
          {/* Icon and Title */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {metric.icon && (
              <div className={cn(
                "flex-shrink-0 p-1.5 rounded-lg",
                metric.color ? `bg-${metric.color}/10` : "bg-primary/10"
              )}>
                <div className={metric.color ? `text-${metric.color}` : "text-primary"}>
                  {metric.icon}
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-medium text-muted-foreground truncate",
                compact ? "text-xs" : "text-sm"
              )}>
                {metric.title}
              </h3>
            </div>
          </div>

          {/* Change Indicator */}
          {metric.change && (
            <div className="flex-shrink-0">
              <TrendIndicator
                trend={metric.change.trend}
                value={metric.change.value}
                isPositive={metric.change.isPositive}
                size={compact ? "sm" : "md"}
              />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mt-2">
          <div className={cn(
            "font-semibold font-financial tracking-tight",
            compact ? "text-lg" : "text-xl"
          )}>
            {typeof metric.value === "number"
              ? formatCurrency(metric.value, metric.currency)
              : metric.value}
          </div>
          {metric.change && (
            <div className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
              vs {metric.change.period}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const MobileMetricGrid: React.FC<MobileMetricGridProps> = ({
  metrics,
  columns = 2,
  className
}) => {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
      className
    )}>
      {metrics.map((metric, index) => (
        <MobileMetricCard key={index} metric={metric} compact={columns === 2} />
      ))}
    </div>
  )
}

// Compact version for small screens
const MobileMetricList: React.FC<{
  metrics: MobileMetric[]
  className?: string
}> = ({ metrics, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center space-x-3">
            {metric.icon && (
              <div className={cn(
                "p-2 rounded-lg",
                metric.color ? `bg-${metric.color}/10` : "bg-primary/10"
              )}>
                <div className={metric.color ? `text-${metric.color}` : "text-primary"}>
                  {metric.icon}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </h3>
              <div className="text-lg font-semibold font-financial tracking-tight">
                {typeof metric.value === "number"
                  ? formatCurrency(metric.value, metric.currency)
                  : metric.value}
              </div>
            </div>
          </div>

          {metric.change && (
            <div className="text-right">
              <TrendIndicator
                trend={metric.change.trend}
                value={metric.change.value}
                isPositive={metric.change.isPositive}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {metric.change.period}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Responsive component that switches layout based on screen size
const ResponsiveMetricDisplay: React.FC<{
  metrics: MobileMetric[]
  className?: string
}> = ({ metrics, className }) => {
  return (
    <div className={className}>
      {/* Mobile: List view */}
      <div className="block sm:hidden">
        <MobileMetricList metrics={metrics} />
      </div>

      {/* Tablet and up: Grid view */}
      <div className="hidden sm:block">
        <MobileMetricGrid metrics={metrics} columns={2} />
      </div>
    </div>
  )
}

export {
  MobileMetricGrid,
  MobileMetricList,
  ResponsiveMetricDisplay,
  type MobileMetric
}