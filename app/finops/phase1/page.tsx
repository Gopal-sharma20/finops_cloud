"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Sparkles,
  Globe,
  Server,
  Database,
  HardDrive,
  Network,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Zap,
  Cloud,
  Eye,
  Settings,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

// Mock data for demonstration
const regions = [
  { id: "us-east-1", name: "US East (N. Virginia)", flag: "🇺🇸", resources: 234, cost: 12450 },
  { id: "us-west-2", name: "US West (Oregon)", flag: "🇺🇸", resources: 187, cost: 8920 },
  { id: "eu-west-1", name: "Europe (Ireland)", flag: "🇪🇺", resources: 156, cost: 7650 },
  { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", flag: "🇸🇬", resources: 98, cost: 4320 },
  { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)", flag: "🇯🇵", resources: 76, cost: 3890 }
]

const resourceTypes = [
  { type: "EC2", count: 145, cost: 18240, icon: Server, color: "from-blue-400 to-blue-600" },
  { type: "EBS", count: 289, cost: 8920, icon: HardDrive, color: "from-green-400 to-green-600" },
  { type: "S3", count: 67, cost: 6540, icon: Database, color: "from-purple-400 to-purple-600" },
  { type: "RDS", count: 23, cost: 7850, icon: Database, color: "from-orange-400 to-orange-600" },
  { type: "Lambda", count: 156, cost: 2340, icon: Zap, color: "from-pink-400 to-pink-600" },
  { type: "VPC/Gateways", count: 34, cost: 4120, icon: Network, color: "from-indigo-400 to-indigo-600" }
]

const billingData = {
  current: 47912,
  previous: 52340,
  change: -8.5,
  forecastWithoutRec: 54200,
  forecastWithRec: 38900,
  savingsPotential: 15300
}

const recommendations = [
  {
    id: 1,
    type: "rightsizing",
    service: "EC2",
    resource: "i-0123456789abcdef0",
    title: "Rightsize EC2 Instance",
    description: "Instance running at 12% CPU utilization. Downsize from m5.2xlarge to m5.large",
    currentCost: 280,
    projectedCost: 140,
    savings: 140,
    impact: "high",
    effort: "low",
    region: "us-east-1",
    confidence: 95,
    vulnerabilities: 0
  },
  {
    id: 2,
    type: "unused",
    service: "EBS",
    resource: "vol-0987654321fedcba0",
    title: "Remove Unused EBS Volume",
    description: "Volume unattached for 30+ days with no snapshots",
    currentCost: 45,
    projectedCost: 0,
    savings: 45,
    impact: "medium",
    effort: "low",
    region: "us-west-2",
    confidence: 99,
    vulnerabilities: 1
  },
  {
    id: 3,
    type: "storage-class",
    service: "S3",
    resource: "backup-bucket-prod",
    title: "Optimize S3 Storage Class",
    description: "Move infrequently accessed data to IA storage class",
    currentCost: 320,
    projectedCost: 128,
    savings: 192,
    impact: "medium",
    effort: "low",
    region: "eu-west-1",
    confidence: 87,
    vulnerabilities: 0
  }
]

const vulnerabilities = [
  {
    id: 1,
    severity: "critical",
    service: "EC2",
    resource: "i-0123456789abcdef0",
    title: "Security Group Too Permissive",
    description: "Port 22 open to 0.0.0.0/0",
    region: "us-east-1",
    detected: "2024-01-15"
  },
  {
    id: 2,
    severity: "high",
    service: "S3",
    resource: "public-assets-bucket",
    title: "S3 Bucket Public Read Access",
    description: "Bucket allows public read access",
    region: "us-east-1",
    detected: "2024-01-14"
  },
  {
    id: 3,
    severity: "medium",
    service: "RDS",
    resource: "prod-database",
    title: "Database Not Encrypted",
    description: "RDS instance without encryption at rest",
    region: "us-west-2",
    detected: "2024-01-13"
  }
]

const RegionCard = ({ region }: { region: typeof regions[0] }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{region.flag}</span>
            <div>
              <h3 className="font-semibold text-sm">{region.name}</h3>
              <p className="text-xs text-muted-foreground">{region.id}</p>
            </div>
          </div>
          <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Resources</span>
            <span className="font-semibold">{region.resources}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Monthly Cost</span>
            <span className="font-semibold text-green-600">${region.cost.toLocaleString('en-US')}</span>
          </div>

          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full transition-all duration-1000 group-hover:from-purple-400 group-hover:to-purple-600"
              style={{ width: `${(region.cost / 15000) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const ResourceTypeCard = ({ resource }: { resource: typeof resourceTypes[0] }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white group-hover:scale-110 transition-transform", resource.color)}>
            <resource.icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{resource.type}</h3>
            <p className="text-xs text-muted-foreground">{resource.count} resources</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            ${resource.cost.toLocaleString('en-US')}
          </div>
          <div className="text-xs text-muted-foreground">monthly cost</div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const RecommendationCard = ({ rec }: { rec: typeof recommendations[0] }) => {
  const impactColors = {
    high: "from-red-100 to-red-50 border-red-200",
    medium: "from-yellow-100 to-yellow-50 border-yellow-200",
    low: "from-green-100 to-green-50 border-green-200"
  }

  const serviceIcons = {
    EC2: Server,
    EBS: HardDrive,
    S3: Database,
    RDS: Database
  }

  const ServiceIcon = serviceIcons[rec.service as keyof typeof serviceIcons] || Server

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, shadow: "lg" }}
    >
      <Card className={cn("border-l-4 hover:shadow-lg transition-all duration-300", impactColors[rec.impact])}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg">
                <ServiceIcon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{rec.title}</h3>
                <p className="text-xs text-muted-foreground">{rec.service} • {rec.region}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {rec.vulnerabilities > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {rec.vulnerabilities}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {rec.confidence}% sure
              </Badge>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {rec.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="text-xs">
              <span className="text-muted-foreground">Resource: </span>
              <span className="font-mono text-blue-600">{rec.resource}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs">
              <div>
                <span className="text-muted-foreground">Current: </span>
                <span className="font-semibold">${rec.currentCost}/mo</span>
              </div>
              <div>
                <span className="text-muted-foreground">Projected: </span>
                <span className="font-semibold text-green-600">${rec.projectedCost}/mo</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-xs">
                Save ${rec.savings}/mo
              </Badge>
              <Button size="sm" className="h-6 px-2 text-xs">
                Apply ✨
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const VulnerabilityCard = ({ vuln }: { vuln: typeof vulnerabilities[0] }) => {
  const severityColors = {
    critical: "from-red-500 to-red-600",
    high: "from-orange-500 to-orange-600",
    medium: "from-yellow-500 to-yellow-600",
    low: "from-blue-500 to-blue-600"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={cn("p-1.5 rounded-lg bg-gradient-to-br text-white", severityColors[vuln.severity])}>
                <Shield className="h-3 w-3" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{vuln.title}</h3>
                <p className="text-xs text-muted-foreground">{vuln.service} • {vuln.region}</p>
              </div>
            </div>

            <Badge variant="destructive" className="text-xs capitalize">
              {vuln.severity}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mb-2">{vuln.description}</p>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground">Resource: </span>
              <span className="font-mono text-blue-600">{vuln.resource}</span>
            </div>
            <div className="text-muted-foreground">
              Detected: {vuln.detected}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Phase1Dashboard() {
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedService, setSelectedService] = useState("all")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FinOps Phase 1 Dashboard 🚀
              </h1>
              <p className="text-muted-foreground">Complete resource management with love and intelligence</p>
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
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Current Month</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${billingData.current.toLocaleString('en-US')}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">
                      {Math.abs(billingData.change)}% vs last month
                    </span>
                  </div>
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
                  <p className="text-2xl font-bold text-blue-900">
                    {regions.reduce((sum, r) => sum + r.resources, 0)}
                  </p>
                  <p className="text-xs text-blue-600">Across {regions.length} regions</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-800 font-medium">Potential Savings</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${billingData.savingsPotential.toLocaleString('en-US')}
                  </p>
                  <p className="text-xs text-purple-600">With recommendations</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-800 font-medium">Vulnerabilities</p>
                  <p className="text-2xl font-bold text-red-900">{vulnerabilities.length}</p>
                  <p className="text-xs text-red-600">Need attention</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Multi-Cloud Provider Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <span>Multi-Cloud Overview ☁️</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AWS Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100"
                    onClick={() => router.push('/clouds/aws')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                            <Cloud className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-orange-800">AWS</h3>
                            <p className="text-sm text-orange-600">847 resources</p>
                          </div>
                        </div>
                        <Badge className="bg-orange-500 text-white">Primary</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-orange-700">Monthly Spend</span>
                          <span className="text-xl font-bold text-orange-800">$28,450</span>
                        </div>
                        <div className="text-sm text-orange-600">60% of total spend</div>
                        <div className="w-full bg-orange-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full w-3/5" />
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-orange-600">
                          <TrendingDown className="h-3 w-3" />
                          <span>-3% vs last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Azure Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100"
                    onClick={() => router.push('/clouds/azure')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                            <Cloud className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-blue-800">Azure</h3>
                            <p className="text-sm text-blue-600">312 resources</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-500 text-white">Secondary</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-700">Monthly Spend</span>
                          <span className="text-xl font-bold text-blue-800">$12,890</span>
                        </div>
                        <div className="text-sm text-blue-600">27% of total spend</div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '27%' }} />
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-blue-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+5% vs last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Google Cloud Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-green-200 bg-gradient-to-br from-green-50 to-green-100"
                    onClick={() => router.push('/clouds/gcp')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                            <Cloud className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-green-800">Google Cloud</h3>
                            <p className="text-sm text-green-600">188 resources</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white">AI/ML Focus</Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">Monthly Spend</span>
                          <span className="text-xl font-bold text-green-800">$6,492</span>
                        </div>
                        <div className="text-sm text-green-600">13% of total spend</div>
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '13%' }} />
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          <span>+8% vs last month</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="mt-6 text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800">
                    Click any cloud provider to explore detailed resources and recommendations
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="rightsizing">Rightsizing</TabsTrigger>
            <TabsTrigger value="unused">Unused</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Regions */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span>Resources by Region 🌍</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {regions.map((region, index) => (
                        <motion.div
                          key={region.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <RegionCard region={region} />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resource Types */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Server className="h-5 w-5 text-purple-600" />
                      <span>Service Types 🛠️</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resourceTypes.map((resource, index) => (
                        <motion.div
                          key={resource.type}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ResourceTypeCard resource={resource} />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rightsizing Tab */}
          <TabsContent value="rightsizing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span>Rightsizing Recommendations 🎯</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations
                    .filter(r => r.type === "rightsizing")
                    .map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <RecommendationCard rec={rec} />
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Unused Resources Tab */}
          <TabsContent value="unused" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Unused Resources 🗑️</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations
                    .filter(r => r.type === "unused")
                    .map((rec, index) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <RecommendationCard rec={rec} />
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current vs Previous Month 📊</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>Previous Month</span>
                      <span className="font-bold">${billingData.previous.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span>Current Month</span>
                      <span className="font-bold text-green-600">${billingData.current.toLocaleString('en-US')}</span>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.abs(billingData.change)}% Saved! 🎉
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown by Service 🥧</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resourceTypes.map((service, index) => (
                      <div key={service.type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", service.color)} />
                          <span className="text-sm">{service.type}</span>
                        </div>
                        <span className="font-semibold">${service.cost.toLocaleString('en-US')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Without Recommendations 📈</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-red-600">
                      ${billingData.forecastWithoutRec.toLocaleString('en-US')}
                    </div>
                    <p className="text-sm text-muted-foreground">Projected next month</p>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">+13% increase</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">With Recommendations ✨</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      ${billingData.forecastWithRec.toLocaleString('en-US')}
                    </div>
                    <p className="text-sm text-green-700">Projected next month</p>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">19% savings!</span>
                    </div>
                    <div className="mt-4 p-3 bg-green-100 rounded-lg">
                      <div className="text-lg font-bold text-green-800">
                        Save ${billingData.savingsPotential.toLocaleString('en-US')}/month
                      </div>
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
                  <Shield className="h-5 w-5 text-red-600" />
                  <span>Security Vulnerabilities 🛡️</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vulnerabilities.map((vuln, index) => (
                    <motion.div
                      key={vuln.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <VulnerabilityCard vuln={vuln} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer with Love */}
        <div className="text-center py-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full border border-pink-200">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="text-sm text-purple-800">
              FinOps Phase 1 - Built with love for world-class cloud optimization 💖
            </span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}