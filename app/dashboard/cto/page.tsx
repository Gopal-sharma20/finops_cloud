"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/dashboard/metric-card"
import {
  BarChart3,
  TrendingUp,
  Layers,
  Shield,
  Lightbulb,
  GitBranch,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Brain,
  Cpu,
  Database,
  Cloud,
  Users,
  DollarSign
} from "lucide-react"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"

interface TechnologyInitiative {
  id: string
  name: string
  status: "planning" | "in_progress" | "completed" | "on_hold"
  costImpact: number
  timeline: string
  roi: number
  risk: "low" | "medium" | "high"
  category: "infrastructure" | "security" | "performance" | "innovation"
}

const mockTechInitiatives: TechnologyInitiative[] = [
  {
    id: "1",
    name: "Kubernetes Migration",
    status: "in_progress",
    costImpact: -150000,
    timeline: "Q2 2024",
    roi: 240,
    risk: "medium",
    category: "infrastructure"
  },
  {
    id: "2",
    name: "Multi-Cloud Strategy",
    status: "planning",
    costImpact: 200000,
    timeline: "Q3 2024",
    roi: 180,
    risk: "high",
    category: "infrastructure"
  },
  {
    id: "3",
    name: "AI/ML Platform",
    status: "planning",
    costImpact: 300000,
    timeline: "Q4 2024",
    roi: 320,
    risk: "high",
    category: "innovation"
  }
]

const ArchitectureDecisionMatrix: React.FC<{
  currentArchitecture: any
  proposedChanges: any[]
  costImplications: any
  performanceImpact: any
  timeframe: number
}> = ({ currentArchitecture, proposedChanges, costImplications, performanceImpact, timeframe }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(12)

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center">
            <Layers className="h-4 w-4 mr-2" />
            Current Architecture
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Cost:</span>
              <span className="font-financial">{formatCurrency(2470000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Efficiency Score:</span>
              <span className="font-medium">78/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tech Debt:</span>
              <span className="text-financial-warning-600">{formatCurrency(234000)}/month</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-financial-profit-50 border border-financial-profit-200 rounded-lg">
          <h4 className="font-medium mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-financial-profit-600" />
            Proposed Architecture
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Projected Cost:</span>
              <span className="font-financial text-financial-profit-600">{formatCurrency(2120000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Efficiency Score:</span>
              <span className="font-medium text-financial-profit-600">92/100</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tech Debt:</span>
              <span className="text-financial-profit-600">{formatCurrency(89000)}/month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border rounded-lg">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left text-sm font-medium">Decision Factor</th>
              <th className="border border-border p-3 text-center text-sm font-medium">Current</th>
              <th className="border border-border p-3 text-center text-sm font-medium">Proposed</th>
              <th className="border border-border p-3 text-center text-sm font-medium">Impact</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                factor: "Monthly Infrastructure Cost",
                current: "$2.47M",
                proposed: "$2.12M",
                impact: "-14%",
                positive: true
              },
              {
                factor: "Performance (Response Time)",
                current: "1.2s avg",
                proposed: "0.8s avg",
                impact: "-33%",
                positive: true
              },
              {
                factor: "Deployment Complexity",
                current: "High",
                proposed: "Medium",
                impact: "Improved",
                positive: true
              },
              {
                factor: "Migration Cost",
                current: "$0",
                proposed: "$450K",
                impact: "+$450K",
                positive: false
              },
              {
                factor: "Team Training Required",
                current: "None",
                proposed: "40 hours",
                impact: "+40h",
                positive: false
              }
            ].map((row, index) => (
              <tr key={index} className="hover:bg-muted/30">
                <td className="border border-border p-3 text-sm font-medium">{row.factor}</td>
                <td className="border border-border p-3 text-sm text-center font-financial">{row.current}</td>
                <td className="border border-border p-3 text-sm text-center font-financial">{row.proposed}</td>
                <td className={cn(
                  "border border-border p-3 text-sm text-center font-medium",
                  row.positive ? "text-financial-profit-600" : "text-financial-warning-600"
                )}>
                  {row.impact}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline and ROI Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-card border border-border rounded-lg">
          <h4 className="font-medium mb-3">Implementation Timeline</h4>
          <div className="space-y-3">
            {[
              { phase: "Phase 1: Planning & Setup", duration: "2 months", cost: 120000 },
              { phase: "Phase 2: Migration", duration: "4 months", cost: 250000 },
              { phase: "Phase 3: Optimization", duration: "2 months", cost: 80000 }
            ].map((phase, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                <div>
                  <div className="text-sm font-medium">{phase.phase}</div>
                  <div className="text-xs text-muted-foreground">{phase.duration}</div>
                </div>
                <div className="text-sm font-financial">{formatCurrency(phase.cost)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-lg">
          <h4 className="font-medium mb-3">ROI Projection</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total Investment:</span>
              <span className="font-financial">{formatCurrency(450000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Annual Savings:</span>
              <span className="font-financial text-financial-profit-600">{formatCurrency(1740000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payback Period:</span>
              <span className="font-medium">3.1 months</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>3-Year ROI:</span>
              <span className="text-financial-profit-600">1,056%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TechnologyRoadmapWidget: React.FC<{
  initiatives: TechnologyInitiative[]
  costProjections: any
  riskAssessment: any
}> = ({ initiatives, costProjections, riskAssessment }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-financial-profit-500"
      case "in_progress": return "bg-blue-500"
      case "planning": return "bg-financial-warning-500"
      case "on_hold": return "bg-gray-500"
      default: return "bg-gray-400"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-financial-profit-600"
      case "medium": return "text-financial-warning-600"
      case "high": return "text-financial-loss-600"
      default: return "text-muted-foreground"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "infrastructure": return <Cpu className="h-4 w-4" />
      case "security": return <Shield className="h-4 w-4" />
      case "performance": return <Zap className="h-4 w-4" />
      case "innovation": return <Brain className="h-4 w-4" />
      default: return <GitBranch className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Technology Initiatives</h4>
        <Button size="sm" variant="outline">
          <Lightbulb className="h-4 w-4 mr-1" />
          Add Initiative
        </Button>
      </div>

      <div className="space-y-3">
        {initiatives.map((initiative) => (
          <div key={initiative.id} className="p-3 border border-border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(initiative.category)}
                <h5 className="font-medium text-sm">{initiative.name}</h5>
              </div>
              <div className="flex items-center space-x-2">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(initiative.status))} />
                <span className="text-xs capitalize">{initiative.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Cost Impact:</span>
                <div className={cn(
                  "font-financial font-medium",
                  initiative.costImpact < 0 ? "text-financial-profit-600" : "text-financial-warning-600"
                )}>
                  {initiative.costImpact < 0 ? "-" : "+"}{formatCurrency(Math.abs(initiative.costImpact))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Timeline:</span>
                <div className="font-medium">{initiative.timeline}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Expected ROI:</span>
                <div className="font-medium text-financial-profit-600">{initiative.roi}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Risk Level:</span>
                <div className={cn("font-medium capitalize", getRiskColor(initiative.risk))}>
                  {initiative.risk}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted/50 rounded-lg">
        <h5 className="font-medium text-sm mb-2">Portfolio Summary</h5>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Total Investment:</span>
            <div className="font-financial font-medium">{formatCurrency(750000)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Expected Savings:</span>
            <div className="font-financial font-medium text-financial-profit-600">{formatCurrency(2100000)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const BalanceOptimizationChart: React.FC<{
  innovationSpend: any
  optimizationSavings: any
  optimalBalance: any
}> = ({ innovationSpend, optimizationSavings, optimalBalance }) => (
  <div className="space-y-6">
    {/* Innovation vs Optimization Balance */}
    <div className="p-4 bg-card border border-border rounded-lg">
      <h4 className="font-medium mb-4">Innovation vs Optimization Balance</h4>

      <div className="relative mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Pure Optimization</span>
          <span>Balanced</span>
          <span>Pure Innovation</span>
        </div>
        <div className="w-full bg-muted rounded-full h-4 relative">
          <div className="absolute top-0 left-0 w-1/3 h-4 bg-financial-profit-500 rounded-l-full opacity-70"></div>
          <div className="absolute top-0 left-1/3 w-1/3 h-4 bg-blue-500 opacity-70"></div>
          <div className="absolute top-0 right-0 w-1/3 h-4 bg-purple-500 rounded-r-full opacity-70"></div>

          {/* Current position marker */}
          <div className="absolute top-0 h-4 w-2 bg-foreground rounded-full" style={{ left: "58%" }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
              Current
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-financial-profit-600">Optimization Focus</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Cost Reduction:</span>
              <span className="font-financial">{formatCurrency(400000)}/month</span>
            </div>
            <div className="flex justify-between">
              <span>Efficiency Gains:</span>
              <span className="font-medium">23%</span>
            </div>
            <div className="flex justify-between">
              <span>Risk Level:</span>
              <span className="text-financial-profit-600">Low</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-sm font-medium text-purple-600">Innovation Investment</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>R&D Spending:</span>
              <span className="font-financial">{formatCurrency(300000)}/month</span>
            </div>
            <div className="flex justify-between">
              <span>Expected ROI:</span>
              <span className="font-medium">280%</span>
            </div>
            <div className="flex justify-between">
              <span>Time Horizon:</span>
              <span className="text-muted-foreground">18 months</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Recommendations */}
    <div className="p-4 bg-muted/50 rounded-lg">
      <h5 className="font-medium text-sm mb-3">Strategic Recommendations</h5>
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <CheckCircle2 className="h-4 w-4 text-financial-profit-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm">Current balance is optimal for growth stage company</span>
        </div>
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-4 w-4 text-financial-warning-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm">Consider increasing optimization focus by 10% to improve margins</span>
        </div>
        <div className="flex items-start space-x-2">
          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm">ML/AI investments showing 320% ROI potential</span>
        </div>
      </div>
    </div>
  </div>
)

const ComplianceRiskMatrix: React.FC<{
  regulations: string[]
  cloudProviders: string[]
  riskScores: any
}> = ({ regulations, cloudProviders, riskScores }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Compliance & Risk Assessment</h4>

    {/* Compliance Matrix */}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="border border-border p-2 text-left">Regulation</th>
            <th className="border border-border p-2 text-center">AWS</th>
            <th className="border border-border p-2 text-center">Azure</th>
            <th className="border border-border p-2 text-center">GCP</th>
          </tr>
        </thead>
        <tbody>
          {[
            { reg: "SOX", aws: "compliant", azure: "compliant", gcp: "partial" },
            { reg: "GDPR", aws: "compliant", azure: "compliant", gcp: "compliant" },
            { reg: "HIPAA", aws: "compliant", azure: "compliant", gcp: "non-compliant" },
            { reg: "PCI-DSS", aws: "compliant", azure: "partial", gcp: "compliant" }
          ].map((row, index) => (
            <tr key={index} className="hover:bg-muted/30">
              <td className="border border-border p-2 font-medium">{row.reg}</td>
              <td className="border border-border p-2 text-center">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  row.aws === "compliant" && "bg-financial-profit-100 text-financial-profit-800",
                  row.aws === "partial" && "bg-financial-warning-100 text-financial-warning-800",
                  row.aws === "non-compliant" && "bg-financial-loss-100 text-financial-loss-800"
                )}>
                  {row.aws}
                </span>
              </td>
              <td className="border border-border p-2 text-center">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  row.azure === "compliant" && "bg-financial-profit-100 text-financial-profit-800",
                  row.azure === "partial" && "bg-financial-warning-100 text-financial-warning-800",
                  row.azure === "non-compliant" && "bg-financial-loss-100 text-financial-loss-800"
                )}>
                  {row.azure}
                </span>
              </td>
              <td className="border border-border p-2 text-center">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  row.gcp === "compliant" && "bg-financial-profit-100 text-financial-profit-800",
                  row.gcp === "partial" && "bg-financial-warning-100 text-financial-warning-800",
                  row.gcp === "non-compliant" && "bg-financial-loss-100 text-financial-loss-800"
                )}>
                  {row.gcp}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Risk Summary */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title: "Overall Risk Score", value: "Medium", color: "text-financial-warning-600" },
        { title: "Compliance Gap", value: "2 issues", color: "text-financial-loss-600" },
        { title: "Remediation Cost", value: formatCurrency(89000), color: "text-muted-foreground" }
      ].map((item, index) => (
        <div key={index} className="p-3 bg-card border border-border rounded-lg text-center">
          <div className="text-xs text-muted-foreground">{item.title}</div>
          <div className={cn("font-medium", item.color)}>{item.value}</div>
        </div>
      ))}
    </div>
  </div>
)

export default function CTODashboard() {
  return (
    <div className="flex-1 space-y-6 p-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technology Leadership Center</h1>
          <p className="text-muted-foreground mt-1">
            Strategic technology decisions and architecture planning
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Tech Metrics
          </Button>
          <Button size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            Architecture Review
          </Button>
        </div>
      </div>

      {/* Strategic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Architecture Efficiency"
          value="83%"
          change={{ value: 8, trend: "up", period: "6 months", isPositive: true }}
          target={85}
          confidence={89}
          icon={<Layers className="h-5 w-5 text-blue-600" />}
          clickable
        />

        <MetricCard
          title="Technology Debt Cost"
          value={234000}
          currency="USD"
          change={{ value: 18, trend: "down", period: "QTD", isPositive: true }}
          forecast={180000}
          confidence={82}
          icon={<DollarSign className="h-5 w-5 text-financial-warning-600" />}
          clickable
        />

        <MetricCard
          title="Innovation Investment"
          value="23%"
          change={{ value: 5, trend: "up", period: "vs benchmark", isPositive: true }}
          target={25}
          confidence={91}
          icon={<Lightbulb className="h-5 w-5 text-purple-600" />}
          clickable
        />

        <MetricCard
          title="Security Score"
          value="94"
          change={{ value: 12, trend: "up", period: "YTD", isPositive: true }}
          target={95}
          confidence={96}
          icon={<Shield className="h-5 w-5 text-financial-profit-600" />}
          clickable
        />
      </div>

      {/* Architecture Decision Support */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Architecture Cost Modeling</CardTitle>
          <p className="text-sm text-muted-foreground">
            Cost implications of architectural decisions and technology changes
          </p>
        </CardHeader>
        <CardContent>
          <ArchitectureDecisionMatrix
            currentArchitecture={{}}
            proposedChanges={[]}
            costImplications={{}}
            performanceImpact={{}}
            timeframe={24}
          />
        </CardContent>
      </Card>

      {/* Technology Roadmap and Balance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technology Roadmap</CardTitle>
            <p className="text-sm text-muted-foreground">
              Strategic initiatives and their cost projections
            </p>
          </CardHeader>
          <CardContent>
            <TechnologyRoadmapWidget
              initiatives={mockTechInitiatives}
              costProjections={{}}
              riskAssessment={{}}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Innovation vs Optimization Balance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Strategic balance between cost optimization and innovation investment
            </p>
          </CardHeader>
          <CardContent>
            <BalanceOptimizationChart
              innovationSpend={{}}
              optimizationSavings={{}}
              optimalBalance={{}}
            />
          </CardContent>
        </Card>
      </div>

      {/* Compliance and Risk */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance & Risk Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Regulatory compliance status across cloud providers
          </p>
        </CardHeader>
        <CardContent>
          <ComplianceRiskMatrix
            regulations={["SOX", "GDPR", "HIPAA", "PCI-DSS"]}
            cloudProviders={["aws", "azure", "gcp"]}
            riskScores={{}}
          />
        </CardContent>
      </Card>

      {/* Strategic Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strategic Technology Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Cloud className="h-5 w-5" />
              <span className="text-sm">Multi-Cloud Plan</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Team Scaling</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Database className="h-5 w-5" />
              <span className="text-sm">Data Strategy</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <Brain className="h-5 w-5" />
              <span className="text-sm">AI/ML Roadmap</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}