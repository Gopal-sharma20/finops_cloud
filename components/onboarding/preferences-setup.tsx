"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Palette,
  Moon,
  Sun,
  Monitor
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PreferencesData {
  notifications: {
    email: boolean
    push: boolean
    costAlerts: boolean
    weeklyReports: boolean
    budgetWarnings: boolean
    anomalyDetection: boolean
  }
  display: {
    theme: "light" | "dark" | "system"
    currency: string
    timezone: string
    dateFormat: string
    compactView: boolean
  }
  alerts: {
    budgetThreshold: number
    anomalyThreshold: number
    reportFrequency: string
    costIncreaseAlert: number
  }
  privacy: {
    shareUsageData: boolean
    enableAnalytics: boolean
    allowMarketingEmails: boolean
  }
}

interface PreferencesSetupProps {
  onSave: (preferences: PreferencesData) => Promise<void>
  initialData?: Partial<PreferencesData>
  className?: string
}

const defaultPreferences: PreferencesData = {
  notifications: {
    email: true,
    push: true,
    costAlerts: true,
    weeklyReports: true,
    budgetWarnings: true,
    anomalyDetection: true
  },
  display: {
    theme: "system",
    currency: "USD",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    compactView: false
  },
  alerts: {
    budgetThreshold: 80,
    anomalyThreshold: 20,
    reportFrequency: "weekly",
    costIncreaseAlert: 15
  },
  privacy: {
    shareUsageData: false,
    enableAnalytics: true,
    allowMarketingEmails: false
  }
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" }
]

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Mumbai",
  "Australia/Sydney"
]

const PreferencesSetup: React.FC<PreferencesSetupProps> = ({
  onSave,
  initialData = {},
  className
}) => {
  const [preferences, setPreferences] = useState<PreferencesData>({
    ...defaultPreferences,
    ...initialData
  })
  const [loading, setLoading] = useState(false)

  const updatePreferences = (section: keyof PreferencesData, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(preferences)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Customize Your Experience</h2>
        <p className="text-muted-foreground">
          Configure your preferences to get the most out of CloudOptima
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Notifications</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    updatePreferences("notifications", "email", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Push Notifications</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Get instant alerts on your device
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    updatePreferences("notifications", "push", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Cost Alerts</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Budget threshold and overspend warnings
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.costAlerts}
                  onCheckedChange={(checked) =>
                    updatePreferences("notifications", "costAlerts", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Weekly Reports</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automated cost and usage summaries
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    updatePreferences("notifications", "weeklyReports", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Anomaly Detection</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Unusual spending pattern alerts
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.anomalyDetection}
                  onCheckedChange={(checked) =>
                    updatePreferences("notifications", "anomalyDetection", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Display & Localization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={preferences.display.theme}
                  onValueChange={(value: "light" | "dark" | "system") =>
                    updatePreferences("display", "theme", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center space-x-2">
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={preferences.display.currency}
                  onValueChange={(value) =>
                    updatePreferences("display", "currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferences.display.timezone}
                  onValueChange={(value) =>
                    updatePreferences("display", "timezone", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Compact View</Label>
                  <p className="text-xs text-muted-foreground">
                    Show more data in less space
                  </p>
                </div>
                <Switch
                  checked={preferences.display.compactView}
                  onCheckedChange={(checked) =>
                    updatePreferences("display", "compactView", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Alert Thresholds</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Budget Warning Threshold</Label>
                  <span className="text-sm text-muted-foreground">
                    {preferences.alerts.budgetThreshold}%
                  </span>
                </div>
                <Slider
                  value={[preferences.alerts.budgetThreshold]}
                  onValueChange={([value]) =>
                    updatePreferences("alerts", "budgetThreshold", value)
                  }
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when budget utilization reaches this percentage
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Anomaly Sensitivity</Label>
                  <span className="text-sm text-muted-foreground">
                    {preferences.alerts.anomalyThreshold}%
                  </span>
                </div>
                <Slider
                  value={[preferences.alerts.anomalyThreshold]}
                  onValueChange={([value]) =>
                    updatePreferences("alerts", "anomalyThreshold", value)
                  }
                  max={50}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Detect cost increases above this threshold
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Cost Increase Alert</Label>
                  <span className="text-sm text-muted-foreground">
                    {preferences.alerts.costIncreaseAlert}%
                  </span>
                </div>
                <Slider
                  value={[preferences.alerts.costIncreaseAlert]}
                  onValueChange={([value]) =>
                    updatePreferences("alerts", "costIncreaseAlert", value)
                  }
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Alert on day-over-day cost increases
                </p>
              </div>

              <div className="space-y-2">
                <Label>Report Frequency</Label>
                <Select
                  value={preferences.alerts.reportFrequency}
                  onValueChange={(value) =>
                    updatePreferences("alerts", "reportFrequency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Privacy & Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Share Usage Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve CloudOptima with anonymous usage data
                  </p>
                </div>
                <Switch
                  checked={preferences.privacy.shareUsageData}
                  onCheckedChange={(checked) =>
                    updatePreferences("privacy", "shareUsageData", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow analytics to enhance your experience
                  </p>
                </div>
                <Switch
                  checked={preferences.privacy.enableAnalytics}
                  onCheckedChange={(checked) =>
                    updatePreferences("privacy", "enableAnalytics", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive product updates and tips
                  </p>
                </div>
                <Switch
                  checked={preferences.privacy.allowMarketingEmails}
                  onCheckedChange={(checked) =>
                    updatePreferences("privacy", "allowMarketingEmails", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={loading}
          size="lg"
          className="min-w-[200px]"
        >
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}

export { PreferencesSetup, type PreferencesData }