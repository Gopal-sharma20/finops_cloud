"use client"

import React, { useState, useMemo } from "react"
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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
  Container
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Azure Regions with timezones
const azureRegions = [
  { id: "eastus", name: "East US", timezone: "UTC-5", resources: 234, cost: 12890, location: "Virginia" },
  { id: "westus2", name: "West US 2", timezone: "UTC-8", resources: 189, cost: 9870, location: "Washington" },
  { id: "westeurope", name: "West Europe", timezone: "UTC+1", resources: 156, cost: 8650, location: "Netherlands" },
  { id: "eastasia", name: "East Asia", timezone: "UTC+8", resources: 98, cost: 5340, location: "Hong Kong" },
  { id: "japaneast", name: "Japan East", timezone: "UTC+9", resources: 76, cost: 4890, location: "Tokyo" },
  { id: "canadacentral", name: "Canada Central", timezone: "UTC-5", resources: 45, cost: 3120, location: "Toronto" },
  { id: "northeurope", name: "North Europe", timezone: "UTC+0", resources: 67, cost: 4590, location: "Ireland" },
  { id: "southeastasia", name: "Southeast Asia", timezone: "UTC+8", resources: 54, cost: 3840, location: "Singapore" }
]

// Azure Services data
const azureServices = [
  { name: "Virtual Machines", count: 89, cost: 8940, utilization: 72, color: "#0078D4", icon: Server },
  { name: "Storage Accounts", count: 156, cost: 4520, utilization: 68, color: "#40E0D0", icon: HardDrive },
  { name: "SQL Database", count: 34, cost: 6850, utilization: 84, color: "#7B68EE", icon: Database },
  { name: "App Service", count: 67, cost: 3890, utilization: 76, color: "#32CD32", icon: Globe },
  { name: "Functions", count: 123, cost: 1340, utilization: 45, color: "#FF69B4", icon: Zap },
  { name: "Virtual Network", count: 28, cost: 2120, utilization: 58, color: "#FFD700", icon: Network },
  { name: "Container Instances", count: 45, cost: 2890, utilization: 82, color: "#FF6347", icon: Container },
  { name: "Cognitive Services", count: 18, cost: 1890, utilization: 67, color: "#9370DB", icon: Brain }
]

// Azure-specific utilization patterns
const azureUtilizationData = [
  { time: "00:00", compute: 28, storage: 35, network: 18, database: 42 },
  { time: "03:00", compute: 22, storage: 32, network: 15, database: 38 },
  { time: "06:00", compute: 45, storage: 48, network: 32, database: 55 },
  { time: "09:00", compute: 78, storage: 72, network: 68, database: 82 },
  { time: "12:00", compute: 88, storage: 85, network: 82, database: 89 },
  { time: "15:00", compute: 92, storage: 88, network: 85, database: 91 },
  { time: "18:00", compute: 75, storage: 78, network: 72, database: 79 },
  { time: "21:00", compute: 48, storage: 52, network: 38, database: 58 }
]

// Azure cost trends
const azureCostTrends = [
  { date: "Jan 1", cost: 12890, forecast: 13200, optimized: 10950 },
  { date: "Jan 8", cost: 13450, forecast: 13600, optimized: 11400 },
  { date: "Jan 15", cost: 12980, forecast: 13800, optimized: 11020 },
  { date: "Jan 22", cost: 12100, forecast: 12800, optimized: 10280 },
  { date: "Jan 29", cost: 12650, forecast: 13100, optimized: 10750 },
  { date: "Feb 5", cost: 12390, forecast: 12900, optimized: 10530 },
  { date: "Feb 12", cost: 12780, forecast: 13300, optimized: 10860 }
]

// Azure Recommendations
const azureRecommendations = [
  {
    id: 1,
    title: "Resize Virtual Machines",
    service: "Virtual Machines",
    region: "eastus",
    description: "8 VMs are under-utilized. Resize to Standard_B2s for better cost efficiency.",
    impact: "high",
    effort: "low",
    currentCost: 2800,
    projectedCost: 1400,
    savings: 1400,
    confidence: 94,
    resources: ["vm-web-01", "vm-api-02"],
    timeline: "This week",
    azureSpecific: "Use Azure Advisor recommendations"
  },
  {
    id: 2,
    title: "Optimize Storage Tiers",
    service: "Storage Accounts",
    region: "westeurope",
    description: "Move blob data to cool/archive tiers based on access patterns.",
    impact: "medium",
    effort: "low",
    currentCost: 1800,
    projectedCost: 720,
    savings: 1080,
    confidence: 89,
    resources: ["storage-backup", "storage-archive"],
    timeline: "Next week",
    azureSpecific: "Enable lifecycle management policies"
  },
  {
    id: 3,
    title: "Reserved Instances for SQL",
    service: "SQL Database",
    region: "eastus",
    description: "Purchase 1-year reserved capacity for production databases.",
    impact: "high",
    effort: "low",
    currentCost: 3200,
    projectedCost: 1920,
    savings: 1280,
    confidence: 96,
    resources: ["sql-prod-db"],
    timeline: "This month",
    azureSpecific: "Azure Reservations available"
  },
  {
    id: 4,
    title: "App Service Plan Optimization",
    service: "App Service",
    region: "westus2",
    description: "Consolidate apps into fewer Premium plans or use consumption model.",
    impact: "medium",
    effort: "medium",
    currentCost: 1200,
    projectedCost: 600,
    savings: 600,
    confidence: 82,
    resources: ["app-dev", "app-staging"],
    timeline: "Next month",
    azureSpecific: "Consider Azure Functions for serverless"
  }
]

// Azure Security and Compliance data
const azureSecurityData = [
  { category: "Identity", score: 92, max: 100 },
  { category: "Data Protection", score: 85, max: 100 },
  { category: "Network Security", score: 88, max: 100 },
  { category: "Compliance", score: 94, max: 100 },
  { category: "Threat Protection", score: 87, max: 100 },
  { category: "Governance", score: 91, max: 100 }
]

const RegionFilter = ({ regions, selectedRegion, onRegionChange }: {
  regions: typeof azureRegions
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

const AzureServiceDonutChart = ({ data }: { data: typeof azureServices }) => (
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
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200">
                <p className="font-medium text-sm">{data.name}</p>
                <p className="text-xs text-muted-foreground">{data.count} resources</p>
                <p className="text-xs">Cost: <span className="font-semibold">${data.cost.toLocaleString()}</span></p>
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

const AzureUtilizationChart = ({ data }: { data: typeof azureUtilizationData }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#0078D4" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#0078D4" stopOpacity={0.1}/>
        </linearGradient>
        <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#40E0D0" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#40E0D0" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
      <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
      <YAxis stroke="#6B7280" fontSize={12} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200">
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
        stroke="#0078D4"
        strokeWidth={2}
        fill="url(#computeGradient)"
      />
      <Area
        type="monotone"
        dataKey="storage"
        stroke="#40E0D0"
        strokeWidth={2}
        fill="url(#storageGradient)"
      />
      <Line type="monotone" dataKey="network" stroke="#FFD700" strokeWidth={2} />
      <Line type="monotone" dataKey="database" stroke="#7B68EE" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
)

const AzureSecurityRadar = ({ data }: { data: typeof azureSecurityData }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
      <PolarRadiusAxis
        angle={90}
        domain={[0, 100]}
        tick={{ fontSize: 10 }}
      />
      <Radar
        name="Security Score"
        dataKey="score"
        stroke="#0078D4"
        fill="#0078D4"
        fillOpacity={0.2}
        strokeWidth={2}
      />
      <Tooltip
        content={({ active, payload }) => {
          if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-blue-200">
                <p className="font-medium text-sm">{data.category}</p>
                <p className="text-xs">Score: <span className="font-semibold">{data.score}/100</span></p>
              </div>
            )
          }
          return null
        }}
      />
    </RadarChart>
  </ResponsiveContainer>
)

const AzureRecommendationCard = ({ recommendation }: { recommendation: typeof azureRecommendations[0] }) => {
  const impactColors = {
    high: "from-red-100 to-red-50 border-red-200",
    medium: "from-yellow-100 to-yellow-50 border-yellow-200",
    low: "from-green-100 to-green-50 border-green-200"
  }

  const serviceIcons = {
    "Virtual Machines": Server,
    "Storage Accounts": HardDrive,
    "SQL Database": Database,
    "App Service": Globe
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
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg">
                <ServiceIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{recommendation.title}</h3>
                <p className="text-xs text-muted-foreground">{recommendation.service} • {recommendation.region}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
              {recommendation.confidence}% confidence
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {recommendation.description}
          </p>

          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Azure Insight:</span>
              <span className="text-xs text-blue-700">{recommendation.azureSpecific}</span>
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
              <Button size="sm" className="h-6 px-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600">
                Apply 🔧
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AzureCloudPage() {
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedTimezone, setSelectedTimezone] = useState("all")
  const [selectedService, setSelectedService] = useState("all")

  // Filter data based on selections
  const filteredRegions = useMemo(() => {
    let regions = azureRegions
    if (selectedTimezone !== "all") {
      regions = regions.filter(r => r.timezone === selectedTimezone)
    }
    return regions
  }, [selectedTimezone])

  const totalCost = filteredRegions.reduce((sum, region) => sum + region.cost, 0)
  const totalResources = filteredRegions.reduce((sum, region) => sum + region.resources, 0)
  const totalSavings = azureRecommendations.reduce((sum, rec) => sum + rec.savings, 0)
  const avgSecurityScore = Math.round(azureSecurityData.reduce((sum, item) => sum + item.score, 0) / azureSecurityData.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Azure Cloud Management 🌐
              </h1>
              <p className="text-muted-foreground">Intelligent resource discovery and optimization with Azure insights</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
              <Settings className="h-4 w-4 mr-2" />
              Configure
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
                  regions={azureRegions}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                />

                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {azureServices.map(service => (
                      <SelectItem key={service.name} value={service.name}>
                        <div className="flex items-center space-x-2">
                          <service.icon className="h-3 w-3" />
                          <span>{service.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2 ml-auto">
                  <span className="text-sm text-muted-foreground">
                    {totalResources} resources • ${totalCost.toLocaleString()} monthly
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Monthly Spend</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${totalCost.toLocaleString()}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">5% vs last month</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-800 font-medium">Total Resources</p>
                  <p className="text-2xl font-bold text-purple-900">{totalResources}</p>
                  <p className="text-xs text-purple-600">Across {filteredRegions.length} regions</p>
                </div>
                <Server className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-900">${totalSavings.toLocaleString()}</p>
                  <p className="text-xs text-green-600">{azureRecommendations.length} recommendations</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-800 font-medium">Security Score</p>
                  <p className="text-2xl font-bold text-indigo-900">{avgSecurityScore}/100</p>
                  <p className="text-xs text-indigo-600">Azure Security Center</p>
                </div>
                <Shield className="h-8 w-8 text-indigo-600" />
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
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Azure Service Distribution 📊</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AzureServiceDonutChart data={azureServices} />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {azureServices.slice(0, 4).map((service, index) => (
                      <div key={service.name} className="flex items-center space-x-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <span>{service.name}: ${service.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Regional Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <span>Regional Overview 🌍</span>
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
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{region.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.resources} resources • {region.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">${region.cost.toLocaleString()}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {azureServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:border-blue-300">
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
                          <div className="text-lg font-bold text-blue-600">
                            ${service.cost.toLocaleString()}
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
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Azure Resource Utilization 📈</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AzureUtilizationChart data={azureUtilizationData} />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Compute</div>
                    <div className="text-lg font-bold text-blue-600">72%</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-sm font-medium text-teal-800">Storage</div>
                    <div className="text-lg font-bold text-teal-600">68%</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">Network</div>
                    <div className="text-lg font-bold text-yellow-600">58%</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Database</div>
                    <div className="text-lg font-bold text-purple-600">84%</div>
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
                    <span>Cost Trends 💰</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={azureCostTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="cost" stroke="#0078D4" strokeWidth={3} />
                      <Line type="monotone" dataKey="forecast" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" />
                      <Line type="monotone" dataKey="optimized" stroke="#40E0D0" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimization Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="font-medium">Current Spend</span>
                      <span className="font-bold text-blue-600">${totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-medium">Forecasted (No Action)</span>
                      <span className="font-bold text-red-600">$13,300</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-medium">With Optimization</span>
                      <span className="font-bold text-green-600">$10,860</span>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${totalSavings.toLocaleString()}/month
                      </div>
                      <div className="text-sm text-muted-foreground">Potential savings with Azure optimization</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span>Azure Security Assessment 🛡️</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AzureSecurityRadar data={azureSecurityData} />
                  <div className="space-y-3">
                    {azureSecurityData.map((item, index) => (
                      <motion.div
                        key={item.category}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <span className="font-medium text-sm">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="h-2 bg-indigo-500 rounded-full transition-all duration-1000"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-indigo-600">{item.score}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Azure-Powered Recommendations 🎯</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {azureRecommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AzureRecommendationCard recommendation={rec} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full border border-blue-300">
            <Heart className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Azure Cloud Management - Powered by intelligence and love 💙
            </span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}