"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  DollarSign,
  Cloud,
  Target,
  Bell,
  Settings,
  Menu,
  X,
  Home,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Shield,
  Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedDashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, color: "from-blue-400 to-blue-600" },
  { id: "costs", label: "Cost Analysis", icon: DollarSign, color: "from-green-400 to-green-600" },
  { id: "optimization", label: "Optimization", icon: Zap, color: "from-purple-400 to-purple-600" },
  { id: "resources", label: "Resources", icon: Cloud, color: "from-orange-400 to-orange-600" },
  { id: "reports", label: "Reports", icon: BarChart3, color: "from-pink-400 to-pink-600" },
  { id: "team", label: "Team", icon: Users, color: "from-indigo-400 to-indigo-600" }
]

const FloatingParticles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-30"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          x: Math.random() * (window?.innerWidth || 1920),
          y: Math.random() * (window?.innerHeight || 1080),
        }}
        transition={{
          duration: Math.random() * 20 + 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
  </div>
)

const AnimatedNavItem = ({
  item,
  isActive,
  onClick,
  index
}: {
  item: typeof navigationItems[0]
  isActive: boolean
  onClick: () => void
  index: number
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={cn(
          "relative flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group",
          isActive
            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color} text-white`
        )}>
          <item.icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-sm">{item.label}</span>

        {isHovered && !isActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {isActive && (
          <motion.div
            className="absolute right-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const FloatingActionButton = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    className="fixed bottom-6 right-6 z-50"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1, type: "spring", stiffness: 300 }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <Button
      onClick={onClick}
      className="h-14 w-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Heart className="h-6 w-6" />
    </Button>
  </motion.div>
)

const SuccessToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div
    className="fixed top-6 right-6 z-50"
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 100 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="bg-green-50 border-green-200 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Star className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-sm font-medium text-green-800">{message}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-green-600 hover:bg-green-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

export const AnimatedDashboardLayout: React.FC<AnimatedDashboardLayoutProps> = ({
  children,
  currentPage = "dashboard"
}) => {
  const [activePage, setActivePage] = useState(currentPage)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleLoveClick = () => {
    const messages = [
      "Your infrastructure loves you back! 💖",
      "Optimization complete with love! ✨",
      "Spreading cloud love everywhere! 🌈",
      "Your costs are getting more loveable! 🥰"
    ]
    showSuccessToast(messages[Math.floor(Math.random() * messages.length)])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      <FloatingParticles />

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-5"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, #8B5CF6 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, #F472B6 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, #06B6D4 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="flex relative z-10">
        {/* Animated Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-70 bg-card/80 backdrop-blur-lg border-r border-border shadow-xl"
            >
              <div className="p-6">
                {/* Logo with animation */}
                <motion.div
                  className="flex items-center space-x-3 mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <Heart className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </motion.div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      LovelyCloud
                    </h1>
                    <p className="text-xs text-muted-foreground">Optimizing with love</p>
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <motion.div
                        className="text-lg font-bold text-green-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        $12.4K
                      </motion.div>
                      <div className="text-xs text-muted-foreground">Saved</div>
                    </div>
                    <div>
                      <motion.div
                        className="text-lg font-bold text-purple-600"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                      >
                        94%
                      </motion.div>
                      <div className="text-xs text-muted-foreground">Optimized</div>
                    </div>
                  </div>
                </motion.div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {navigationItems.map((item, index) => (
                    <AnimatedNavItem
                      key={item.id}
                      item={item}
                      isActive={activePage === item.id}
                      onClick={() => setActivePage(item.id)}
                      index={index}
                    />
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Top Bar */}
          <motion.header
            className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border shadow-sm"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-xl font-semibold capitalize">{activePage}</h2>
                  <p className="text-sm text-muted-foreground">Welcome back! ✨</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    <motion.span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                    >
                      3
                    </motion.span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.header>

          {/* Content Area with animation */}
          <motion.div
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={handleLoveClick} />

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <SuccessToast
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}