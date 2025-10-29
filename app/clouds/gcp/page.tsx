"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  ComposedChart
} from "recharts"
import {
  Cloud,
  Server,
  Database,
  HardDrive,
  Network,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Calendar,
  MapPin,
  Clock,
  Cpu,
  MemoryStick,
  Activity,
  Settings,
  Download,
  RefreshCw,
  Heart,
  Sparkles,
  Brain,
  Container,
  Code,
  Workflow,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useGcpCost } from "@/hooks/useGcpCost"
import { logout } from "@/lib/auth/logout"

// GCP Regions with timezones
const gcpRegions = [
  { id: "us-central1", name: "US Central 1", timezone: "UTC-6", resources: 134, cost: 6492, location: "Iowa" },
  { id: "us-east1", name: "US East 1", timezone: "UTC-5", resources: 89, cost: 4870, location: "S. Carolina" },
  { id: "us-west1", name: "US West 1", timezone: "UTC-8", resources: 76, cost: 3650, location: "Oregon" },
  { id: "europe-west1", name: "Europe West 1", timezone: "UTC+1", resources: 98, cost: 5340, location: "Belgium" },
  { id: "asia-southeast1", name: "Asia Southeast 1", timezone: "UTC+8", resources: 65, cost: 3240, location: "Singapore" },
  { id: "asia-northeast1", name: "Asia Northeast 1", timezone: "UTC+9", resources: 54, cost: 2890, location: "Tokyo" },
  { id: "australia-southeast1", name: "Australia Southeast 1", timezone: "UTC+10", resources: 32, cost: 1890, location: "Sydney" },
  { id: "southamerica-east1", name: "South America East 1", timezone: "UTC-3", resources: 28, cost: 1620, location: "São Paulo" }
]

// GCP Services data
const gcpServices = [
  { name: "Compute Engine", count: 67, cost: 4890, utilization: 78, color: "#4285F4", icon: Server },
  { name: "Cloud Storage", count: 89, cost: 2340, utilization: 85, color: "#34A853", icon: HardDrive },
  { name: "Cloud SQL", count: 23, cost: 3650, utilization: 82, color: "#FBBC04", icon: Database },
  { name: "App Engine", count: 45, cost: 1890, utilization: 65, color: "#EA4335", icon: Globe },
  { name: "Cloud Functions", count: 78, cost: 890, utilization: 52, color: "#9AA0A6", icon: Zap },
  { name: "VPC Network", count: 34, cost: 1340, utilization: 68, color: "#0F9D58", icon: Network },
  { name: "GKE", count: 28, cost: 2890, utilization: 88, color: "#FF6F00", icon: Container },
  { name: "AI Platform", count: 15, cost: 1890, utilization: 72, color: "#7B1FA2", icon: Brain },
  { name: "Cloud Run", count: 56, cost: 1240, utilization: 45, color: "#00ACC1", icon: Code },
  { name: "Dataflow", count: 12, cost: 2340, utilization: 89, color: "#FF5722", icon: Workflow }
]

// GCP-specific utilization patterns
const gcpUtilizationData = [
  { time: "00:00", compute: 32, storage: 45, network: 28, ai: 15, containers: 38 },
  { time: "03:00", compute: 25, storage: 42, network: 22, ai: 12, containers: 35 },
  { time: "06:00", compute: 48, storage: 55, network: 38, ai: 28, containers: 52 },
  { time: "09:00", compute: 82, storage: 78, network: 72, ai: 65, containers: 85 },
  { time: "12:00", compute: 89, storage: 85, network: 88, ai: 78, containers: 92 },
  { time: "15:00", compute: 95, storage: 92, network: 85, ai: 88, containers: 95 },
  { time: "18:00", compute: 78, storage: 82, network: 75, ai: 72, containers: 82 },
  { time: "21:00", compute: 52, storage: 58, network: 45, ai: 38, containers: 55 }
]

// GCP cost trends with ML predictions
const gcpCostTrends = [
  { date: "Jan 1", cost: 6492, forecast: 6800, optimized: 5520, aiPrediction: 6750 },
  { date: "Jan 8", cost: 6890, forecast: 7100, optimized: 5860, aiPrediction: 7050 },
  { date: "Jan 15", cost: 6650, forecast: 6950, optimized: 5650, aiPrediction: 6900 },
  { date: "Jan 22", cost: 6200, forecast: 6500, optimized: 5270, aiPrediction: 6450 },
  { date: "Jan 29", cost: 6580, forecast: 6850, optimized: 5590, aiPrediction: 6800 },
  { date: "Feb 5", cost: 6390, forecast: 6650, optimized: 5430, aiPrediction: 6620 },
  { date: "Feb 12", cost: 6720, forecast: 7000, optimized: 5710, aiPrediction: 6980 }
]

// GCP Recommendations with AI insights
const gcpRecommendations = [
  {
    id: 1,
    title: "Rightsizing Compute Engine VMs",
    service: "Compute Engine",
    region: "us-central1",
    description: "12 VMs are oversized. Use machine learning recommendations to optimize instance types.",
    impact: "high",
    effort: "low",
    currentCost: 2400,
    projectedCost: 1200,
    savings: 1200,
    confidence: 96,
    resources: ["vm-web-prod-01", "vm-api-prod-02"],
    timeline: "This week",
    gcpSpecific: "Google Cloud Recommender AI-powered",
    mlInsight: "ML analysis shows 80% CPU idle time"
  },
  {
    id: 2,
    title: "Cloud Storage Lifecycle Management",
    service: "Cloud Storage",
    region: "us-east1",
    description: "Implement intelligent tiering for infrequently accessed objects.",
    impact: "medium",
    effort: "low",
    currentCost: 1800,
    projectedCost: 540,
    savings: 1260,
    confidence: 89,
    resources: ["backup-bucket", "archive-data"],
    timeline: "Next week",
    gcpSpecific: "Autoclass for automatic storage optimization",
    mlInsight: "Access pattern analysis suggests 70% can be archived"
  },
  {
    id: 3,
    title: "GKE Cluster Optimization",
    service: "GKE",
    region: "us-west1",
    description: "Enable cluster autoscaling and use spot instances for non-critical workloads.",
    impact: "high",
    effort: "medium",
    currentCost: 2200,
    projectedCost: 1100,
    savings: 1100,
    confidence: 92,
    resources: ["gke-dev-cluster", "gke-staging-cluster"],
    timeline: "This month",
    gcpSpecific: "Node auto-provisioning and spot VMs",
    mlInsight: "Workload patterns show 60% can use preemptible instances"
  },
  {
    id: 4,
    title: "Committed Use Discounts",
    service: "Compute Engine",
    region: "europe-west1",
    description: "Purchase 1-year CUD for predictable workloads to save up to 57%.",
    impact: "high",
    effort: "low",
    currentCost: 1800,
    projectedCost: 774,
    savings: 1026,
    confidence: 95,
    resources: ["prod-workloads"],
    timeline: "This month",
    gcpSpecific: "Flexible CUDs with family conversion",
    mlInsight: "Usage patterns stable enough for long-term commitment"
  }
]

// Carbon footprint data
const carbonData = [
  { region: "us-central1", emissions: 12.5, renewable: 75 },
  { region: "us-east1", emissions: 18.2, renewable: 45 },
  { region: "us-west1", emissions: 8.7, renewable: 95 },
  { region: "europe-west1", emissions: 6.3, renewable: 85 },
  { region: "asia-southeast1", emissions: 22.1, renewable: 35 },
  { region: "asia-northeast1", emissions: 15.8, renewable: 55 }
]

const RegionFilter = ({ regions, selectedRegion, onRegionChange }: {
  regions: typeof gcpRegions
  selectedRegion: string
  onRegionChange: (region: string) => void
}) => (
  <Select value={selectedRegion} onValueChange={onRegionChange}>
    <SelectTrigger className="w-64">
      <SelectValue placeholder="Select Region" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Regions</SelectItem>
      {regions.map(region => (
        <SelectItem key={region.id} value={region.id}>
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>{region.name}</span>
            <span className="text-xs text-muted-foreground">({region.location})</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const GCPServiceDonutChart = ({ data }: { data: typeof gcpServices }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={120}
        paddingAngle={2}
        dataKey="cost"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-green-200">
                <p className="font-medium text-sm">{data.name}</p>
                <p className="text-xs text-muted-foreground">{data.count} resources</p>
                <p className="text-xs">Cost: <span className="font-semibold">${data.cost.toLocaleString('en-US')}</span></p>
                <p className="text-xs">Utilization: <span className="font-semibold">{data.utilization}%</span></p>
              </div>
            )
          }
          return null
        }}
      />
    </PieChart>
  </ResponsiveContainer>
)

const GCPUtilizationChart = ({ data }: { data: typeof gcpUtilizationData }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ComposedChart data={data}>
      <defs>
        <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1}/>
        </linearGradient>
        <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#34A853" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#34A853" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
      <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
      <YAxis stroke="#6B7280" fontSize={12} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-green-200">
                <p className="font-medium text-sm mb-2">{label}</p>
                {payload.map((entry: any, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="capitalize">{entry.dataKey}:</span>
                    <span className="font-semibold">{entry.value}%</span>
                  </div>
                ))}
              </div>
            )
          }
          return null
        }}
      />
      <Area
        type="monotone"
        dataKey="compute"
        stroke="#4285F4"
        strokeWidth={2}
        fill="url(#computeGradient)"
      />
      <Area
        type="monotone"
        dataKey="storage"
        stroke="#34A853"
        strokeWidth={2}
        fill="url(#storageGradient)"
      />
      <Line type="monotone" dataKey="network" stroke="#FBBC04" strokeWidth={2} />
      <Line type="monotone" dataKey="ai" stroke="#EA4335" strokeWidth={2} />
      <Bar dataKey="containers" fill="#FF6F00" />
    </ComposedChart>
  </ResponsiveContainer>
)

const CarbonFootprintChart = ({ data }: { data: typeof carbonData }) => (
  <ResponsiveContainer width="100%" height={300}>
    <ScatterChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
      <XAxis dataKey="renewable" name="Renewable %" stroke="#6B7280" fontSize={12} />
      <YAxis dataKey="emissions" name="Emissions" stroke="#6B7280" fontSize={12} />
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-green-200">
                <p className="font-medium text-sm">{data.region}</p>
                <p className="text-xs">Emissions: <span className="font-semibold">{data.emissions} kg CO2</span></p>
                <p className="text-xs">Renewable: <span className="font-semibold">{data.renewable}%</span></p>
              </div>
            )
          }
          return null
        }}
      />
      <Scatter dataKey="emissions" fill="#34A853" />
    </ScatterChart>
  </ResponsiveContainer>
)

const GCPRecommendationCard = ({ recommendation }: { recommendation: typeof gcpRecommendations[0] }) => {
  const impactColors = {
    high: "from-red-100 to-red-50 border-red-200",
    medium: "from-yellow-100 to-yellow-50 border-yellow-200",
    low: "from-green-100 to-green-50 border-green-200"
  }

  const serviceIcons = {
    "Compute Engine": Server,
    "Cloud Storage": HardDrive,
    "Cloud SQL": Database,
    "GKE": Container
  }

  const ServiceIcon = serviceIcons[recommendation.service as keyof typeof serviceIcons] || Server

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, shadow: "lg" }}
    >
      <Card className={cn("border-l-4 hover:shadow-lg transition-all duration-300", impactColors[recommendation.impact])}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg">
                <ServiceIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{recommendation.title}</h3>
                <p className="text-xs text-muted-foreground">{recommendation.service} • {recommendation.region}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
              {recommendation.confidence}% confidence
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {recommendation.description}
          </p>

          <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2 mb-1">
              <Brain className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-800">AI Insight:</span>
            </div>
            <span className="text-xs text-green-700">{recommendation.mlInsight}</span>
          </div>

          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Cloud className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">GCP Feature:</span>
              <span className="text-xs text-blue-700">{recommendation.gcpSpecific}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-xs">
              <span className="text-muted-foreground">Timeline: </span>
              <span className="font-medium">{recommendation.timeline}</span>
            </div>
            <Badge className={cn("text-xs capitalize",
              recommendation.impact === "high" ? "bg-red-500" :
              recommendation.impact === "medium" ? "bg-yellow-500" : "bg-green-500"
            )}>
              {recommendation.impact} impact
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <div>
                <span className="text-muted-foreground">Current: </span>
                <span className="font-semibold">${recommendation.currentCost}/mo</span>
              </div>
              <div>
                <span className="text-muted-foreground">Projected: </span>
                <span className="font-semibold text-green-600">${recommendation.projectedCost}/mo</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-xs">
                Save ${recommendation.savings}/mo
              </Badge>
              <Button size="sm" className="h-6 px-2 text-xs bg-gradient-to-r from-green-500 to-green-600">
                Apply 🚀
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function GCPCloudPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedTimezone, setSelectedTimezone] = useState("all")
  const [selectedService, setSelectedService] = useState("all")
  const [timeRange, setTimeRange] = useState<number>(7)

  // Fetch real GCP data using the hook
  const { data: gcpCostData, isLoading, error: gcpError, refetch: refetchCost } = useGcpCost({
    timeRangeDays: timeRange
  }, true)

  const handleRefresh = async () => {
    console.log("🔄 Refreshing GCP data...")
    try {
      await refetchCost()
      console.log("✅ Refresh completed")
    } catch (error) {
      console.error("❌ Refresh failed:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/connect-providers")
  }

  // Parse real data from the API response
  const realData = useMemo(() => {
    let computeInstances: any[] = []
    let storageBuckets: any[] = []
    let sqlInstances: any[] = []
    let realRegions: any[] = []

    if (gcpCostData?.success && gcpCostData.data) {
      // Parse compute instances
      const computeData = gcpCostData.data.compute?.content?.[0]?.text
      if (computeData) {
        try {
          const instances = JSON.parse(computeData)
          if (Array.isArray(instances)) {
            computeInstances = instances

            // Extract unique regions from instances
            const regions = new Set<string>()
            instances.forEach((inst: any) => {
              const zone = inst.zone?.split('/').pop() || ''
              const region = zone.substring(0, zone.lastIndexOf('-'))
              if (region) regions.add(region)
            })

            realRegions = Array.from(regions).map(r => ({ id: r, name: r }))
          }
        } catch (e) {
          console.error('Failed to parse compute data:', e)
        }
      }

      // Parse storage
      const storageData = gcpCostData.data.storage?.content?.[0]?.text
      if (storageData) {
        try {
          const buckets = JSON.parse(storageData)
          if (Array.isArray(buckets)) {
            storageBuckets = buckets
          }
        } catch (e) {
          console.error('Failed to parse storage data:', e)
        }
      }

      // Parse SQL
      const sqlData = gcpCostData.data.sql?.content?.[0]?.text
      if (sqlData && !sqlData.includes('STDERR')) {
        try {
          const sql = JSON.parse(sqlData)
          if (Array.isArray(sql)) {
            sqlInstances = sql
          }
        } catch (e) {
          console.error('Failed to parse SQL data:', e)
        }
      }
    }

    return { computeInstances, storageBuckets, sqlInstances, realRegions }
  }, [gcpCostData])

  // Calculate totals from real data
  const totalResources = realData.computeInstances.length + realData.storageBuckets.length + realData.sqlInstances.length
  const runningInstances = realData.computeInstances.filter(i => i.status === 'RUNNING').length
  const hasRealData = totalResources > 0

  // Create dynamic services array from real data
  const dynamicGcpServices = useMemo(() => {
    if (!hasRealData) return gcpServices // Fallback to mock if no real data

    // Estimate costs based on time range (in production, this would come from billing API)
    // Monthly costs: $50/instance, $20/bucket, $150/SQL - scale by timeRange
    const costMultiplier = timeRange / 30 // Scale from monthly to selected period
    const computeCost = runningInstances * 50 * costMultiplier
    const storageCost = realData.storageBuckets.length * 20 * costMultiplier
    const sqlCost = realData.sqlInstances.length * 150 * costMultiplier

    console.log('💰 [GCP] Cost calculation:', {
      timeRange,
      costMultiplier,
      runningInstances,
      storageBuckets: realData.storageBuckets.length,
      sqlInstances: realData.sqlInstances.length,
      computeCost,
      storageCost,
      sqlCost,
      totalCost: computeCost + storageCost + sqlCost
    })

    return [
      {
        name: "Compute Engine",
        count: realData.computeInstances.length,
        cost: computeCost,
        utilization: runningInstances > 0 ? Math.round((runningInstances / realData.computeInstances.length) * 100) : 0,
        color: "#4285F4",
        icon: Server
      },
      {
        name: "Cloud Storage",
        count: realData.storageBuckets.length,
        cost: storageCost,
        utilization: realData.storageBuckets.length > 0 ? 85 : 0,
        color: "#34A853",
        icon: HardDrive
      },
      {
        name: "Cloud SQL",
        count: realData.sqlInstances.length,
        cost: sqlCost,
        utilization: realData.sqlInstances.length > 0 ? 82 : 0,
        color: "#FBBC04",
        icon: Database
      }
    ].filter(s => s.count > 0) // Only show services with resources
  }, [realData, hasRealData, runningInstances, timeRange])

  // Create dynamic regions array from real data
  const dynamicGcpRegions = useMemo(() => {
    if (!hasRealData || realData.realRegions.length === 0) return gcpRegions // Fallback to mock

    const costMultiplier = timeRange / 30 // Scale from monthly to selected period

    return realData.realRegions.map(region => {
      // Count resources in this region
      const regionResources = realData.computeInstances.filter(i => {
        const zone = i.zone?.split('/').pop() || ''
        return zone.startsWith(region.id)
      }).length

      // Estimate cost based on resources and time range
      const estimatedCost = regionResources * 50 * costMultiplier

      return {
        id: region.id,
        name: region.name,
        timezone: "UTC", // Would need region metadata for accurate timezone
        resources: regionResources,
        cost: estimatedCost,
        location: region.name
      }
    })
  }, [realData, hasRealData, timeRange])

  // Filter data based on selections - use dynamic data if available
  const filteredRegions = useMemo(() => {
    let regions = hasRealData ? dynamicGcpRegions : gcpRegions
    if (selectedTimezone !== "all") {
      regions = regions.filter(r => r.timezone === selectedTimezone)
    }
    return regions
  }, [selectedTimezone, dynamicGcpRegions, hasRealData])

  const totalCost = filteredRegions.reduce((sum, region) => sum + region.cost, 0)
  const totalSavings = gcpRecommendations.reduce((sum, rec) => sum + rec.savings, 0)
  const avgUtilization = dynamicGcpServices.length > 0
    ? Math.round(dynamicGcpServices.reduce((sum, service) => sum + service.utilization, 0) / dynamicGcpServices.length)
    : 0

  // Show error state
  if (gcpError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 p-6 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Error Loading GCP Data</h2>
          <p className="text-muted-foreground mb-4">{gcpError.message || 'Failed to load GCP resources'}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Google Cloud Management 🌟
              </h1>
              <p className="text-muted-foreground">
                {isLoading ? "Loading real-time data..." : hasRealData ? `Real-time data • ${totalResources} resources found` : "No GCP resources found - showing demo data"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Sync
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none hover:from-green-600 hover:to-green-700">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-300">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>

                <RegionFilter
                  regions={dynamicGcpRegions}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                />

                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {dynamicGcpServices.map(service => (
                      <SelectItem key={service.name} value={service.name}>
                        <div className="flex items-center space-x-2">
                          <service.icon className="h-3 w-3" />
                          <span>{service.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 ml-auto">
                  <span className="text-sm text-muted-foreground">
                    {totalResources} resources • ${totalCost.toLocaleString('en-US')} ({timeRange} days)
                    {hasRealData && <Badge className="ml-2 bg-green-500">Real Data</Badge>}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Total Spend ({timeRange}d)</p>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                      <span className="text-sm text-green-600">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-bold text-green-900">
                          ${totalCost.toLocaleString('en-US')}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          ({timeRange === 1 ? '24hrs' : timeRange + ' days'})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        {hasRealData ? (
                          <span className="text-xs text-blue-600 font-medium">Real-time data</span>
                        ) : (
                          <span className="text-xs text-gray-500">Demo data</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Total Resources</p>
                  <p className="text-2xl font-bold text-blue-900">{totalResources}</p>
                  <p className="text-xs text-blue-600">{runningInstances} running • {realData.computeInstances.length} instances</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-800 font-medium">AI Savings</p>
                  <p className="text-2xl font-bold text-purple-900">${totalSavings.toLocaleString('en-US')}</p>
                  <p className="text-xs text-purple-600">{gcpRecommendations.length} ML recommendations</p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-800 font-medium">Avg Utilization</p>
                  <p className="text-2xl font-bold text-orange-900">{avgUtilization}%</p>
                  <p className="text-xs text-orange-600">Across all services</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <span>GCP Service Distribution 🥧</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GCPServiceDonutChart data={dynamicGcpServices} />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {dynamicGcpServices.slice(0, 4).map((service, index) => (
                      <div key={service.name} className="flex items-center space-x-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <span>{service.name}: ${service.cost.toLocaleString('en-US')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>Regional Overview 🌏</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredRegions.slice(0, 6).map((region, index) => (
                      <motion.div
                        key={region.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{region.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.resources} resources • {region.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">${region.cost.toLocaleString('en-US')}</div>
                          <div className="text-xs text-muted-foreground">monthly</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            {/* Real Compute Instances */}
            {realData.computeInstances.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="h-5 w-5 text-blue-600" />
                    <span>Compute Engine Instances ({realData.computeInstances.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {realData.computeInstances.map((instance, idx) => {
                      const zone = instance.zone?.split('/').pop() || ''
                      const machineType = instance.machineType?.split('/').pop() || ''
                      const isRunning = instance.status === 'RUNNING'

                      return (
                        <div key={instance.id || idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                isRunning ? "bg-green-500" : "bg-gray-400"
                              )} />
                              <div>
                                <h4 className="font-semibold">{instance.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {machineType} • {zone}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={isRunning ? "default" : "secondary"} className="mb-1">
                              {instance.status}
                            </Badge>
                            {instance.networkInterfaces?.[0]?.accessConfigs?.[0]?.natIP && (
                              <p className="text-xs text-muted-foreground">
                                IP: {instance.networkInterfaces[0].accessConfigs[0].natIP}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dynamicGcpServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-green-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className="p-2 rounded-lg text-white group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: service.color }}
                        >
                          <service.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{service.name}</h3>
                          <p className="text-xs text-muted-foreground">{service.count} resources</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className="font-medium">{service.utilization}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-1000"
                            style={{
                              width: `${service.utilization}%`,
                              backgroundColor: service.color
                            }}
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${service.cost.toLocaleString('en-US')}
                          </div>
                          <div className="text-xs text-muted-foreground">monthly cost</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Utilization Tab */}
          <TabsContent value="utilization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span>GCP Resource Utilization 📊</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GCPUtilizationChart data={gcpUtilizationData} />
                <div className="grid grid-cols-5 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Compute</div>
                    <div className="text-lg font-bold text-blue-600">78%</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Storage</div>
                    <div className="text-lg font-bold text-green-600">85%</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">Network</div>
                    <div className="text-lg font-bold text-yellow-600">68%</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800">AI/ML</div>
                    <div className="text-lg font-bold text-red-600">72%</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">Containers</div>
                    <div className="text-lg font-bold text-orange-600">88%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>AI-Enhanced Cost Prediction 🧠</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={gcpCostTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cost" stroke="#34A853" strokeWidth={3} name="Actual" />
                      <Line type="monotone" dataKey="forecast" stroke="#FBBC04" strokeWidth={2} strokeDasharray="5 5" name="Traditional Forecast" />
                      <Line type="monotone" dataKey="aiPrediction" stroke="#4285F4" strokeWidth={2} name="AI Prediction" />
                      <Line type="monotone" dataKey="optimized" stroke="#EA4335" strokeWidth={2} name="Optimized" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Cost Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-medium">Current Spend</span>
                      <span className="font-bold text-green-600">${totalCost.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="font-medium">Traditional Forecast</span>
                      <span className="font-bold text-yellow-600">$7,000</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium">AI Prediction</span>
                      <span className="font-bold text-blue-600">$6,980</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-medium">With AI Optimization</span>
                      <span className="font-bold text-red-600">$5,710</span>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${totalSavings.toLocaleString('en-US')}/month
                      </div>
                      <div className="text-sm text-muted-foreground">AI-powered savings potential</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  <span>Carbon Footprint Analysis 🌱</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CarbonFootprintChart data={carbonData} />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg text-green-800">Sustainability Insights</h3>
                    {carbonData.map((region, index) => (
                      <motion.div
                        key={region.region}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div>
                          <span className="font-medium text-sm">{region.region}</span>
                          <div className="text-xs text-muted-foreground">
                            {region.renewable}% renewable energy
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{region.emissions} kg CO2</div>
                          <div className="text-xs text-muted-foreground">per month</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai-recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>AI-Powered Recommendations 🤖</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gcpRecommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GCPRecommendationCard recommendation={rec} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 rounded-full border border-green-300">
            <Heart className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Google Cloud Management - Powered by AI and sustainable innovation 💚
            </span>
            <Sparkles className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  )
}