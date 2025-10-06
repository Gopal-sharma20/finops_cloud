"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CostTrendChart } from "@/components/charts/cost-trend-chart"
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
  Settings,
  Bell,
  ChevronRight
} from "lucide-react"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"

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

const BenchmarkCard: React.FC<{
  title: string
  value: string
  percentile: number
  industry?: string
}> = ({ title, value, percentile, industry = "SaaS" }) => (
  <div className="p-4 bg-card border border-border rounded-lg">
    <div className="flex justify-between items-start mb-2">
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
  </div>
)

const ScenarioPlanningCard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Budget Scenario Planning</CardTitle>
      <p className="text-sm text-muted-foreground">
        12-month cost projections under different growth scenarios
      </p>
    </CardHeader>
    <CardContent>
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
            Export Plan
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

const VendorRiskMatrix: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Vendor Risk & Performance</CardTitle>
      <p className="text-sm text-muted-foreground">
        Cloud provider assessment and recommendations
      </p>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Risk Matrix Visualization */}
        <div className="relative h-48 bg-gradient-to-tr from-green-50 via-yellow-50 to-red-50 border rounded-lg p-4">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-4">
            {/* AWS - High Performance, Medium Risk */}
            <div className="col-start-3 row-start-1 flex items-center justify-center">
              <div className="bg-provider-aws text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                AWS
                <div className="text-[10px] opacity-80">65% spend</div>
              </div>
            </div>

            {/* Azure - Medium Performance, Low Risk */}
            <div className="col-start-1 row-start-2 flex items-center justify-center">
              <div className="bg-provider-azure text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                Azure
                <div className="text-[10px] opacity-80">25% spend</div>
              </div>
            </div>

            {/* GCP - Low Performance, Low Risk */}
            <div className="col-start-1 row-start-3 flex items-center justify-center">
              <div className="bg-provider-gcp text-white px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
                GCP
                <div className="text-[10px] opacity-80">10% spend</div>
              </div>
            </div>
          </div>

          {/* Axis Labels */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground">
            Low Risk → High Risk
          </div>
          <div className="absolute left-1 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">
            Low Performance → High Performance
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Strategic Recommendations</h4>
          {[
            { icon: "🎯", text: "Diversify from AWS to reduce concentration risk", priority: "high" },
            { icon: "💡", text: "Leverage Azure hybrid benefits for Windows workloads", priority: "medium" },
            { icon: "📈", text: "Increase GCP usage for ML/AI workloads", priority: "low" }
          ].map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 bg-muted/30 rounded-lg">
              <span className="text-lg">{rec.icon}</span>
              <div className="flex-1">
                <p className="text-sm">{rec.text}</p>
                <span className={cn(
                  "inline-block px-2 py-1 text-xs rounded-full mt-1",
                  rec.priority === "high" && "bg-red-100 text-red-800",
                  rec.priority === "medium" && "bg-yellow-100 text-yellow-800",
                  rec.priority === "low" && "bg-green-100 text-green-800"
                )}>
                  {rec.priority} priority
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            Vendor Analysis
          </Button>
          <Button size="sm" variant="outline">
            Contract Review
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function CFODashboard() {
  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Financial overview and strategic insights • Last updated 2 min ago
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Alerts
            <span className="ml-2 bg-destructive text-destructive-foreground px-2 py-0.5 text-xs rounded-full">
              3
            </span>
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Cloud Spend"
          value={2470000}
          currency="USD"
          change={{ value: 12.3, trend: "down", period: "MTD", isPositive: true }}
          target={3000000}
          confidence={94}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          clickable
        />

        <MetricCard
          title="Budget Utilization"
          value="87%"
          change={{ value: 5, trend: "up", period: "MTD", isPositive: true }}
          target={100}
          forecast={96}
          confidence={89}
          icon={<Target className="h-5 w-5 text-financial-profit-600" />}
          clickable
        />

        <MetricCard
          title="Savings Realized"
          value={847000}
          currency="USD"
          change={{ value: 156, trend: "up", period: "QTD", isPositive: true }}
          forecast={3200000}
          confidence={91}
          icon={<PiggyBank className="h-5 w-5 text-financial-profit-600" />}
          clickable
        />

        <MetricCard
          title="Efficiency Score"
          value="94"
          change={{ value: 8, trend: "up", period: "MTD", isPositive: true }}
          target={100}
          confidence={87}
          icon={<TrendingUp className="h-5 w-5 text-financial-profit-600" />}
          clickable
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Trend Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <CostTrendChart
            data={mockCostData}
            forecastPeriod={30}
            confidenceIntervals={true}
            anomalyDetection={true}
            annotations={mockBusinessEvents}
            onExport={(format) => console.log(`Export as ${format}`)}
          />
        </div>

        {/* Industry Benchmarking */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Industry Benchmarking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your performance vs industry peers
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <BenchmarkCard
                title="Cost per Employee"
                value="$1,247"
                percentile={78}
                industry="SaaS"
              />
              <BenchmarkCard
                title="Cloud ROI"
                value="324%"
                percentile={92}
                industry="SaaS"
              />
              <BenchmarkCard
                title="Waste Ratio"
                value="8.3%"
                percentile={85}
                industry="SaaS"
              />

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">Top 10%</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  View Full Report
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strategic Planning Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScenarioPlanningCard />
        <VendorRiskMatrix />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Board Report</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Team Review</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Building className="h-5 w-5" />
              <span className="text-sm">Budget Request</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm">Multi-Cloud Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}