"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CostTrendChart } from "@/components/charts/cost-trend-chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Target,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Users,
  Building,
  Globe,
  Download,
  Share2,
  Settings,
  Bell,
  ChevronRight,
  Calendar,
  Cloud,
  LogOut,
  RefreshCw
} from "lucide-react"
import { cn, formatCurrency, formatPercentage } from "@/lib/utils"
import { useAzureProfiles } from "@/hooks/useAzureProfile"
import { useAzureCost } from "@/hooks/useAzureCost"
import { useBudget } from "@/hooks/useBudget"
import { useCostTrends } from "@/hooks/useCostTrends"
import { useSavings } from "@/hooks/useSavings"
import { useEfficiency } from "@/hooks/useEfficiency"
import { useForecast } from "@/hooks/useForecast"
import { logout } from "@/lib/auth/logout"

const mockBusinessEvents = [
  { date: "2024-01-03", label: "Product Launch", type: "milestone" as const },
  { date: "2024-01-05", label: "VM Anomaly", type: "anomaly" as const }
]
