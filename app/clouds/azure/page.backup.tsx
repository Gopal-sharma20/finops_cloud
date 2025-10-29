"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Filter,
  MapPin,
  Settings,
  Download,
  RefreshCw,
  Heart,
  Sparkles,
  Loader2,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useAzureProfiles } from "@/hooks/useAzureProfile"
import { logout } from "@/lib/auth/logout"
import { useAzureCost } from "@/hooks/useAzureCost"
import {
  transformCostToServices,
  transformRegionalCosts,
  estimateRegionalCosts,
  generateCostTrends,
  generateUtilizationData,
  generateSecurityData,
} from "@/lib/azure/transform"

const RegionFilter = ({ regions, selectedRegion, onRegionChange }: {
  regions: any[]
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

const AzureServiceDonutChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No service data available
      </div>
    )
  }

  return (
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
}

const AzureUtilizationChart = ({ data }: { data: any[] }) => (
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
                    <span className="font-semibold">{Math.round(entry.value)}%</span>
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

const AzureSecurityRadar = ({ data }: { data: any[] }) => (
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

export default function AzureCloudPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedTimezone, setSelectedTimezone] = useState("all")
  const [selectedService, setSelectedService] = useState("all")
  const [timeRange, setTimeRange] = useState<number>(7)

  // Fetch real Azure data
  const { data: azureProfiles, isLoading: profilesLoading } = useAzureProfiles()
  const { data: azureCostData, isLoading: costLoading, refetch: refetchCost } = useAzureCost({
    allProfiles: true,
    timeRangeDays: timeRange,
    groupBy: "ServiceName"
  }, !!azureProfiles?.profiles?.length)

  const isLoading = profilesLoading || costLoading

  // Transform real data
  const realData = useMemo(() => {
    let totalCost = 0
    let serviceBreakdown: Record<string, number> = {}
    let regionBreakdown: Record<string, number> = {}

    if (azureCostData?.accounts_cost_data) {
      Object.values(azureCostData.accounts_cost_data).forEach((account: any) => {
        if (account["Total Cost"]) {
          totalCost += parseFloat(account["Total Cost"]) || 0
        }

        // Aggregate service costs
        const serviceCosts = account["Cost By ServiceName"] || account.services || {}
        Object.entries(serviceCosts).forEach(([service, cost]: [string, any]) => {
          if (typeof cost === 'number' || typeof cost === 'string') {
            const costValue = typeof cost === 'string' ? parseFloat(cost) : cost
            if (costValue > 0) {
              serviceBreakdown[service] = (serviceBreakdown[service] || 0) + costValue
            }
          }
        })

        // Aggregate region costs if available
        const regionCosts = account["Cost By ResourceLocation"] || account.regions || {}
        Object.entries(regionCosts).forEach(([region, cost]: [string, any]) => {
          if (typeof cost === 'number' || typeof cost === 'string') {
            const costValue = typeof cost === 'string' ? parseFloat(cost) : cost
            if (costValue > 0) {
              regionBreakdown[region] = (regionBreakdown[region] || 0) + costValue
            }
          }
        })
      })
    }

    return { totalCost, serviceBreakdown, regionBreakdown }
  }, [azureCostData])

  // Transform services
  const services = useMemo(() => {
    if (Object.keys(realData.serviceBreakdown).length > 0) {
      return transformCostToServices(realData.serviceBreakdown)
    }
    return []
  }, [realData.serviceBreakdown])

  // Transform regions
  const regions = useMemo(() => {
    if (Object.keys(realData.regionBreakdown).length > 0) {
      return transformRegionalCosts(realData.regionBreakdown, services)
    } else if (realData.totalCost > 0 && services.length > 0) {
      // Estimate regions if regional data not available
      return estimateRegionalCosts(realData.totalCost, services)
    }
    return []
  }, [realData.regionBreakdown, realData.totalCost, services])

  // Generate cost trends and utilization
  const costTrends = useMemo(() => {
    if (realData.totalCost > 0) {
      return generateCostTrends(realData.totalCost)
    }
    return []
  }, [realData.totalCost])

  const utilizationData = useMemo(() => generateUtilizationData(), [])
  const securityData = useMemo(() => generateSecurityData(), [])

  // Filter data based on selections
  const filteredRegions = useMemo(() => {
    let filtered = regions
    if (selectedTimezone !== "all") {
      filtered = filtered.filter(r => r.timezone === selectedTimezone)
    }
    if (selectedRegion !== "all") {
      filtered = filtered.filter(r => r.id === selectedRegion)
    }
    return filtered
  }, [selectedTimezone, selectedRegion, regions])

  const filteredServices = useMemo(() => {
    let filtered = services
    if (selectedService !== "all") {
      filtered = filtered.filter(s => s.name === selectedService)
    }
    return filtered
  }, [selectedService, services])

  // Calculate totals
  const totalCost = realData.totalCost
  const totalResources = filteredRegions.reduce((sum, region) => sum + region.resources, 0)
  const avgSecurityScore = Math.round(securityData.reduce((sum, item) => sum + item.score, 0) / securityData.length)

  // Calculate potential savings (15% of total cost as estimate)
  const potentialSavings = Math.round(totalCost * 0.15)

  const handleRefresh = async () => {
    console.log("🔄 Refreshing Azure data...")
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 p-6 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">Loading Azure Data</h2>
          <p className="text-muted-foreground">Fetching real-time cost and resource data...</p>
        </Card>
      </div>
    )
  }

  // No data state
  if (!isLoading && totalCost === 0 && services.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-blue-50 p-6 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-xl font-semibold mb-2">No Azure Data Available</h2>
          <p className="text-muted-foreground mb-4">
            No cost data found for the selected time range. Please check your Azure subscriptions and try again.
          </p>
          <Button onClick={handleRefresh} className="bg-blue-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    )
  }

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
                Azure Cloud Management
              </h1>
              <p className="text-muted-foreground">
                Real-time data from {azureProfiles?.profiles?.length || 0} Azure subscription(s)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none hover:from-blue-600 hover:to-blue-700">
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

                {regions.length > 0 && (
                  <RegionFilter
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onRegionChange={setSelectedRegion}
                  />
                )}

                {services.length > 0 && (
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map(service => (
                        <SelectItem key={service.name} value={service.name}>
                          <div className="flex items-center space-x-2">
                            <service.icon className="h-3 w-3" />
                            <span>{service.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

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
                  <Badge className="bg-green-500">Real Data</Badge>
                  <span className="text-sm text-muted-foreground">
                    {totalResources} resources • ${totalCost.toLocaleString('en-US')} ({timeRange} days)
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
                  <p className="text-sm text-blue-800 font-medium">Total Spend ({timeRange}d)</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${totalCost.toLocaleString('en-US')}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Real-time data</span>
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
                  <p className="text-sm text-purple-800 font-medium">Total Services</p>
                  <p className="text-2xl font-bold text-purple-900">{services.length}</p>
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
                  <p className="text-2xl font-bold text-green-900">${potentialSavings.toLocaleString('en-US')}</p>
                  <p className="text-xs text-green-600">~15% optimization potential</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span>Service Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AzureServiceDonutChart data={filteredServices} />
                  {filteredServices.length > 0 && (
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
                  )}
                </CardContent>
              </Card>

              {/* Cost Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Cost Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {costTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={costTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                        <YAxis stroke="#6B7280" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="cost" stroke="#0078D4" strokeWidth={3} />
                        <Line type="monotone" dataKey="forecast" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="5 5" />
                        <Line type="monotone" dataKey="optimized" stroke="#40E0D0" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No trend data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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

            {filteredServices.length === 0 && (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                <p className="text-muted-foreground">No services found for selected filters</p>
              </Card>
            )}
          </TabsContent>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span>Regional Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredRegions.map((region, index) => (
                    <motion.div
                      key={region.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-sm">{region.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {region.resources} resources • {region.location} • {region.timezone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">${region.cost.toLocaleString('en-US')}</div>
                        <div className="text-xs text-muted-foreground">monthly</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredRegions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No regions found for selected filters
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Utilization Tab */}
          <TabsContent value="utilization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Resource Utilization (Estimated)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AzureUtilizationChart data={utilizationData} />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Compute</div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(utilizationData.reduce((sum, d) => sum + d.compute, 0) / utilizationData.length)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-teal-50 rounded-lg">
                    <div className="text-sm font-medium text-teal-800">Storage</div>
                    <div className="text-lg font-bold text-teal-600">
                      {Math.round(utilizationData.reduce((sum, d) => sum + d.storage, 0) / utilizationData.length)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800">Network</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {Math.round(utilizationData.reduce((sum, d) => sum + d.network, 0) / utilizationData.length)}%
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Database</div>
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(utilizationData.reduce((sum, d) => sum + d.database, 0) / utilizationData.length)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  <span>Security Assessment (Baseline)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AzureSecurityRadar data={securityData} />
                  <div className="space-y-3">
                    {securityData.map((item, index) => (
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
        </Tabs>

        {/* Footer */}
        <div className="text-center py-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full border border-blue-300">
            <Heart className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Azure Cloud Management - Powered by Real-Time Data
            </span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
