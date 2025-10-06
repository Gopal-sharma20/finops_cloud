"use client"

import React from "react"
import {
  MobileDashboardContainer,
  ResponsiveDashboardGrid,
  ResponsiveTwoColumnLayout,
  ResponsiveSection,
  ResponsiveCardLayout
} from "@/components/layout/responsive-layout"
import { ResponsiveMetricDisplay } from "@/components/mobile/mobile-metric-grid"
import { CostTrendChart } from "@/components/charts/cost-trend-chart"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Target,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  Globe,
  Download,
  Share2,
  Bell,
  ChevronRight,
  BarChart3
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

// Mock data - replace with real API calls
const mockCostData = [
  { date: "2024-01-01", actualCost: 2100000, forecastCost: 2200000, confidenceUpper: 2300000, confidenceLower: 2100000 },
  { date: "2024-01-02", actualCost: 2150000, forecastCost: 2250000, confidenceUpper: 2350000, confidenceLower: 2150000 },
  { date: "2024-01-03", actualCost: 2200000, forecastCost: 2300000, confidenceUpper: 2400000, confidenceLower: 2200000 },
  { date: "2024-01-04", actualCost: 2180000, forecastCost: 2280000, confidenceUpper: 2380000, confidenceLower: 2180000 },
  { date: "2024-01-05", actualCost: 2250000, forecastCost: 2350000, confidenceUpper: 2450000, confidenceLower: 2250000 },
  { date: "2024-01-06", actualCost: 2300000, forecastCost: 2400000, confidenceUpper: 2500000, confidenceLower: 2300000 },
  { date: "2024-01-07", actualCost: 2280000, forecastCost: 2380000, confidenceUpper: 2480000, confidenceLower: 2280000 },
]

const mockBusinessEvents = [
  { date: "2024-01-03", label: "Product Launch", type: "milestone" as const },
  { date: "2024-01-05", label: "Lambda Anomaly", type: "anomaly" as const }
]

const kpiMetrics = [
  {
    title: "Total Cloud Spend",
    value: 2470000,
    currency: "USD",
    change: { value: 12.3, trend: "down" as const, period: "MTD", isPositive: true },
    icon: <DollarSign className="h-4 w-4" />,
    color: "financial-profit-600"
  },
  {
    title: "Budget Utilization",
    value: "87%",
    change: { value: 5, trend: "up" as const, period: "MTD", isPositive: true },
    icon: <Target className="h-4 w-4" />,
    color: "financial-profit-600"
  },
  {
    title: "Savings Realized",
    value: 847000,
    currency: "USD",
    change: { value: 156, trend: "up" as const, period: "QTD", isPositive: true },
    icon: <PiggyBank className="h-4 w-4" />,
    color: "financial-profit-600"
  },
  {
    title: "Efficiency Score",
    value: "94",
    change: { value: 8, trend: "up" as const, period: "MTD", isPositive: true },
    icon: <TrendingUp className="h-4 w-4" />,
    color: "financial-profit-600"
  }
]

const benchmarkData = [
  { title: "Cost per Employee", value: "$1,247", percentile: 78, industry: "SaaS" },
  { title: "Cloud ROI", value: "324%", percentile: 92, industry: "SaaS" },
  { title: "Waste Ratio", value: "8.3%", percentile: 85, industry: "SaaS" }
]

const BenchmarkCard: React.FC<{
  title: string
  value: string
  percentile: number
  industry?: string
}> = ({ title, value, percentile, industry = "SaaS" }) => (
  <ResponsiveCardLayout padding="sm" className="space-y-3">
    <div className="flex justify-between items-start">
      <h4 className="text-sm font-medium">{title}</h4>
      <span className="text-xs text-muted-foreground">{industry}</span>
    </div>

    <div className="space-y-2">
      <div className="text-lg font-semibold font-financial">{value}</div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Percentile</span>
          <span className="font-medium">{percentile}th</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-financial-profit-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${percentile}%` }}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {percentile >= 75 ? "Top quartile performance" :
         percentile >= 50 ? "Above average" :
         "Room for improvement"}
      </div>
    </div>
  </ResponsiveCardLayout>
)

const ScenarioPlanningCard: React.FC = () => (
  <ResponsiveCardLayout>
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Budget Scenario Planning</h3>
        <p className="text-sm text-muted-foreground mt-1">
          12-month cost projections under different growth scenarios
        </p>
      </div>

      <div className="space-y-4">
        {[
          { name: "Conservative Growth", probability: 45, cost: 2800000, color: "bg-blue-500" },
          { name: "Expected Growth", probability: 35, cost: 3200000, color: "bg-green-500" },
          { name: "Aggressive Growth", probability: 20, cost: 3800000, color: "bg-orange-500" }
        ].map((scenario, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className={cn("w-3 h-3 rounded-full", scenario.color)} />
                <span className="text-sm font-medium">{scenario.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-financial">{formatCurrency(scenario.cost)}</div>
                <div className="text-xs text-muted-foreground">{scenario.probability}% probability</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn("h-2 rounded-full transition-all duration-500", scenario.color)}
                style={{ width: `${scenario.probability * 2}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium mb-2">Key Risk Factors</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Headcount growth: 25% increase planned</li>
          <li>• New product launch: +$400K/month estimated</li>
          <li>• Economic uncertainty: ±20% variance possible</li>
        </ul>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" variant="outline" className="flex-1">
          Adjust Scenarios
        </Button>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>
    </div>
  </ResponsiveCardLayout>
)

const QuickActionsCard: React.FC = () => (
  <ResponsiveCardLayout>
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex-col space-y-1">
          <Download className="h-4 w-4" />
          <span className="text-xs">Board Report</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col space-y-1">
          <Users className="h-4 w-4" />
          <span className="text-xs">Team Review</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col space-y-1">
          <Building className="h-4 w-4" />
          <span className="text-xs">Budget Request</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col space-y-1">
          <Globe className="h-4 w-4" />
          <span className="text-xs">Multi-Cloud Plan</span>
        </Button>
      </div>
    </div>
  </ResponsiveCardLayout>
)

const AlertsCard: React.FC = () => (
  <ResponsiveCardLayout>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Bell className="h-4 w-4 mr-2" />
          Alerts
        </h3>
        <Badge variant="destructive" className="px-2 py-1">3</Badge>
      </div>

      <div className="space-y-3">
        {[
          { type: "Budget", message: "AWS spend at 95% of monthly budget", severity: "high" },
          { type: "Anomaly", message: "Lambda costs increased 40% yesterday", severity: "medium" },
          { type: "Optimization", message: "12 idle EC2 instances detected", severity: "low" }
        ].map((alert, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
            <AlertTriangle className={cn(
              "h-4 w-4 mt-0.5",
              alert.severity === "high" && "text-red-500",
              alert.severity === "medium" && "text-yellow-500",
              alert.severity === "low" && "text-blue-500"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{alert.type}</span>
                <Badge variant="outline" className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm mt-1">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full">
        View All Alerts
        <ChevronRight className="h-3 w-3 ml-1" />
      </Button>
    </div>
  </ResponsiveCardLayout>
)

export default function MobileCFODashboard() {
  return (
    <MobileDashboardContainer>
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Financial overview and strategic insights • Updated 2 min ago
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm">
            <BarChart3 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <ResponsiveSection title="Key Performance Indicators">
        <ResponsiveMetricDisplay metrics={kpiMetrics} />
      </ResponsiveSection>

      {/* Main Content */}
      <ResponsiveTwoColumnLayout
        leftSpan={2}
        rightSpan={1}
        leftColumn={
          <div className="space-y-6">
            {/* Cost Trend Chart */}
            <div className="w-full">
              <CostTrendChart
                data={mockCostData}
                forecastPeriod={30}
                confidenceIntervals={true}
                anomalyDetection={true}
                annotations={mockBusinessEvents}
                height={300}
                onExport={(format) => console.log(`Export as ${format}`)}
              />
            </div>

            {/* Scenario Planning */}
            <ScenarioPlanningCard />
          </div>
        }
        rightColumn={
          <div className="space-y-6">
            {/* Alerts */}
            <AlertsCard />

            {/* Industry Benchmarking */}
            <ResponsiveCardLayout>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Industry Benchmarking</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your performance vs industry peers
                  </p>
                </div>

                <div className="space-y-4">
                  {benchmarkData.map((benchmark, index) => (
                    <BenchmarkCard key={index} {...benchmark} />
                  ))}
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Target</span>
                    <span className="font-medium">Top 10%</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Full Report
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </ResponsiveCardLayout>
          </div>
        }
      />

      {/* Quick Actions */}
      <QuickActionsCard />
    </MobileDashboardContainer>
  )
}