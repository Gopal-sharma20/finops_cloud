"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/dashboard/metric-card"
import {
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Database,
  Network,
  Shield,
  PlayCircle,
  Pause,
  RotateCcw,
  Settings,
  Terminal,
  GitBranch,
  Cpu,
  HardDrive,
  Wifi
} from "lucide-react"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"

// Mock data for DevOps dashboard
const mockInfrastructureNodes = [
  { id: "prod-web-1", type: "ec2", status: "running", cost: 247, utilization: 78, region: "us-east-1" },
  { id: "prod-web-2", type: "ec2", status: "running", cost: 247, utilization: 82, region: "us-east-1" },
  { id: "prod-db-1", type: "rds", status: "running", cost: 892, utilization: 45, region: "us-east-1" },
  { id: "dev-cluster", type: "eks", status: "running", cost: 156, utilization: 23, region: "us-west-2" },
  { id: "stage-lb", type: "alb", status: "running", cost: 67, utilization: 34, region: "us-east-1" },
]

const mockRecommendations = [
  {
    id: "1",
    title: "Right-size prod-db-1 RDS instance",
    description: "Database utilization consistently below 50%. Consider downsizing to save costs.",
    savings: 400,
    risk: "medium",
    confidence: 87,
    affectedResources: ["prod-db-1"],
    type: "right_sizing"
  },
  {
    id: "2",
    title: "Enable scheduled scaling for dev-cluster",
    description: "Development EKS cluster runs 24/7. Schedule downtime for nights and weekends.",
    savings: 120,
    risk: "low",
    confidence: 95,
    affectedResources: ["dev-cluster"],
    type: "scheduling"
  },
  {
    id: "3",
    title: "Clean up unused EBS snapshots",
    description: "47 snapshots older than 30 days detected across all regions.",
    savings: 89,
    risk: "low",
    confidence: 99,
    affectedResources: ["various"],
    type: "cleanup"
  }
]

const RealtimeMetric: React.FC<{
  label: string
  value: string
  trend?: "up" | "down" | "stable"
  change?: string
  status?: "operational" | "warning" | "critical"
  urgent?: number
}> = ({ label, value, trend, change, status, urgent }) => (
  <div className="flex flex-col space-y-1">
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {status && (
        <div className={cn(
          "w-2 h-2 rounded-full",
          status === "operational" && "bg-financial-profit-500",
          status === "warning" && "bg-financial-warning-500",
          status === "critical" && "bg-financial-loss-500 animate-pulse"
        )} />
      )}
    </div>
    <div className="flex items-center space-x-2">
      <span className="text-lg font-semibold font-financial">{value}</span>
      {change && trend && (
        <span className={cn(
          "text-sm flex items-center",
          trend === "up" && "text-financial-loss-600",
          trend === "down" && "text-financial-profit-600",
          trend === "stable" && "text-muted-foreground"
        )}>
          {trend === "up" && "↗"}
          {trend === "down" && "↘"}
          {trend === "stable" && "→"}
          {change}
        </span>
      )}
      {urgent && (
        <span className="bg-financial-loss-500 text-white px-2 py-0.5 text-xs rounded-full">
          {urgent} urgent
        </span>
      )}
    </div>
  </div>
)

const InfrastructureTopologyMap: React.FC<{
  nodes: Array<{
    id: string
    type: string
    status: string
    cost: number
    utilization: number
    region: string
  }>
  onNodeClick: (node: any) => void
}> = ({ nodes, onNodeClick }) => {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "ec2": return <Server className="h-6 w-6" />
      case "rds": return <Database className="h-6 w-6" />
      case "eks": return <GitBranch className="h-6 w-6" />
      case "alb": return <Network className="h-6 w-6" />
      default: return <Server className="h-6 w-6" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "border-financial-profit-500 bg-financial-profit-50"
      case "stopped": return "border-financial-warning-500 bg-financial-warning-50"
      case "error": return "border-financial-loss-500 bg-financial-loss-50"
      default: return "border-muted bg-muted/50"
    }
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 80) return "text-financial-loss-600"
    if (utilization > 60) return "text-financial-warning-600"
    return "text-financial-profit-600"
  }

  return (
    <div className="p-6 bg-neutral-900 rounded-lg min-h-[400px] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Infrastructure nodes */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            onClick={() => onNodeClick(node)}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105",
              getStatusColor(node.status)
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getNodeIcon(node.type)}
                <span className="text-sm font-medium text-white">{node.id}</span>
              </div>
              <span className="text-xs text-gray-300 bg-black/20 px-2 py-1 rounded">
                {node.region}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Cost/month</span>
                <span className="font-financial text-white">{formatCurrency(node.cost)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Utilization</span>
                <span className={cn("font-medium", getUtilizationColor(node.utilization))}>
                  {node.utilization}%
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    node.utilization > 80 ? "bg-red-500" :
                    node.utilization > 60 ? "bg-yellow-500" : "bg-green-500"
                  )}
                  style={{ width: `${node.utilization}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection lines (simplified) */}
      <svg className="absolute inset-0 pointer-events-none">
        <g stroke="#4a5568" strokeWidth="1" strokeDasharray="5,5" opacity="0.3">
          <line x1="100" y1="100" x2="300" y2="100" />
          <line x1="300" y1="100" x2="300" y2="200" />
          <line x1="100" y1="200" x2="300" y2="200" />
        </g>
      </svg>
    </div>
  )
}

const RecommendationCard: React.FC<{
  recommendation: typeof mockRecommendations[0]
  onApply: (id: string) => void
  onDismiss: (id: string) => void
  onSchedule: (id: string) => void
}> = ({ recommendation, onApply, onDismiss, onSchedule }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "bg-financial-profit-100 text-financial-profit-800 border-financial-profit-200"
      case "medium": return "bg-financial-warning-100 text-financial-warning-800 border-financial-warning-200"
      case "high": return "bg-financial-loss-100 text-financial-loss-800 border-financial-loss-200"
      default: return "bg-muted text-muted-foreground border-muted"
    }
  }

  return (
    <Card className="bg-neutral-800 border-neutral-700 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-white mb-1">{recommendation.title}</CardTitle>
            <p className="text-sm text-gray-300">{recommendation.description}</p>
          </div>
          <div className={cn("px-2 py-1 rounded-full text-xs font-medium border", getRiskColor(recommendation.risk))}>
            {recommendation.risk} risk
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold font-financial text-financial-profit-400">
              {formatCurrency(recommendation.savings)}
            </div>
            <div className="text-xs text-gray-400">Monthly Savings</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {recommendation.confidence}%
            </div>
            <div className="text-xs text-gray-400">Confidence</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              {recommendation.affectedResources.length}
            </div>
            <div className="text-xs text-gray-400">Resources</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1"
            onClick={() => onApply(recommendation.id)}
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Apply Now
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSchedule(recommendation.id)}
          >
            <Clock className="h-4 w-4 mr-1" />
            Schedule
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(recommendation.id)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const AutomationStatusWidget: React.FC<{
  pipelines: Array<{ name: string; status: string; lastRun: string; nextRun: string }>
  successRate: number
  nextExecution: string
}> = ({ pipelines, successRate, nextExecution }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-white">Automation Pipelines</h4>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-gray-300">Active</span>
      </div>
    </div>

    <div className="space-y-2">
      {[
        { name: "Cost Optimization", status: "running", lastRun: "2 min ago", nextRun: "in 30 min" },
        { name: "Resource Cleanup", status: "scheduled", lastRun: "1 hour ago", nextRun: "in 2 hours" },
        { name: "Right-sizing", status: "completed", lastRun: "15 min ago", nextRun: "in 45 min" }
      ].map((pipeline, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-neutral-700 rounded-lg">
          <div className="flex items-center space-x-2">
            {pipeline.status === "running" && <Activity className="h-4 w-4 text-blue-400 animate-spin" />}
            {pipeline.status === "scheduled" && <Clock className="h-4 w-4 text-yellow-400" />}
            {pipeline.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-400" />}
            <span className="text-sm text-white">{pipeline.name}</span>
          </div>
          <span className="text-xs text-gray-400">{pipeline.nextRun}</span>
        </div>
      ))}
    </div>

    <div className="p-3 bg-neutral-700 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-300">Success Rate</span>
        <span className="text-sm font-medium text-green-400">{successRate}%</span>
      </div>
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${successRate}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Next execution: {nextExecution}
      </div>
    </div>
  </div>
)

export default function DevOpsDashboard() {
  const [selectedNode, setSelectedNode] = useState<any>(null)

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
  }

  const handleApplyRecommendation = (id: string) => {
    console.log("Applying recommendation:", id)
  }

  const handleDismissRecommendation = (id: string) => {
    console.log("Dismissing recommendation:", id)
  }

  const handleScheduleRecommendation = (id: string) => {
    console.log("Scheduling recommendation:", id)
  }

  return (
    <div className="flex-1 space-y-6 p-6 pb-16 bg-neutral-900 text-white min-h-screen">
      {/* Real-time Header */}
      <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            <RealtimeMetric
              label="Live Cost Rate"
              value="$347/hour"
              trend="down"
              change="12%"
            />
            <RealtimeMetric
              label="Active Recommendations"
              value="23"
              trend="up"
              change="5"
              urgent={3}
            />
            <RealtimeMetric
              label="Automation Status"
              value="94%"
              status="operational"
            />
          </div>
          <Button variant="destructive" size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Real-time Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Current Rate"
          value="$347/hr"
          change={{ value: 12, trend: "down", period: "vs last hour", isPositive: true }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
        />
        <MetricCard
          title="CPU Usage"
          value="68%"
          change={{ value: 5, trend: "up", period: "avg", isPositive: false }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
          icon={<Cpu className="h-4 w-4" />}
        />
        <MetricCard
          title="Memory"
          value="72%"
          change={{ value: 3, trend: "down", period: "avg", isPositive: true }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
          icon={<HardDrive className="h-4 w-4" />}
        />
        <MetricCard
          title="Network I/O"
          value="1.2GB/s"
          change={{ value: 15, trend: "up", period: "peak", isPositive: false }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
          icon={<Wifi className="h-4 w-4" />}
        />
        <MetricCard
          title="Idle Resources"
          value="47"
          change={{ value: 8, trend: "down", period: "this week", isPositive: true }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
        />
        <MetricCard
          title="Automation"
          value="96.7%"
          change={{ value: 2.1, trend: "up", period: "success rate", isPositive: true }}
          size="sm"
          className="bg-neutral-800 border-neutral-700 text-white"
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Infrastructure Topology */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Infrastructure Cost Topology</CardTitle>
              <p className="text-gray-400 text-sm">Real-time resource monitoring with cost overlay</p>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-neutral-600">
                <Terminal className="h-4 w-4 mr-2" />
                Console
              </Button>
              <Button size="sm" variant="outline" className="border-neutral-600">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InfrastructureTopologyMap
            nodes={mockInfrastructureNodes}
            onNodeClick={handleNodeClick}
          />
        </CardContent>
      </Card>

      {/* Recommendations and Automation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">AI-Powered Recommendations</h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="border-neutral-600">
                Filter: All
              </Button>
              <Button size="sm" variant="outline" className="border-neutral-600">
                Sort: Savings
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {mockRecommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                onApply={handleApplyRecommendation}
                onDismiss={handleDismissRecommendation}
                onSchedule={handleScheduleRecommendation}
              />
            ))}
          </div>
        </div>

        <Card className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">Automation Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <AutomationStatusWidget
              pipelines={[]}
              successRate={96.7}
              nextExecution="in 14 minutes"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col h-20 space-y-2 border-neutral-600">
              <PlayCircle className="h-5 w-5" />
              <span className="text-sm">Start Optimization</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2 border-neutral-600">
              <Pause className="h-5 w-5" />
              <span className="text-sm">Pause Automation</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2 border-neutral-600">
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Rollback Changes</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 space-y-2 border-neutral-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Security Scan</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}