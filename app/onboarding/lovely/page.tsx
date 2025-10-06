"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Heart,
  Sparkles,
  Star,
  ArrowRight,
  ArrowLeft,
  Cloud,
  DollarSign,
  Target,
  Users,
  Building,
  Zap,
  Shield,
  Award,
  CheckCircle,
  AlertCircle,
  Globe,
  Database,
  Lightbulb,
  Rocket
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const steps = [
  {
    id: 1,
    title: "Welcome to LovelyCloud! 🌈",
    description: "Let's make your cloud infrastructure absolutely loveable",
    component: "welcome"
  },
  {
    id: 2,
    title: "Tell us about yourself ✨",
    description: "Help us personalize your experience",
    component: "profile"
  },
  {
    id: 3,
    title: "Connect your clouds ☁️",
    description: "We support all major cloud providers with love",
    component: "clouds"
  },
  {
    id: 4,
    title: "Set your goals 🎯",
    description: "What would you like to optimize first?",
    component: "goals"
  },
  {
    id: 5,
    title: "You're all set! 🎉",
    description: "Time to start optimizing with love",
    component: "success"
  }
]

const FloatingElements = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className={cn(
          "absolute w-3 h-3 rounded-full opacity-20",
          i % 3 === 0 ? "bg-pink-400" : i % 3 === 1 ? "bg-purple-400" : "bg-blue-400"
        )}
        initial={{
          x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
          y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
        }}
        animate={{
          y: [null, -100, null],
          x: [null, Math.random() * 100 - 50, null],
        }}
        transition={{
          duration: Math.random() * 8 + 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
)

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center space-x-2 mb-8">
    {[...Array(totalSteps)].map((_, index) => (
      <motion.div
        key={index}
        className={cn(
          "w-3 h-3 rounded-full transition-all duration-300",
          index < currentStep
            ? "bg-gradient-to-r from-green-400 to-green-600"
            : index === currentStep
            ? "bg-gradient-to-r from-pink-400 to-purple-600 scale-125"
            : "bg-muted"
        )}
        initial={{ scale: 0 }}
        animate={{ scale: index <= currentStep ? 1 : 0.8 }}
        transition={{ delay: index * 0.1 }}
      />
    ))}
  </div>
)

const WelcomeStep = () => (
  <motion.div
    className="text-center space-y-6"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <motion.div
      className="relative mx-auto w-24 h-24"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full p-6">
        <Heart className="h-12 w-12 text-white" />
      </div>
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="h-6 w-6 text-yellow-500" />
      </motion.div>
    </motion.div>

    <div className="space-y-4">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Welcome to LovelyCloud! 🌈
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mx-auto">
        We're here to make your cloud infrastructure absolutely loveable, efficient, and cost-optimized!
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {[
        { icon: DollarSign, title: "Save Money", desc: "Reduce costs by 30%", color: "from-green-400 to-green-600" },
        { icon: Zap, title: "Boost Performance", desc: "Optimize resources", color: "from-blue-400 to-blue-600" },
        { icon: Heart, title: "Feel Good", desc: "Love your cloud", color: "from-pink-400 to-pink-600" }
      ].map((feature, index) => (
        <motion.div
          key={index}
          className="p-4 bg-card border border-border rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white w-fit mb-2", feature.color)}>
            <feature.icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
          <p className="text-xs text-muted-foreground">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
)

const ProfileStep = ({ onProfileUpdate }: { onProfileUpdate: (data: any) => void }) => {
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    company: "",
    teamSize: [10],
    monthlySpend: [5000]
  })

  const roles = [
    { id: "cfo", label: "CFO", icon: DollarSign, color: "from-green-400 to-green-600" },
    { id: "cto", label: "CTO", icon: Database, color: "from-blue-400 to-blue-600" },
    { id: "devops", label: "DevOps", icon: Zap, color: "from-purple-400 to-purple-600" },
    { id: "manager", label: "Manager", icon: Users, color: "from-orange-400 to-orange-600" }
  ]

  React.useEffect(() => {
    onProfileUpdate(profile)
  }, [profile])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tell us about yourself ✨</h2>
        <p className="text-muted-foreground">We'll personalize your experience with love</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your lovely name..."
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="company" className="text-sm font-medium">Company</Label>
            <Input
              id="company"
              placeholder="Your amazing company..."
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Team Size</Label>
            <Slider
              value={profile.teamSize}
              onValueChange={(value) => setProfile({ ...profile, teamSize: value })}
              max={100}
              min={1}
              step={1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 person</span>
              <span className="font-medium">{profile.teamSize[0]} people</span>
              <span>100+ people</span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Monthly Cloud Spend</Label>
            <Slider
              value={profile.monthlySpend}
              onValueChange={(value) => setProfile({ ...profile, monthlySpend: value })}
              max={50000}
              min={100}
              step={100}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$100</span>
              <span className="font-medium">${profile.monthlySpend[0].toLocaleString()}</span>
              <span>$50,000+</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Your Role</Label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                className={cn(
                  "p-4 border-2 rounded-xl cursor-pointer transition-all duration-300",
                  profile.role === role.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setProfile({ ...profile, role: role.id })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white w-fit mb-2", role.color)}>
                  <role.icon className="h-4 w-4" />
                </div>
                <div className="font-medium text-sm">{role.label}</div>
                {profile.role === role.id && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const CloudsStep = ({ onCloudsUpdate }: { onCloudsUpdate: (clouds: string[]) => void }) => {
  const [selectedClouds, setSelectedClouds] = useState<string[]>([])

  const cloudProviders = [
    { id: "aws", name: "Amazon Web Services", icon: "🟠", color: "from-orange-400 to-orange-600", popular: true },
    { id: "azure", name: "Microsoft Azure", icon: "🔵", color: "from-blue-400 to-blue-600", popular: true },
    { id: "gcp", name: "Google Cloud Platform", icon: "🔴", color: "from-red-400 to-red-600", popular: true },
    { id: "digitalocean", name: "DigitalOcean", icon: "🌊", color: "from-blue-400 to-cyan-400", popular: false },
    { id: "linode", name: "Linode", icon: "🟢", color: "from-green-400 to-green-600", popular: false },
    { id: "vultr", name: "Vultr", icon: "🔷", color: "from-indigo-400 to-indigo-600", popular: false }
  ]

  const toggleCloud = (cloudId: string) => {
    const newClouds = selectedClouds.includes(cloudId)
      ? selectedClouds.filter(id => id !== cloudId)
      : [...selectedClouds, cloudId]
    setSelectedClouds(newClouds)
    onCloudsUpdate(newClouds)
  }

  React.useEffect(() => {
    onCloudsUpdate(selectedClouds)
  }, [selectedClouds])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Connect your clouds ☁️</h2>
        <p className="text-muted-foreground">Select the cloud providers you're using (with love)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cloudProviders.map((cloud, index) => {
          const isSelected = selectedClouds.includes(cloud.id)
          return (
            <motion.div
              key={cloud.id}
              className={cn(
                "relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300",
                isSelected
                  ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg"
                  : "border-border hover:border-primary/50 hover:shadow-md"
              )}
              onClick={() => toggleCloud(cloud.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {cloud.popular && (
                <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600">
                  Popular
                </Badge>
              )}

              <div className="text-center space-y-3">
                <div className="text-4xl">{cloud.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{cloud.name}</h3>
                  <div className={cn(
                    "w-full h-1 rounded-full transition-all duration-500",
                    isSelected ? `bg-gradient-to-r ${cloud.color}` : "bg-muted"
                  )} />
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="h-5 w-5 text-primary" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {selectedClouds.length > 0 && (
        <motion.div
          className="text-center p-4 bg-green-50 border border-green-200 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-2 text-green-800">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">
              Great choice! We'll help optimize {selectedClouds.length} cloud provider{selectedClouds.length > 1 ? 's' : ''} with love 💚
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

const GoalsStep = ({ onGoalsUpdate }: { onGoalsUpdate: (goals: string[]) => void }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const optimizationGoals = [
    { id: "cost", title: "Reduce Costs", desc: "Save money on cloud bills", icon: DollarSign, color: "from-green-400 to-green-600" },
    { id: "performance", title: "Boost Performance", desc: "Optimize resource utilization", icon: Zap, color: "from-blue-400 to-blue-600" },
    { id: "security", title: "Enhance Security", desc: "Improve compliance & governance", icon: Shield, color: "from-purple-400 to-purple-600" },
    { id: "sustainability", title: "Go Green", desc: "Reduce carbon footprint", icon: Globe, color: "from-emerald-400 to-emerald-600" },
    { id: "automation", title: "Automate Operations", desc: "Reduce manual tasks", icon: Rocket, color: "from-orange-400 to-orange-600" },
    { id: "insights", title: "Get Insights", desc: "Better visibility & reporting", icon: Lightbulb, color: "from-yellow-400 to-yellow-600" }
  ]

  const toggleGoal = (goalId: string) => {
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId]
    setSelectedGoals(newGoals)
    onGoalsUpdate(newGoals)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Set your goals 🎯</h2>
        <p className="text-muted-foreground">What would you like to optimize? (Select all that apply)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optimizationGoals.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.id)
          return (
            <motion.div
              key={goal.id}
              className={cn(
                "p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 relative",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border hover:border-primary/50 hover:shadow-md"
              )}
              onClick={() => toggleGoal(goal.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-br text-white", goal.color)}>
                  <goal.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{goal.title}</h3>
                  <p className="text-xs text-muted-foreground">{goal.desc}</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {selectedGoals.length > 0 && (
        <motion.div
          className="text-center p-4 bg-purple-50 border border-purple-200 rounded-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center space-x-2 text-purple-800">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">
              Perfect! We'll help you achieve {selectedGoals.length} optimization goal{selectedGoals.length > 1 ? 's' : ''} 🎯
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

const SuccessStep = () => {
  const router = useRouter()

  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="relative mx-auto w-32 h-32"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8">
          <Award className="h-16 w-16 text-white" />
        </div>
        <motion.div
          className="absolute -top-4 -right-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Star className="h-8 w-8 text-yellow-500" />
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-green-600">You're all set! 🎉</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Welcome to the most loveable cloud optimization platform! Let's start saving money and making your infrastructure amazing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[
          { value: "$12,450", label: "Potential Monthly Savings", icon: DollarSign },
          { value: "94%", label: "Optimization Score Target", icon: Target },
          { value: "24/7", label: "Continuous Monitoring", icon: Heart }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <div className="p-2 bg-green-500 text-white rounded-lg w-fit mx-auto mb-2">
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-green-700">{stat.value}</div>
            <div className="text-xs text-green-600">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <Button
        size="lg"
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8"
        onClick={() => router.push('/dashboard/optscale')}
      >
        <Rocket className="h-5 w-5 mr-2" />
        Start Optimizing with Love!
        <Sparkles className="h-5 w-5 ml-2" />
      </Button>
    </motion.div>
  )
}

export default function LovelyOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState({
    profile: {},
    clouds: [],
    goals: []
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]
    switch (step.component) {
      case "welcome":
        return <WelcomeStep />
      case "profile":
        return (
          <ProfileStep
            onProfileUpdate={(data) => setUserData({ ...userData, profile: data })}
          />
        )
      case "clouds":
        return (
          <CloudsStep
            onCloudsUpdate={(clouds) => setUserData({ ...userData, clouds })}
          />
        )
      case "goals":
        return (
          <GoalsStep
            onGoalsUpdate={(goals) => setUserData({ ...userData, goals })}
          />
        )
      case "success":
        return <SuccessStep />
      default:
        return <WelcomeStep />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={steps.length} />

          {/* Main Content */}
          <Card className="bg-card/80 backdrop-blur-lg border border-border shadow-2xl">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                <motion.div key={currentStep}>
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="w-20" /> // Spacer for final step
            )}
          </div>
        </div>
      </div>
    </div>
  )
}