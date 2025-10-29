"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useProfileCost } from "@/hooks/useAWSCost"
import { useProfileAudit } from "@/hooks/useAWSAudit"
import {
  Cloud,
  Server,
  HardDrive,
  Network,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react"

export default function AWSLivePage() {
  // Fetch real AWS cost data
  const {
    data: costData,
    isLoading: costLoading,
    error: costError,
    refetch: refetchCost,
  } = useProfileCost("default", 30)

  // Fetch real AWS audit data
  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
    refetch: refetchAudit,
  } = useProfileAudit("default", ["us-east-1"])

  const isLoading = costLoading || auditLoading
  const hasError = costError || auditError

  const handleRefresh = () => {
    refetchCost()
    refetchAudit()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Cloud className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                AWS Live Data Dashboard 🔴
              </h1>
              <p className="text-muted-foreground">Real-time AWS cost and audit data</p>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-500 to-orange-600"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {hasError && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Error loading data</p>
                  <p className="text-sm">
                    {costError?.message || auditError?.message}
                  </p>
                  <p className="text-xs mt-1">
                    Make sure AWS credentials are configured in ~/.aws/credentials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
              <p className="text-muted-foreground">Fetching data from AWS...</p>
            </CardContent>
          </Card>
        )}

        {/* Cost Data */}
        {!isLoading && !hasError && costData && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800 font-medium">
                        Total Cost (30 Days)
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        ${costData.totalCost?.toLocaleString('en-US') || "0"}
                      </p>
                      <p className="text-xs text-green-600">
                        {costData.periodStartDate} to {costData.periodEndDate}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        AWS Account
                      </p>
                      <p className="text-2xl font-bold text-blue-900 font-mono">
                        {costData.accountId || "N/A"}
                      </p>
                      <p className="text-xs text-blue-600">Profile: default</p>
                    </div>
                    <Cloud className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-800 font-medium">
                        Services
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        {Object.keys(costData.costByService || {}).length}
                      </p>
                      <p className="text-xs text-purple-600">Active services</p>
                    </div>
                    <Server className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost by Service */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Cost by Service (Last 30 Days)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(costData.costByService || {})
                    .slice(0, 10)
                    .map(([service, cost]) => (
                      <div
                        key={service}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Server className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">{service}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            ${(cost as number).toLocaleString('en-US')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(
                              ((cost as number) / (costData.totalCost || 1)) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Data */}
        {!isLoading && !hasError && auditData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stopped EC2 Instances */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Server className="h-4 w-4 text-red-600" />
                  <span>Stopped EC2 Instances</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {auditData.stoppedEC2Instances?.length || 0}
                </div>
                <div className="space-y-2">
                  {auditData.stoppedEC2Instances
                    ?.slice(0, 5)
                    .map((instance: any) => (
                      <div
                        key={instance.instanceId}
                        className="p-2 bg-red-50 rounded text-xs"
                      >
                        <div className="font-mono text-red-700">
                          {instance.instanceId}
                        </div>
                        <div className="text-muted-foreground">
                          {instance.instanceType} • {instance.region}
                        </div>
                      </div>
                    ))}
                  {(auditData.stoppedEC2Instances?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No stopped instances found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unattached EBS Volumes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <HardDrive className="h-4 w-4 text-yellow-600" />
                  <span>Unattached EBS Volumes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {auditData.unattachedEBSVolumes?.length || 0}
                </div>
                <div className="space-y-2">
                  {auditData.unattachedEBSVolumes
                    ?.slice(0, 5)
                    .map((volume: any) => (
                      <div
                        key={volume.volumeId}
                        className="p-2 bg-yellow-50 rounded text-xs"
                      >
                        <div className="font-mono text-yellow-700">
                          {volume.volumeId}
                        </div>
                        <div className="text-muted-foreground">
                          {volume.size}GB • {volume.volumeType} • {volume.region}
                        </div>
                      </div>
                    ))}
                  {(auditData.unattachedEBSVolumes?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No unattached volumes found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Unassociated EIPs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Network className="h-4 w-4 text-orange-600" />
                  <span>Unassociated Elastic IPs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">
                  {auditData.unassociatedEIPs?.length || 0}
                </div>
                <div className="space-y-2">
                  {auditData.unassociatedEIPs?.slice(0, 5).map((eip: any) => (
                    <div
                      key={eip.allocationId}
                      className="p-2 bg-orange-50 rounded text-xs"
                    >
                      <div className="font-mono text-orange-700">
                        {eip.publicIp}
                      </div>
                      <div className="text-muted-foreground">
                        {eip.allocationId} • {eip.region}
                      </div>
                    </div>
                  ))}
                  {(auditData.unassociatedEIPs?.length || 0) === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No unassociated IPs found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Status */}
        {!isLoading && !hasError && auditData?.budgetStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auditData.budgetStatus.map((budget: any) => (
                  <div
                    key={budget.budgetName}
                    className="p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{budget.budgetName}</h3>
                      <Badge
                        variant={
                          budget.status === "EXCEEDED"
                            ? "destructive"
                            : budget.status === "WARNING"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {budget.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Limit:</span>
                        <span className="font-semibold">
                          ${budget.budgetLimit.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actual:</span>
                        <span className="font-semibold">
                          ${budget.actualSpend.toLocaleString('en-US')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Used:</span>
                        <span className="font-semibold">
                          {budget.percentUsed}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full ${
                          budget.percentUsed >= 100
                            ? "bg-red-600"
                            : budget.percentUsed >= 80
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!auditData.budgetStatus ||
                  auditData.budgetStatus.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No budgets configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
