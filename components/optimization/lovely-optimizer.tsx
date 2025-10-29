"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import {
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Sparkles,
  Lightbulb,
  ThumbsUp,
  Star,
  Rocket,
  Shield,
  Battery,
  CloudLightning,
  Gauge
} from "lucide-react"
import { cn } from "@/lib/utils"

interface OptimizationRecommendation {
  id: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "low" | "medium" | "high"
  savings: number
  risk: "low" | "medium" | "high"
  resource: string
  resourceType: "compute" | "storage" | "database" | "network"
  confidence: number
  emoji: string
  implemented?: boolean
}

const recommendations: OptimizationRecommendation[] = [
  {
    id: "1",
    title: "Rightsize EC2 Instances",
    description: "Your t3.xlarge instances are running at 15% CPU. Downsize to t3.large for optimal performance.",
    impact: "high",
    effort: "low",
    savings: 1240,
    risk: "low",
    resource: "web-server-01, api-server-02",
    resourceType: "compute",
    confidence: 95,
    emoji: "⚡"
  },
  {
    id: "2",
    title: "Schedule Lambda Functions",
    description: "Set up auto-scaling schedules for Lambda functions during low-traffic periods.",
    impact: "medium",
    effort: "medium",
    savings: 680,
    risk: "low",
    resource: "user-auth, data-processor",
    resourceType: "compute",
    confidence: 87,
    emoji: "🕐"
  },
  {
    id: "3",
    title: "Remove Unused EBS Volumes",
    description: "Found 12 unattached EBS volumes consuming storage without purpose.",
    impact: "medium",
    effort: "low",
    savings: 340,
    risk: "low",
    resource: "vol-0123abc, vol-0456def",
    resourceType: "storage",
    confidence: 99,
    emoji: "🗑️",
    implemented: false
  },
  {
    id: "4",
    title: "Optimize RDS Instance",
    description: "Your database is oversized. Consider switching to a more cost-effective instance type.",
    impact: "high",
    effort: "high",
    savings: 2100,
    risk: "medium",
    resource: "prod-db-cluster",
    resourceType: "database",
    confidence: 82,
    emoji: "💾"
  },
  {
    id: "5",
    title: "Enable S3 Intelligent Tiering",
    description: "Automatically move infrequently accessed data to cheaper storage classes.",
    impact: "medium",
    effort: "low",
    savings: 890,
    risk: "low",
    resource: "backup-bucket, archive-storage",
    resourceType: "storage",
    confidence: 91,
    emoji: "🎯"
  }
]

const ImpactBadge = ({ impact }: { impact: "high" | "medium" | "low" }) => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200"
  }

  return (
    <Badge variant="outline" className={colors[impact]}>
      {impact} impact
    </Badge>
  )
}

const EffortBadge = ({ effort }: { effort: "high" | "medium" | "low" }) => {
  const colors = {
    high: "bg-purple-100 text-purple-800 border-purple-200",
    medium: "bg-orange-100 text-orange-800 border-orange-200",
    low: "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <Badge variant="outline" className={colors[effort]}>
      {effort} effort
    </Badge>
  )
}

const ConfidenceBar = ({ confidence }: { confidence: number }) => (
  <div className="flex items-center space-x-2">
    <span className="text-xs text-muted-foreground">Confidence:</span>
    <div className="flex-1 bg-muted rounded-full h-2 max-w-20">
      <div
        className={cn(
          "h-2 rounded-full transition-all duration-1000",
          confidence >= 90 ? "bg-green-500" :
          confidence >= 80 ? "bg-yellow-500" :
          "bg-orange-500"
        )}
        style={{ width: `${confidence}%` }}
      />
    </div>
    <span className="text-xs font-medium">{confidence}%</span>
  </div>
)

const OptimizationCard = ({
  recommendation,
  onImplement,
  onDismiss
}: {
  recommendation: OptimizationRecommendation
  onImplement: () => void
  onDismiss: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group",
        recommendation.implemented && "bg-green-50 border-green-200"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br text-white transition-transform duration-300",
            recommendation.resourceType === "compute" && "from-blue-400 to-blue-600",
            recommendation.resourceType === "storage" && "from-green-400 to-green-600",
            recommendation.resourceType === "database" && "from-purple-400 to-purple-600",
            recommendation.resourceType === "network" && "from-orange-400 to-orange-600",
            isHovered && "scale-110 rotate-3"
          )}>
            <span className="text-lg">{recommendation.emoji}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                  {recommendation.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {recommendation.description}
                </p>
              </div>

              {recommendation.implemented && (
                <div className="ml-2 p-1 bg-green-500 rounded-full">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Resource Info */}
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Affected resources:</div>
              <div className="text-xs font-mono bg-muted/50 px-2 py-1 rounded text-blue-600">
                {recommendation.resource}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 text-xs">
                <ImpactBadge impact={recommendation.impact} />
                <EffortBadge effort={recommendation.effort} />
                <div className="flex items-center space-x-1 text-green-600">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-semibold">${recommendation.savings}/mo</span>
                </div>
              </div>
            </div>

            {/* Confidence */}
            <div className="mb-4">
              <ConfidenceBar confidence={recommendation.confidence} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!recommendation.implemented ? (
                  <>
                    <Button
                      size="sm"
                      onClick={onImplement}
                      className="h-7 px-3 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Apply Fix
                    </Button>
                    <Button size="sm" variant="ghost" onClick={onDismiss} className="h-7 px-3 text-xs">
                      Later
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Implemented! 🎉</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Risk: {recommendation.risk}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const LovelyOptimizer = () => {
  const [recs, setRecs] = useState(recommendations)
  const [savingsGoal, setSavingsGoal] = useState([3000])
  const [autoApply, setAutoApply] = useState(false)

  const totalSavings = recs.filter(r => !r.implemented).reduce((sum, rec) => sum + rec.savings, 0)
  const implementedCount = recs.filter(r => r.implemented).length
  const highImpactCount = recs.filter(r => r.impact === "high" && !r.implemented).length

  const handleImplement = (id: string) => {
    setRecs(recs.map(rec =>
      rec.id === id ? { ...rec, implemented: true } : rec
    ))
  }

  const handleDismiss = (id: string) => {
    setRecs(recs.filter(rec => rec.id !== id))
  }

  const implementAll = () => {
    setRecs(recs.map(rec => ({ ...rec, implemented: true })))
  }

  return (
    <div className="space-y-6">
      {/* Lovely Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Optimization Engine 🚀
                </h1>
                <p className="text-muted-foreground">Making your cloud infrastructure loveable and efficient!</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                ${totalSavings.toLocaleString('en-US')}
              </div>
              <div className="text-sm text-muted-foreground">potential monthly savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-lg font-bold">{recs.length - implementedCount}</div>
            <div className="text-xs text-muted-foreground">Active recommendations</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto mb-2">
              <Zap className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-lg font-bold">{highImpactCount}</div>
            <div className="text-xs text-muted-foreground">High-impact fixes</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-lg font-bold">{implementedCount}</div>
            <div className="text-xs text-muted-foreground">Completed optimizations</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
              <Gauge className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-lg font-bold">94%</div>
            <div className="text-xs text-muted-foreground">Optimization score</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={implementAll}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Star className="h-4 w-4 mr-2" />
              Apply All Low-Risk Fixes
            </Button>
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Schedule Maintenance Window
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Savings Report
            </Button>
          </div>

          {/* Savings Goal Slider */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Monthly Savings Goal</label>
              <span className="text-sm font-semibold text-green-600">
                ${savingsGoal[0].toLocaleString('en-US')}
              </span>
            </div>
            <Slider
              value={savingsGoal}
              onValueChange={setSavingsGoal}
              max={5000}
              min={500}
              step={100}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$500</span>
              <span>$5,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <span>Smart Recommendations</span>
          </h2>
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500">
            AI-Powered
          </Badge>
        </div>

        {recs.map((rec) => (
          <OptimizationCard
            key={rec.id}
            recommendation={rec}
            onImplement={() => handleImplement(rec.id)}
            onDismiss={() => handleDismiss(rec.id)}
          />
        ))}
      </div>

      {/* Love Footer */}
      <div className="text-center py-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200">
          <Heart className="h-4 w-4 text-pink-600" />
          <span className="text-sm text-purple-800">
            Optimizing with love, one resource at a time 💖
          </span>
          <Sparkles className="h-4 w-4 text-purple-600" />
        </div>
      </div>
    </div>
  )
}