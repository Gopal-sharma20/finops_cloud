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
  AreaChart
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
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// AWS Regions with timezones
const awsRegions = [
  { id: "us-east-1", name: "US East (N. Virginia)", timezone: "UTC-5", resources: 347, cost: 28450 },
  { id: "us-west-2", name: "US West (Oregon)", timezone: "UTC-8", resources: 256, cost: 18920 },
  { id: "eu-west-1", name: "Europe (Ireland)", timezone: "UTC+0", resources: 189, cost: 15650 },
  { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", timezone: "UTC+8", resources: 98, cost: 8340 },
  { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)", timezone: "UTC+9", resources: 76, cost: 6890 },
  { id: "ca-central-1", name: "Canada (Central)", timezone: "UTC-5", resources: 45, cost: 4120 },
  { id: "eu-central-1", name: "Europe (Frankfurt)", timezone: "UTC+1", resources: 67, cost: 5890 },
  { id: "ap-south-1", name: "Asia Pacific (Mumbai)", timezone: "UTC+5:30", resources: 34, cost: 3240 }
]

// AWS Services data
const awsServices = [
  { name: "EC2", count: 145, cost: 18240, utilization: 65, color: "#FF9900", icon: Server },
  { name: "EBS", count: 289, cost: 8920, utilization: 78, color: "#FF6B6B", icon: HardDrive },
  { name: "S3", count: 67, cost: 6540, utilization: 85, color: "#4ECDC4", icon: Database },
  { name: "RDS", count: 23, cost: 7850, utilization: 72, color: "#45B7D1", icon: Database },
  { name: "Lambda", count: 156, cost: 2340, utilization: 45, color: "#96CEB4", icon: Zap },
  { name: "VPC", count: 34, cost: 4120, utilization: 68, color: "#FFEAA7", icon: Network },
  { name: "ELB", count: 28, cost: 3890, utilization: 82, color: "#DDA0DD", icon: Network },
  { name: "CloudFront", count: 12, cost: 1890, utilization: 67, color: "#98D8C8", icon: Globe }
]

// Time-based utilization data
const utilizationData = [
  { time: "00:00", cpu: 25, memory: 30, network: 15, storage: 45 },
  { time: "03:00", cpu: 18, memory: 25, network: 12, storage: 42 },
  { time: "06:00", cpu: 35, memory: 40, network: 28, storage: 48 },
  { time: "09:00", cpu: 75, memory: 70, network: 65, storage: 55 },
  { time: "12:00", cpu: 85, memory: 80, network: 78, storage: 62 },
  { time: "15:00", cpu: 90, memory: 85, network: 82, storage: 68 },
  { time: "18:00", cpu: 78, memory: 75, network: 72, storage: 58 },
  { time: "21:00", cpu: 45, memory: 50, network: 35, storage: 52 }
]

// Cost trends over time
const costTrends = [
  { date: "Jan 1", cost: 28450, forecast: 28800, optimized: 24200 },
  { date: "Jan 8", cost: 29200, forecast: 29400, optimized: 24800 },
  { date: "Jan 15", cost: 28890, forecast: 29800, optimized: 24500 },
  { date: "Jan 22", cost: 27800, forecast: 28200, optimized: 23600 },
  { date: "Jan 29", cost: 28100, forecast: 28600, optimized: 23900 },
  { date: "Feb 5", cost: 27900, forecast: 28400, optimized: 23700 },
  { date: "Feb 12", cost: 28300, forecast: 28900, optimized: 24100 }
]

// FinOps Recommendations
const awsRecommendations = [
  {
    id: 1,
    title: "Rightsize EC2 Instances",
    service: "EC2",
    region: "us-east-1",
    description: "15 instances running at <20% CPU. Downsize to save costs.",
    impact: "high",
    effort: "low",
    currentCost: 4800,
    projectedCost: 2400,
    savings: 2400,
    confidence: 95,
    resources: ["i-0123456789abcdef0", "i-0987654321fedcba0"],
    timeline: "Immediate"
  },
  {
    id: 2,
    title: "Enable S3 Intelligent Tiering",
    service: "S3",
    region: "us-west-2",
    description: "Move infrequently accessed data to cheaper storage classes.",
    impact: "medium",
    effort: "low",
    currentCost: 1200,
    projectedCost: 480,
    savings: 720,
    confidence: 87,
    resources: ["backup-bucket", "archive-storage"],
    timeline: "This week"
  },
  {
    id: 3,
    title: "Schedule Lambda Functions",
    service: "Lambda",
    region: "eu-west-1",
    description: "Implement scheduling for dev/test Lambda functions.",
    impact: "medium",
    effort: "medium",
    currentCost: 890,
    projectedCost: 380,
    savings: 510,
    confidence: 82,
    resources: ["dev-processor", "test-validator"],
    timeline: "Next week"
  },
  {
    id: 4,
    title: "Reserved Instance Opportunity",
    service: "RDS",
    region: "us-east-1",
    description: "Purchase RI for prod database to save 40% on costs.",
    impact: "high",
    effort: "low",
    currentCost: 2400,
    projectedCost: 1440,
    savings: 960,
    confidence: 92,
    resources: ["prod-db-cluster"],
    timeline: "This month"
  }
]

const RegionFilter = ({ regions, selectedRegion, onRegionChange }: {
  regions: typeof awsRegions
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
            <span className="text-xs text-muted-foreground">({region.timezone})</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const TimezoneFilter = ({ selectedTimezone, onTimezoneChange }: {
  selectedTimezone: string
  onTimezoneChange: (timezone: string) => void
}) => {
  const timezones = Array.from(new Set(awsRegions.map(r => r.timezone)))

  return (
    <Select value={selectedTimezone} onValueChange={onTimezoneChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select Timezone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Timezones</SelectItem>
        {timezones.map(tz => (
          <SelectItem key={tz} value={tz}>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3" />
              <span>{tz}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const ServiceDonutChart = ({ data }: { data: typeof awsServices }) => (
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
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-orange-200">
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

const UtilizationChart = ({ data }: { data: typeof utilizationData }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#FF9900" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#FF9900" stopOpacity={0.1}/>
        </linearGradient>
        <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#45B7D1" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#45B7D1" stopOpacity={0.1}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
      <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
      <YAxis stroke="#6B7280" fontSize={12} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-orange-200">
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
        dataKey="cpu"
        stroke="#FF9900"
        strokeWidth={2}
        fill="url(#cpuGradient)"
      />
      <Area
        type="monotone"
        dataKey="memory"
        stroke="#45B7D1"
        strokeWidth={2}
        fill="url(#memoryGradient)"
      />
      <Line type="monotone" dataKey="network" stroke="#4ECDC4" strokeWidth={2} />
      <Line type="monotone" dataKey="storage" stroke="#96CEB4" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
)

const CostTrendChart = ({ data }: { data: typeof costTrends }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
      <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
      <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
      <Tooltip
        content={({ active, payload, label }) => {
          if (active && payload && payload.length) {
            return (
              <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-orange-200">
                <p className="font-medium text-sm mb-2">{label}</p>
                {payload.map((entry: any, index) => (
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
        }}
      />
      <Line
        type="monotone"
        dataKey="cost"
        stroke="#FF9900"
        strokeWidth={3}
        dot={{ fill: "#FF9900", strokeWidth: 2, r: 4 }}
      />
      <Line
        type="monotone"
        dataKey="forecast"
        stroke="#FF6B6B"
        strokeWidth={2}
        strokeDasharray="5 5"
        dot={{ fill: "#FF6B6B", strokeWidth: 2, r: 3 }}
      />
      <Line
        type="monotone"
        dataKey="optimized"
        stroke="#4ECDC4"
        strokeWidth={2}
        dot={{ fill: "#4ECDC4", strokeWidth: 2, r: 3 }}
      />
    </LineChart>
  </ResponsiveContainer>
)

const RecommendationCard = ({ recommendation }: { recommendation: typeof awsRecommendations[0] }) => {
  const impactColors = {
    high: "from-red-100 to-red-50 border-red-200",
    medium: "from-yellow-100 to-yellow-50 border-yellow-200",
    low: "from-green-100 to-green-50 border-green-200"
  }

  const serviceIcons = {
    EC2: Server,
    S3: Database,
    Lambda: Zap,
    RDS: Database
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
              <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg">
                <ServiceIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{recommendation.title}</h3>
                <p className="text-xs text-muted-foreground">{recommendation.service} • {recommendation.region}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {recommendation.confidence}% confidence
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {recommendation.description}
          </p>

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
              <Button size="sm" className="h-6 px-2 text-xs bg-gradient-to-r from-orange-500 to-orange-600">
                Apply ✨
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AWSCloudPage() {
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedTimezone, setSelectedTimezone] = useState("all")
  const [selectedService, setSelectedService] = useState("all")

  // Filter data based on selections
  const filteredRegions = useMemo(() => {
    let regions = awsRegions
    if (selectedTimezone !== "all") {
      regions = regions.filter(r => r.timezone === selectedTimezone)
    }
    return regions
  }, [selectedTimezone])

  const filteredServices = useMemo(() => {
    return awsServices
  }, [selectedRegion, selectedService])

  const totalCost = filteredRegions.reduce((sum, region) => sum + region.cost, 0)
  const totalResources = filteredRegions.reduce((sum, region) => sum + region.resources, 0)
  const totalSavings = awsRecommendations.reduce((sum, rec) => sum + rec.savings, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                AWS Cloud Management 🚀
              </h1>
              <p className="text-muted-foreground">Comprehensive resource discovery and FinOps optimization</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
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
                  regions={awsRegions}
                  selectedRegion={selectedRegion}
                  onRegionChange={setSelectedRegion}
                />

                <TimezoneFilter
                  selectedTimezone={selectedTimezone}
                  onTimezoneChange={setSelectedTimezone}
                />

                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {awsServices.map(service => (
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
                    {totalResources} resources • ${totalCost.toLocaleString('en-US')} monthly
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
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-800 font-medium">Monthly Spend</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ${totalCost.toLocaleString('en-US')}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">3% vs last month</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Total Resources</p>
                  <p className="text-2xl font-bold text-blue-900">{totalResources}</p>
                  <p className="text-xs text-blue-600">Across {filteredRegions.length} regions</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Potential Savings</p>
                  <p className="text-2xl font-bold text-green-900">${totalSavings.toLocaleString('en-US')}</p>
                  <p className="text-xs text-green-600">{awsRecommendations.length} recommendations</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-800 font-medium">Avg Utilization</p>
                  <p className="text-2xl font-bold text-purple-900">68%</p>
                  <p className="text-xs text-purple-600">Across all services</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    <span>Service Cost Distribution 🥧</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceDonutChart data={filteredServices} />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {filteredServices.slice(0, 4).map((service, index) => (
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
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-sm">{region.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {region.resources} resources • {region.timezone}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
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
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span>24-Hour Utilization Trends 📊</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UtilizationChart data={utilizationData} />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">CPU</div>
                    <div className="text-lg font-bold text-orange-600">68%</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Memory</div>
                    <div className="text-lg font-bold text-blue-600">72%</div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-sm font-medium text-teal-800">Network</div>
                    <div className="text-lg font-bold text-teal-600">55%</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Storage</div>
                    <div className="text-lg font-bold text-green-600">52%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Cost Trends & Forecasting 💰</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostTrendChart data={costTrends} />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="text-sm font-medium text-orange-800">Current Spend</div>
                    <div className="text-lg font-bold text-orange-600">${totalCost.toLocaleString('en-US')}</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-800">Forecasted</div>
                    <div className="text-lg font-bold text-red-600">$28,900</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800">Optimized</div>
                    <div className="text-lg font-bold text-green-600">$24,100</div>
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
                  <Target className="h-5 w-5 text-purple-600" />
                  <span>FinOps Recommendations 🎯</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {awsRecommendations.map((rec, index) => (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <RecommendationCard recommendation={rec} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full border border-orange-300">
            <Heart className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              AWS Cloud Management - Built with love and intelligence 🧡
            </span>
            <Sparkles className="h-4 w-4 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
