"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Heart,
  Zap,
  Target,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

const costData = [
  { date: "Jan 1", cost: 12450, forecast: 12800, savings: 350 },
  { date: "Jan 8", cost: 13200, forecast: 13100, savings: 420 },
  { date: "Jan 15", cost: 12890, forecast: 13400, savings: 510 },
  { date: "Jan 22", cost: 11800, forecast: 13200, savings: 1400 },
  { date: "Jan 29", cost: 12100, forecast: 13000, savings: 900 },
  { date: "Feb 5", cost: 11900, forecast: 12800, savings: 900 },
  { date: "Feb 12", cost: 12300, forecast: 12900, savings: 600 }
]

const serviceData = [
  { name: "Compute", value: 38, cost: 18240, color: "#3B82F6" },
  { name: "Storage", value: 19, cost: 8920, color: "#10B981" },
  { name: "Database", value: 16, cost: 7650, color: "#8B5CF6" },
  { name: "Network", value: 11, cost: 5430, color: "#F59E0B" },
  { name: "Lambda", value: 9, cost: 4210, color: "#EF4444" },
  { name: "Others", value: 7, cost: 3382, color: "#6B7280" }
]

const regionData = [
  { region: "US East", cost: 15420, resources: 324, efficiency: 94 },
  { region: "US West", cost: 12890, resources: 256, efficiency: 89 },
  { region: "Europe", cost: 8920, resources: 198, efficiency: 92 },
  { region: "Asia", cost: 6440, resources: 142, efficiency: 87 },
  { region: "Others", cost: 4162, resources: 89, efficiency: 85 }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-pink-200">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-semibold">${entry.value.toLocaleString('en-US')}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value)
    }, 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <span className="tabular-nums transition-all duration-1000 ease-out">
      {displayValue.toLocaleString('en-US')}{suffix}
    </span>
  )
}

export const LovelyCostChart = () => {
  const [chartType, setChartType] = useState<"trend" | "breakdown" | "regions">("trend")
  const [timeRange, setTimeRange] = useState("7d")

  const renderChart = () => {
    switch (chartType) {
      case "trend":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={costData}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F472B6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#F472B6"
                strokeWidth={3}
                fill="url(#costGradient)"
                dot={{ fill: "#F472B6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#F472B6", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#savingsGradient)"
                dot={{ fill: "#10B981", strokeWidth: 2, r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "breakdown":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-pink-200">
                          <p className="font-medium text-sm">{data.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${data.cost.toLocaleString('en-US')} ({data.value}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {serviceData.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: service.color }}
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      $<AnimatedNumber value={service.cost} />
                    </div>
                    <div className="text-xs text-muted-foreground">{service.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "regions":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
              <XAxis
                dataKey="region"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-pink-200">
                        <p className="font-medium text-sm mb-2">{label}</p>
                        <div className="space-y-1 text-xs">
                          <p>Cost: <span className="font-semibold">${data.cost.toLocaleString('en-US')}</span></p>
                          <p>Resources: <span className="font-semibold">{data.resources}</span></p>
                          <p>Efficiency: <span className="font-semibold">{data.efficiency}%</span></p>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="cost"
                fill="url(#barGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  const getChartIcon = () => {
    switch (chartType) {
      case "trend": return <Activity className="h-4 w-4" />
      case "breakdown": return <PieChartIcon className="h-4 w-4" />
      case "regions": return <BarChart3 className="h-4 w-4" />
    }
  }

  const getChartTitle = () => {
    switch (chartType) {
      case "trend": return "Cost Trends & Savings 📈"
      case "breakdown": return "Service Breakdown 🥧"
      case "regions": return "Regional Analysis 🌍"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getChartIcon()}
            <span>{getChartTitle()}</span>
          </CardTitle>

          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              {["7d", "30d", "90d"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                variant={chartType === "trend" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setChartType("trend")}
              >
                <Activity className="h-3 w-3 mr-1" />
                Trend
              </Button>
              <Button
                variant={chartType === "breakdown" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setChartType("breakdown")}
              >
                <PieChartIcon className="h-3 w-3 mr-1" />
                Services
              </Button>
              <Button
                variant={chartType === "regions" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setChartType("regions")}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Regions
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {chartType === "trend" && (
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-pink-400" />
              <span className="text-muted-foreground">Current Spend:</span>
              <span className="font-semibold">$<AnimatedNumber value={12300} /></span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">8% reduction</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Potential savings:</span>
              <span className="font-semibold text-green-600">$<AnimatedNumber value={600} /></span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {renderChart()}

        {/* Fun insights */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-2 mb-1">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-purple-800">Lovely Insight</span>
          </div>
          <p className="text-xs text-purple-700">
            {chartType === "trend" && "Your cost optimization efforts are paying off! 38% better than last quarter! 🎉"}
            {chartType === "breakdown" && "Compute costs dominate your spend. Consider rightsizing opportunities! 💡"}
            {chartType === "regions" && "US East shows the highest efficiency score. Great job optimizing there! ⭐"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}