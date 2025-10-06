"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Menu,
  X,
  Home,
  DollarSign,
  Settings,
  Brain,
  BarChart3,
  Bell,
  User,
  LogOut,
  Cloud,
  TrendingUp,
  AlertTriangle,
  Zap,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: number
  description?: string
}

interface MobileNavProps {
  userRole: "cfo" | "devops" | "cto"
  userName?: string
  userAvatar?: string
  onLogout?: () => void
  className?: string
}

const roleConfig = {
  cfo: {
    title: "CFO Dashboard",
    color: "text-financial-profit-600",
    navItems: [
      {
        title: "Executive Overview",
        href: "/dashboard/cfo",
        icon: <Home className="h-4 w-4" />,
        description: "Financial KPIs and trends"
      },
      {
        title: "Cost Analysis",
        href: "/dashboard/cfo/cost-analysis",
        icon: <DollarSign className="h-4 w-4" />,
        description: "Detailed cost breakdown"
      },
      {
        title: "Budget Management",
        href: "/dashboard/cfo/budget",
        icon: <TrendingUp className="h-4 w-4" />,
        description: "Budget planning and tracking"
      },
      {
        title: "Reports",
        href: "/dashboard/cfo/reports",
        icon: <BarChart3 className="h-4 w-4" />,
        description: "Executive reports"
      },
      {
        title: "Alerts",
        href: "/dashboard/cfo/alerts",
        icon: <Bell className="h-4 w-4" />,
        badge: 3,
        description: "Cost and budget alerts"
      }
    ]
  },
  devops: {
    title: "DevOps Center",
    color: "text-blue-600",
    navItems: [
      {
        title: "Infrastructure",
        href: "/dashboard/devops",
        icon: <Cloud className="h-4 w-4" />,
        description: "Resource monitoring"
      },
      {
        title: "Optimization",
        href: "/dashboard/devops/optimization",
        icon: <Zap className="h-4 w-4" />,
        description: "Cost optimization recommendations"
      },
      {
        title: "Anomalies",
        href: "/dashboard/devops/anomalies",
        icon: <AlertTriangle className="h-4 w-4" />,
        badge: 2,
        description: "Cost anomaly detection"
      },
      {
        title: "Resources",
        href: "/dashboard/devops/resources",
        icon: <Settings className="h-4 w-4" />,
        description: "Resource management"
      },
      {
        title: "Monitoring",
        href: "/dashboard/devops/monitoring",
        icon: <Shield className="h-4 w-4" />,
        description: "Real-time monitoring"
      }
    ]
  },
  cto: {
    title: "CTO Dashboard",
    color: "text-purple-600",
    navItems: [
      {
        title: "Architecture",
        href: "/dashboard/cto",
        icon: <Brain className="h-4 w-4" />,
        description: "Architecture overview"
      },
      {
        title: "Technology Roadmap",
        href: "/dashboard/cto/roadmap",
        icon: <TrendingUp className="h-4 w-4" />,
        description: "Strategic planning"
      },
      {
        title: "Innovation Tracker",
        href: "/dashboard/cto/innovation",
        icon: <Zap className="h-4 w-4" />,
        description: "R&D investments"
      },
      {
        title: "Technical Debt",
        href: "/dashboard/cto/technical-debt",
        icon: <AlertTriangle className="h-4 w-4" />,
        description: "Technical debt analysis"
      },
      {
        title: "Reports",
        href: "/dashboard/cto/reports",
        icon: <BarChart3 className="h-4 w-4" />,
        description: "Technical reports"
      }
    ]
  }
}

const MobileNav: React.FC<MobileNavProps> = ({
  userRole,
  userName = "User",
  userAvatar,
  onLogout,
  className
}) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const config = roleConfig[userRole]
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase()

  const handleNavClick = () => {
    setIsOpen(false)
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Menu className="h-5 w-5" />
            {config.navItems.some(item => item.badge) && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <SheetTitle className="text-base">{userName}</SheetTitle>
                  <p className={cn("text-sm font-medium", config.color)}>
                    {config.title}
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-3">
                {config.navItems.map((item, index) => {
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">
                            {item.title}
                          </span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs opacity-75 truncate mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </nav>

              {/* Divider */}
              <div className="border-t my-4" />

              {/* Secondary Actions */}
              <nav className="space-y-1 px-3">
                <Link
                  href="/profile"
                  onClick={handleNavClick}
                  className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={handleNavClick}
                  className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  handleNavClick()
                  onLogout?.()
                }}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { MobileNav }