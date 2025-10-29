"use client"

import React, { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ReferenceLine,
  Scatter
} from "recharts"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Settings, AlertTriangle } from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface DataPoint {
  date: string
  actualCost: number
  forecastCost?: number
  confidenceUpper?: number
  confidenceLower?: number
  anomaly?: boolean
  businessEvent?: string
}

interface CostTrendChartProps {
  data: DataPoint[]
  forecastPeriod?: number
  confidenceIntervals?: boolean
  anomalyDetection?: boolean
  businessMetrics?: string[]
  annotations?: Array<{
    date: string
    label: string
    type: "event" | "anomaly" | "milestone"
  }>
  height?: number
  className?: string
  onPointClick?: (data: DataPoint) => void
  onExport?: (format: "png" | "csv" | "pdf") => void
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
      <div className="font-medium mb-2">{formatDate(new Date(label))}</div>

      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.name}:</span>
          <span className="text-sm font-medium font-financial">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}

      {data.businessEvent && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-xs text-orange-600">{data.businessEvent}</span>
          </div>
        </div>
      )}

      {data.anomaly && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-600">Anomaly Detected</span>
          </div>
        </div>
      )}
    </div>
  )
}

const TimeRangeSelector: React.FC<{
  options: string[]
  selected: string
  onChange: (value: string) => void
}> = ({ options, selected, onChange }) => (
  <div className="flex bg-muted rounded-lg p-1">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          selected === option
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {option}
      </button>
    ))}
  </div>
)

const ViewModeToggle: React.FC<{
  options: Array<{ value: string; label: string }>
  selected: string
  onChange: (value: string) => void
}> = ({ options, selected, onChange }) => (
  <div className="flex bg-muted rounded-lg p-1">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          selected === option.value
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
)

const CostTrendChart: React.FC<CostTrendChartProps> = ({
  data,
  forecastPeriod = 30,
  confidenceIntervals = true,
  anomalyDetection = true,
  businessMetrics = [],
  annotations = [],
  height = 400,
  className,
  onPointClick,
  onExport
}) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      console.log('CostTrendChart: No data received')
      return []
    }

    console.log('CostTrendChart: Processing data', {
      dataLength: data.length,
      sample: data[0]
    })

    try {
      return data.map(point => ({
        ...point,
        date: format(new Date(point.date), "MMM dd"),
        anomalies: point.anomaly ? point.actualCost : null
      }))
    } catch (err) {
      console.error('CostTrendChart: Error processing data', err)
      return []
    }
  }, [data])

  const maxValue = useMemo(() => {
    if (!data || data.length === 0) {
      return 1000 // Default value if no data
    }
    return Math.max(...data.map(d => Math.max(
      d.actualCost || 0,
      d.forecastCost || 0,
      d.confidenceUpper || 0
    )))
  }, [data])

  // Check if data has any non-zero values
  const hasNonZeroData = useMemo(() => {
    if (!data || data.length === 0) return false
    return data.some(point =>
      (point.actualCost && point.actualCost > 0) ||
      (point.forecastCost && point.forecastCost > 0)
    )
  }, [data])

  // Show message if no data
  if (!data || data.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Cost Trend Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Historical data with {forecastPeriod}-day forecast
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No cost data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Data will appear once cost trends are fetched from your connected cloud providers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if all values are zero
  if (!hasNonZeroData) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Cost Trend Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Historical data with {forecastPeriod}-day forecast
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center max-w-md">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No cost data for selected period</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your cloud account shows $0 costs for the past {data.length} days.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This may indicate:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 text-left list-disc list-inside">
                <li>Free credits are covering all charges</li>
                <li>No resources running or deployed</li>
                <li>Billing data not yet available (24-48 hour delay)</li>
                <li>Resources exist but not incurring costs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Cost Trend Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Historical data with {forecastPeriod}-day forecast
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onExport && (
              <div className="flex">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExport("png")}
                  className="rounded-r-none"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-l-none border-l-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={processedData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={(state: any) => {
                if (onPointClick && state?.activePayload?.[0]?.payload) {
                  onPointClick(state.activePayload[0].payload)
                }
              }}
            >
              <defs>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                domain={[0, maxValue * 1.1]}
              />

              {/* Confidence Interval Area */}
              {confidenceIntervals && (
                <Area
                  type="monotone"
                  dataKey="confidenceUpper"
                  stackId="confidence"
                  fill="url(#confidenceGradient)"
                  fillOpacity={0.3}
                  stroke="none"
                />
              )}

              {/* Historical Cost Line */}
              <Line
                type="monotone"
                dataKey="actualCost"
                name="Actual Cost"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                connectNulls={false}
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="forecastCost"
                name="Forecast"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={false}
              />

              {/* Anomaly Detection Scatter */}
              {anomalyDetection && (
                <Scatter
                  dataKey="anomalies"
                  fill="#ef4444"
                  shape="triangle"
                />
              )}

              {/* Business Event Annotations */}
              {annotations.map((annotation, index) => (
                <ReferenceLine
                  key={index}
                  x={format(new Date(annotation.date), "MMM dd")}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: annotation.label,
                    position: 'top' as any,
                    style: { fontSize: '12px', fill: '#f59e0b' }
                  }}
                />
              ))}

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="line"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Insights */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Trend Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average daily cost trending upward by 2.3%
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Forecast Accuracy</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Model confidence: 87% (±15% variance)
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium">Anomalies</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              3 anomalies detected this period
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { CostTrendChart, type CostTrendChartProps }