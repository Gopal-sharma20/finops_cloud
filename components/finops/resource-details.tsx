"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Server,
  HardDrive,
  Database,
  Network,
  Zap,
  Shield,
  Globe,
  Search,
  Filter,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Activity,
  Cpu,
  MemoryStick,
  Gauge
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Comprehensive mock data for all AWS services
const resourceInventory = [
  // EC2 Instances
  {
    id: "i-0123456789abcdef0",
    name: "web-server-01",
    type: "EC2",
    service: "Elastic Compute Cloud",
    instanceType: "m5.2xlarge",
    region: "us-east-1",
    az: "us-east-1a",
    state: "running",
    cpuUtilization: 12,
    memoryUtilization: 25,
    networkIn: "1.2 GB",
    networkOut: "850 MB",
    monthlyCost: 280,
    dailyCost: 9.33,
    rightSizingRec: "m5.large",
    potentialSavings: 140,
    securityIssues: 1,
    tags: { Environment: "Production", Team: "Frontend" },
    launchTime: "2024-01-10T10:30:00Z",
    lastActivity: "2024-01-15T14:22:00Z"
  },
  {
    id: "i-0987654321fedcba0",
    name: "api-server-02",
    type: "EC2",
    service: "Elastic Compute Cloud",
    instanceType: "c5.xlarge",
    region: "us-west-2",
    az: "us-west-2b",
    state: "running",
    cpuUtilization: 68,
    memoryUtilization: 72,
    networkIn: "2.8 GB",
    networkOut: "3.1 GB",
    monthlyCost: 195,
    dailyCost: 6.50,
    rightSizingRec: "optimal",
    potentialSavings: 0,
    securityIssues: 0,
    tags: { Environment: "Production", Team: "Backend" },
    launchTime: "2024-01-08T08:15:00Z",
    lastActivity: "2024-01-15T14:23:00Z"
  },

  // EBS Volumes
  {
    id: "vol-0123456789abcdef0",
    name: "web-server-01-root",
    type: "EBS",
    service: "Elastic Block Store",
    volumeType: "gp3",
    size: "100 GB",
    region: "us-east-1",
    az: "us-east-1a",
    state: "in-use",
    iops: 3000,
    throughput: "125 MB/s",
    utilization: 45,
    monthlyCost: 12,
    dailyCost: 0.40,
    rightSizingRec: "gp2",
    potentialSavings: 3,
    securityIssues: 0,
    attachedTo: "i-0123456789abcdef0",
    encrypted: true,
    snapshotCount: 5
  },
  {
    id: "vol-0987654321fedcba0",
    name: "unused-volume",
    type: "EBS",
    service: "Elastic Block Store",
    volumeType: "gp2",
    size: "50 GB",
    region: "us-west-2",
    az: "us-west-2b",
    state: "available",
    iops: 150,
    throughput: "N/A",
    utilization: 0,
    monthlyCost: 5,
    dailyCost: 0.17,
    rightSizingRec: "delete",
    potentialSavings: 5,
    securityIssues: 0,
    attachedTo: null,
    encrypted: false,
    snapshotCount: 0,
    unusedDays: 35
  },

  // S3 Buckets
  {
    id: "backup-bucket-prod",
    name: "backup-bucket-prod",
    type: "S3",
    service: "Simple Storage Service",
    storageClass: "Standard",
    size: "2.4 TB",
    region: "us-east-1",
    az: "N/A",
    state: "active",
    requestsPerDay: "1,250",
    transferOut: "45 GB",
    monthlyCost: 320,
    dailyCost: 10.67,
    rightSizingRec: "Standard-IA",
    potentialSavings: 192,
    securityIssues: 0,
    publicAccess: false,
    versioning: true,
    encryption: "AES256",
    lastAccess: "2024-01-10T00:00:00Z"
  },

  // RDS Instances
  {
    id: "prod-database",
    name: "prod-database",
    type: "RDS",
    service: "Relational Database Service",
    instanceType: "db.r5.2xlarge",
    engine: "MySQL 8.0.35",
    region: "us-east-1",
    az: "us-east-1a,us-east-1b",
    state: "available",
    cpuUtilization: 35,
    connections: 125,
    storageUsed: "450 GB",
    storageAllocated: "1000 GB",
    monthlyCost: 520,
    dailyCost: 17.33,
    rightSizingRec: "db.r5.xlarge",
    potentialSavings: 260,
    securityIssues: 1,
    multiAz: true,
    encrypted: false,
    backupRetention: 7,
    lastBackup: "2024-01-15T02:00:00Z"
  },

  // Lambda Functions
  {
    id: "user-auth-lambda",
    name: "user-auth-lambda",
    type: "Lambda",
    service: "AWS Lambda",
    runtime: "nodejs18.x",
    memory: "512 MB",
    region: "us-east-1",
    az: "N/A",
    state: "active",
    invocationsPerDay: "45,000",
    avgDuration: "245ms",
    errorRate: "0.02%",
    monthlyCost: 23,
    dailyCost: 0.77,
    rightSizingRec: "256 MB",
    potentialSavings: 12,
    securityIssues: 0,
    timeout: "30s",
    lastInvocation: "2024-01-15T14:20:00Z",
    coldStarts: "2.3%"
  },

  // NAT Gateway
  {
    id: "nat-0123456789abcdef0",
    name: "prod-nat-gateway",
    type: "NAT Gateway",
    service: "VPC NAT Gateway",
    throughput: "5 Gbps",
    region: "us-east-1",
    az: "us-east-1a",
    state: "available",
    dataProcessed: "1.2 TB",
    activeConnections: "340",
    monthlyCost: 67,
    dailyCost: 2.23,
    rightSizingRec: "review usage",
    potentialSavings: 25,
    securityIssues: 0,
    subnetId: "subnet-0123456789abcdef0",
    elasticIpAllocated: true
  },

  // Application Load Balancer
  {
    id: "alb-0123456789abcdef0",
    name: "prod-alb",
    type: "ALB",
    service: "Application Load Balancer",
    scheme: "internet-facing",
    region: "us-east-1",
    az: "us-east-1a,us-east-1b",
    state: "active",
    requestsPerSecond: "150",
    targetGroups: 3,
    activeConnections: "89",
    monthlyCost: 34,
    dailyCost: 1.13,
    rightSizingRec: "optimal",
    potentialSavings: 0,
    securityIssues: 0,
    sslCertificate: "valid",
    healthyTargets: "2/2"
  }
]

const ServiceIcon = ({ type }: { type: string }) => {
  const icons = {
    EC2: Server,
    EBS: HardDrive,
    S3: Database,
    RDS: Database,
    Lambda: Zap,
    "NAT Gateway": Network,
    ALB: Network
  }

  const Icon = icons[type as keyof typeof icons] || Server
  return <Icon className="h-4 w-4" />
}

const StatusBadge = ({ state, type }: { state: string; type: string }) => {
  const getStatusColor = () => {
    switch (state) {
      case "running":
      case "active":
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "stopped":
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  return (
    <Badge variant="outline" className={getStatusColor()}>
      {state}
    </Badge>
  )
}

const UtilizationBar = ({ value, type = "cpu" }: { value: number; type?: string }) => {
  const getColor = () => {
    if (value < 30) return "bg-red-400"
    if (value < 60) return "bg-yellow-400"
    return "bg-green-400"
  }

  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className={cn("h-2 rounded-full transition-all duration-500", getColor())}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

export const ResourceDetails = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedResource, setSelectedResource] = useState<null | typeof resourceInventory[0]>(null)

  const filteredResources = resourceInventory.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRegion = selectedRegion === "all" || resource.region === selectedRegion
    const matchesType = selectedType === "all" || resource.type === selectedType

    return matchesSearch && matchesRegion && matchesType
  })

  const totalCost = filteredResources.reduce((sum, resource) => sum + resource.monthlyCost, 0)
  const totalSavings = filteredResources.reduce((sum, resource) => sum + resource.potentialSavings, 0)
  const totalSecurityIssues = filteredResources.reduce((sum, resource) => sum + resource.securityIssues, 0)

  const uniqueRegions = [...new Set(resourceInventory.map(r => r.region))]
  const uniqueTypes = [...new Set(resourceInventory.map(r => r.type))]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Resources</p>
                  <p className="text-2xl font-bold">{filteredResources.length}</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold text-green-600">${totalCost.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Potential Savings</p>
                  <p className="text-2xl font-bold text-purple-600">${totalSavings.toLocaleString()}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Issues</p>
                  <p className="text-2xl font-bold text-red-600">{totalSecurityIssues}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Regions</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Services</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-muted-foreground">
                Showing {filteredResources.length} resources
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Resource Inventory 📋</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region/AZ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Savings</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource, index) => (
                  <motion.tr
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <ServiceIcon type={resource.type} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{resource.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {resource.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{resource.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {resource.instanceType || resource.volumeType || resource.storageClass || resource.runtime || resource.scheme || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{resource.region}</div>
                        <div className="text-xs text-muted-foreground">{resource.az}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge state={resource.state} type={resource.type} />
                    </TableCell>
                    <TableCell>
                      {resource.cpuUtilization !== undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>CPU</span>
                            <span>{resource.cpuUtilization}%</span>
                          </div>
                          <UtilizationBar value={resource.cpuUtilization} />
                        </div>
                      )}
                      {resource.utilization !== undefined && resource.cpuUtilization === undefined && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Usage</span>
                            <span>{resource.utilization}%</span>
                          </div>
                          <UtilizationBar value={resource.utilization} />
                        </div>
                      )}
                      {resource.cpuUtilization === undefined && resource.utilization === undefined && (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-green-600">${resource.monthlyCost}/mo</div>
                        <div className="text-xs text-muted-foreground">${resource.dailyCost}/day</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {resource.potentialSavings > 0 ? (
                        <div>
                          <div className="font-semibold text-purple-600">
                            ${resource.potentialSavings}/mo
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {resource.rightSizingRec}
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Optimal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {resource.securityIssues > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {resource.securityIssues}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Secure
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}