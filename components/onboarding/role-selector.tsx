"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Settings,
  Brain,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Target,
  BarChart3,
  CloudCog,
  Lightbulb,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Role {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  features: string[]
  permissions: string[]
  dashboards: Array<{
    name: string
    description: string
    icon: React.ReactNode
  }>
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface RoleSelectorProps {
  onRoleSelect: (roleId: string) => void
  selectedRole?: string
  className?: string
}

const roles: Role[] = [
  {
    id: "cfo",
    title: "Chief Financial Officer",
    subtitle: "Financial Leadership & Strategy",
    description: "Strategic financial oversight with executive-level insights into cloud spending, ROI analysis, and budget management across the entire organization.",
    icon: <DollarSign className="h-8 w-8" />,
    features: [
      "Executive financial dashboards",
      "Budget planning & forecasting",
      "ROI & cost-benefit analysis",
      "Board-ready reporting",
      "Multi-cloud spend allocation",
      "Strategic vendor negotiations"
    ],
    permissions: [
      "View all financial data",
      "Approve budget allocations",
      "Access executive reports",
      "Configure billing alerts",
      "Manage cost centers",
      "Export financial data"
    ],
    dashboards: [
      {
        name: "Executive Overview",
        description: "High-level financial KPIs and trends",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        name: "Budget Management",
        description: "Budget vs actual with forecasting",
        icon: <Target className="h-4 w-4" />
      },
      {
        name: "Vendor Analysis",
        description: "Cloud provider cost comparison",
        icon: <BarChart3 className="h-4 w-4" />
      }
    ],
    colors: {
      primary: "from-financial-profit-500 to-financial-profit-700",
      secondary: "bg-financial-profit-100",
      accent: "text-financial-profit-700"
    }
  },
  {
    id: "devops",
    title: "DevOps Engineer",
    subtitle: "Infrastructure Optimization",
    description: "Technical cost optimization with deep infrastructure insights, resource rightsizing recommendations, and automated cost management workflows.",
    icon: <Settings className="h-8 w-8" />,
    features: [
      "Resource utilization monitoring",
      "Automated rightsizing recommendations",
      "Infrastructure topology mapping",
      "Cost anomaly detection",
      "Reserved instance optimization",
      "Container cost allocation"
    ],
    permissions: [
      "View technical metrics",
      "Configure optimization rules",
      "Access infrastructure data",
      "Manage resource tags",
      "Set up automation",
      "Monitor performance costs"
    ],
    dashboards: [
      {
        name: "Resource Monitor",
        description: "Real-time infrastructure utilization",
        icon: <CloudCog className="h-4 w-4" />
      },
      {
        name: "Optimization Center",
        description: "Cost-saving recommendations",
        icon: <Zap className="h-4 w-4" />
      },
      {
        name: "Anomaly Detection",
        description: "Cost spikes and unusual patterns",
        icon: <Shield className="h-4 w-4" />
      }
    ],
    colors: {
      primary: "from-blue-500 to-blue-700",
      secondary: "bg-blue-100",
      accent: "text-blue-700"
    }
  },
  {
    id: "cto",
    title: "Chief Technology Officer",
    subtitle: "Technology Strategy & Architecture",
    description: "Strategic technology leadership with architectural cost modeling, technology roadmap planning, and innovation vs optimization balance analysis.",
    icon: <Brain className="h-8 w-8" />,
    features: [
      "Architecture cost modeling",
      "Technology roadmap planning",
      "Innovation investment tracking",
      "Technical debt cost analysis",
      "Multi-cloud strategy planning",
      "Engineering productivity metrics"
    ],
    permissions: [
      "View architectural insights",
      "Access technology metrics",
      "Manage innovation budget",
      "Configure technical policies",
      "Review architecture decisions",
      "Export technical reports"
    ],
    dashboards: [
      {
        name: "Architecture Overview",
        description: "System architecture and cost modeling",
        icon: <Lightbulb className="h-4 w-4" />
      },
      {
        name: "Technology Roadmap",
        description: "Strategic technology planning",
        icon: <TrendingUp className="h-4 w-4" />
      },
      {
        name: "Innovation Tracker",
        description: "R&D and innovation investments",
        icon: <Brain className="h-4 w-4" />
      }
    ],
    colors: {
      primary: "from-purple-500 to-purple-700",
      secondary: "bg-purple-100",
      accent: "text-purple-700"
    }
  }
]

const RoleSelector: React.FC<RoleSelectorProps> = ({
  onRoleSelect,
  selectedRole,
  className
}) => {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Role</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select your primary role to customize your CloudOptima experience with role-specific
          dashboards, insights, and permissions tailored to your responsibilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id
          const isHovered = hoveredRole === role.id

          return (
            <Card
              key={role.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1",
                isSelected && "ring-2 ring-primary shadow-xl scale-105",
                "group overflow-hidden"
              )}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              onClick={() => onRoleSelect(role.id)}
            >
              {/* Background Gradient */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300",
                  role.colors.primary,
                  (isHovered || isSelected) && "opacity-10"
                )}
              />

              <CardHeader className="relative pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center text-white transition-transform duration-300",
                        role.colors.primary,
                        (isHovered || isSelected) && "scale-110"
                      )}
                    >
                      {role.icon}
                    </div>

                    <div className="space-y-1">
                      <CardTitle className="text-xl font-bold">
                        {role.title}
                      </CardTitle>
                      <p className={cn("text-sm font-medium", role.colors.accent)}>
                        {role.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {role.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Key Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Key Features</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {role.features.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className={cn("w-1.5 h-1.5 rounded-full", role.colors.secondary)} />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                    {role.features.length > 4 && (
                      <div className="text-xs text-muted-foreground">
                        +{role.features.length - 4} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Dashboards */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Included Dashboards</span>
                  </h4>
                  <div className="space-y-2">
                    {role.dashboards.map((dashboard, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg">
                        <div className={cn("p-1.5 rounded-md", role.colors.secondary)}>
                          {dashboard.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{dashboard.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {dashboard.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <Button
                  className={cn(
                    "w-full transition-all duration-200",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-muted"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRoleSelect(role.id)
                  }}
                >
                  {isSelected ? "Selected" : "Select Role"}
                </Button>
              </CardContent>

              {/* Hover Effect Border */}
              <div
                className={cn(
                  "absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none",
                  isHovered ? "border-primary/30" : "border-transparent"
                )}
              />
            </Card>
          )
        })}
      </div>

      {selectedRole && (
        <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Role Permissions</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roles.find(r => r.id === selectedRole)?.permissions.map((permission, index) => (
              <Badge key={index} variant="secondary" className="justify-start">
                <Check className="h-3 w-3 mr-1" />
                {permission}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            These permissions can be modified later by your organization admin.
          </p>
        </div>
      )}
    </div>
  )
}

export { RoleSelector, type Role }