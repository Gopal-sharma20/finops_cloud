"use client"

import React from "react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile/mobile-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Sparkles,
  ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ResponsiveHeaderProps {
  userRole: "cfo" | "devops" | "cto"
  userName?: string
  userEmail?: string
  userAvatar?: string
  notifications?: number
  onLogout?: () => void
  className?: string
}

const roleConfig = {
  cfo: {
    title: "CFO Executive Dashboard",
    subtitle: "Financial Leadership & Strategy",
    color: "text-financial-profit-600",
    bgColor: "bg-financial-profit-50"
  },
  devops: {
    title: "DevOps Control Center",
    subtitle: "Infrastructure Optimization",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  cto: {
    title: "CTO Strategy Center",
    subtitle: "Technology Leadership",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  }
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  userRole,
  userName = "User",
  userEmail = "user@company.com",
  userAvatar,
  notifications = 0,
  onLogout,
  className
}) => {
  const config = roleConfig[userRole]
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Side - Logo and Navigation */}
        <div className="flex items-center space-x-4">
          {/* Mobile Navigation */}
          <MobileNav
            userRole={userRole}
            userName={userName}
            userAvatar={userAvatar}
            onLogout={onLogout}
          />

          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link href={`/dashboard/${userRole}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold tracking-tight">CloudOptima</h1>
                <p className={cn("text-xs", config.color)}>
                  {config.subtitle}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Side - Actions and User Menu */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5"
              >
                {notifications > 99 ? "99+" : notifications}
              </Badge>
            )}
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Settings - Desktop only */}
          <Button variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                  <Badge variant="outline" className="w-fit mt-1">
                    {config.title.split(' ')[0]}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Role Banner - Mobile Only */}
      <div className="lg:hidden border-t bg-muted/50 px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">{config.title}</h2>
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
          <div className={cn("px-2 py-1 rounded-full text-xs", config.bgColor, config.color)}>
            {userRole.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

export { ResponsiveHeader }