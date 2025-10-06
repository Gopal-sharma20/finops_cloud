"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Zap,
  Cloud,
  Target,
  Sparkles,
  Heart,
  Star,
  Award,
  Lightbulb,
  ShoppingCart,
  PiggyBank,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Users,
  Calendar,
  BarChart3,
  LineChart,
  PieChart
} from "lucide-react"
import { cn } from "@/lib/utils"

const LovelyMetricCard = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  color = "blue",
  sparkle = false
}: {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down"
  trendValue?: string
  icon: React.ReactNode
  color?: "blue" | "green" | "purple" | "orange" | "pink"
  sparkle?: boolean
}) => {
  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    green: "from-green-400 to-green-600",
    purple: "from-purple-400 to-purple-600",
    orange: "from-orange-400 to-orange-600",
    pink: "from-pink-400 to-pink-600"
  }

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity", colorClasses[color])} />
      {sparkle && (
        <div className="absolute top-2 right-2">
          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", colorClasses[color])}>
          {icon}
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center text-xs">
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={cn("font-medium",
              trend === "up" ? "text-green-600" : "text-red-600"
            )}>
              {trendValue}
            </span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const DelightfulRecommendationCard = ({
  title,
  description,
  savings,
  effort,
  icon,
  priority = "medium"
}: {
  title: string
  description: string
  savings: string
  effort: "low" | "medium" | "high"
  icon: React.ReactNode
  priority?: "low" | "medium" | "high"
}) => {
  const effortColors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200"
  }

  const priorityEmojis = {
    low: "🌱",
    medium: "⚡",
    high: "🚀"
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white group-hover:scale-110 transition-transform">
            {icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-sm">{title}</h3>
              <span className="text-lg">{priorityEmojis[priority]}</span>
            </div>

            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <PiggyBank className="h-3 w-3 mr-1" />
                  Save {savings}
                </Badge>
                <Badge variant="outline" className={effortColors[effort]}>
                  {effort} effort
                </Badge>
              </div>

              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs hover:bg-blue-50">
                Apply ✨
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CloudProviderCard = ({
  provider,
  spend,
  percentage,
  trend,
  resources,
  color
}: {
  provider: string
  spend: string
  percentage: number
  trend: "up" | "down"
  resources: number
  color: string
}) => (
  <Card className="hover:shadow-md transition-all duration-300">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs", color)}>
            {provider.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{provider}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {resources} resources
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="text-lg font-bold">{spend}</div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{percentage}% of total spend</span>
          <div className="flex items-center">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={cn(trend === "up" ? "text-green-600" : "text-red-600")}>
              {trend === "up" ? "+5%" : "-3%"}
            </span>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-1.5">
          <div
            className={cn("h-1.5 rounded-full transition-all duration-500", color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function OptScaleDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      {/* Lovely Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Cloud Optimizer ✨
                </h1>
                <p className="text-muted-foreground">Making cloud costs loveable since today!</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {["7d", "30d", "90d"].map((period) => (
                <Button
                  key={period}
                  variant={selectedTimeframe === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(period)}
                  className={cn(
                    "transition-all duration-200",
                    selectedTimeframe === period && "shadow-md"
                  )}
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Star className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Delightful Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <LovelyMetricCard
            title="Total Cloud Spend"
            value="$47,832"
            subtitle="Across 3 cloud providers"
            trend="down"
            trendValue="12%"
            icon={<DollarSign className="h-5 w-5" />}
            color="green"
            sparkle
          />

          <LovelyMetricCard
            title="Optimization Score"
            value="87/100"
            subtitle="Great job! 🎉"
            trend="up"
            trendValue="8%"
            icon={<Award className="h-5 w-5" />}
            color="purple"
          />

          <LovelyMetricCard
            title="Potential Savings"
            value="$12,450"
            subtitle="Ready to be saved!"
            icon={<PiggyBank className="h-5 w-5" />}
            color="orange"
            sparkle
          />

          <LovelyMetricCard
            title="Active Resources"
            value="1,247"
            subtitle="Being monitored"
            trend="up"
            trendValue="156"
            icon={<Zap className="h-5 w-5" />}
            color="blue"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cost Breakdown Chart */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span>Cost Breakdown by Service 📊</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { service: "Compute (EC2)", cost: "$18,240", percentage: 38, color: "bg-blue-500" },
                    { service: "Storage (S3)", cost: "$8,920", percentage: 19, color: "bg-green-500" },
                    { service: "Database (RDS)", cost: "$7,650", percentage: 16, color: "bg-purple-500" },
                    { service: "Networking", cost: "$5,430", percentage: 11, color: "bg-orange-500" },
                    { service: "Lambda Functions", cost: "$4,210", percentage: 9, color: "bg-pink-500" },
                    { service: "Others", cost: "$3,382", percentage: 7, color: "bg-gray-500" }
                  ].map((item, index) => (
                    <div key={index} className="group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.service}</span>
                        <span className="font-bold text-sm">{item.cost}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={cn("h-2 rounded-full transition-all duration-700 group-hover:shadow-lg", item.color)}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{item.percentage}% of total</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lovely Recommendations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Smart Recommendations 💡</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DelightfulRecommendationCard
                  title="Rightsize EC2 Instances"
                  description="3 instances are oversized. Downsizing can save costs without affecting performance!"
                  savings="$890/mo"
                  effort="low"
                  priority="high"
                  icon={<Zap className="h-4 w-4" />}
                />

                <DelightfulRecommendationCard
                  title="Schedule Lambda Functions"
                  description="Set up auto-scheduling for 12 Lambda functions during low-traffic hours."
                  savings="$340/mo"
                  effort="medium"
                  priority="medium"
                  icon={<Calendar className="h-4 w-4" />}
                />

                <DelightfulRecommendationCard
                  title="Remove Unused EBS Volumes"
                  description="Found 8 unattached volumes taking up unnecessary storage space."
                  savings="$120/mo"
                  effort="low"
                  priority="high"
                  icon={<AlertCircle className="h-4 w-4" />}
                />
              </CardContent>
            </Card>

            {/* Team Love */}
            <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-800">
                  <Users className="h-5 w-5" />
                  <span>Team Achievements 🏆</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-800">JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">John saved $2,340 this month!</p>
                      <p className="text-xs text-muted-foreground">By optimizing S3 storage tiers</p>
                    </div>
                    <div className="ml-auto">🌟</div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-800">SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Sarah found 15 unused resources</p>
                      <p className="text-xs text-muted-foreground">Great detective work!</p>
                    </div>
                    <div className="ml-auto">🔍</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Multi-Cloud Love */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-6">
            <Cloud className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Multi-Cloud Overview ☁️</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CloudProviderCard
              provider="AWS"
              spend="$28,450"
              percentage={60}
              trend="down"
              resources={847}
              color="bg-orange-500"
            />

            <CloudProviderCard
              provider="Azure"
              spend="$12,890"
              percentage={27}
              trend="up"
              resources={312}
              color="bg-blue-600"
            />

            <CloudProviderCard
              provider="Google Cloud"
              spend="$6,492"
              percentage={13}
              trend="up"
              resources={188}
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Lovely Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="text-sm text-purple-800">
              Made with love for better cloud optimization 💖
            </span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}