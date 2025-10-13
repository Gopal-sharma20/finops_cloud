"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Check,
  AlertTriangle,
  Loader2,
  Cloud,
  Shield,
  Key,
  ExternalLink,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CloudProvider {
  id: "aws" | "azure" | "gcp"
  name: string
  logo: React.ReactNode
  description: string
  requiredFields: Array<{
    key: string
    label: string
    type: "text" | "password" | "file"
    placeholder?: string
    required?: boolean
  }>
  setupInstructions: string[]
  documentationUrl: string
}

interface CloudConnectorProps {
  providers: CloudProvider[]
  onConnect: (providerId: string, credentials: Record<string, string>) => Promise<void>
  connectedProviders: string[]
  className?: string
}

const cloudProviders: CloudProvider[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    logo: <div className="w-8 h-8 bg-provider-aws rounded flex items-center justify-center text-white font-bold text-sm">AWS</div>,
    description: "Connect your AWS account for comprehensive cost monitoring across all regions and services.",
    requiredFields: [
      { key: "profileName", label: "Profile Name", type: "text", placeholder: "default", required: true },
      { key: "accessKeyId", label: "Access Key ID", type: "text", required: true },
      { key: "secretAccessKey", label: "Secret Access Key", type: "password", required: true },
      { key: "region", label: "Default Region", type: "text", placeholder: "us-east-1", required: true },
      { key: "roleArn", label: "Role ARN (Optional)", type: "text", placeholder: "arn:aws:iam::123456789012:role/FinOpsRole" }
    ],
    setupInstructions: [
      "Create an IAM user with Cost Explorer and Billing read permissions",
      "Attach the following policies: AWSBillingReadOnlyAccess, AWSCostExplorerServiceRolePolicy",
      "Generate Access Keys for the IAM user",
      "Optionally create a cross-account role for enhanced security"
    ],
    documentationUrl: "https://docs.aws.amazon.com/IAM/latest/UserGuide/"
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    logo: <div className="w-8 h-8 bg-provider-azure rounded flex items-center justify-center text-white font-bold text-xs">AZ</div>,
    description: "Integrate Azure subscriptions for detailed cost analysis and optimization recommendations.",
    requiredFields: [
      { key: "tenantId", label: "Tenant ID", type: "text", required: true },
      { key: "clientId", label: "Client ID", type: "text", required: true },
      { key: "clientSecret", label: "Client Secret", type: "password", required: true },
      { key: "subscriptionId", label: "Subscription ID", type: "text", required: true }
    ],
    setupInstructions: [
      "Register an application in Azure Active Directory",
      "Grant Cost Management Reader permissions",
      "Create a client secret for the application",
      "Assign the Reader role at the subscription level"
    ],
    documentationUrl: "https://docs.microsoft.com/en-us/azure/cost-management-billing/"
  },
  {
    id: "gcp",
    name: "Google Cloud Platform",
    logo: <div className="w-8 h-8 bg-provider-gcp rounded flex items-center justify-center text-white font-bold text-xs">GCP</div>,
    description: "Connect GCP projects for unified multi-cloud cost visibility and governance.",
    requiredFields: [
      { key: "projectId", label: "Project ID", type: "text", required: true },
      { key: "serviceAccountKey", label: "Service Account Key (JSON)", type: "file", required: true },
      { key: "billingAccountId", label: "Billing Account ID", type: "text", required: true }
    ],
    setupInstructions: [
      "Create a service account in Google Cloud Console",
      "Grant Billing Account Viewer and Cloud Asset Viewer roles",
      "Generate and download a JSON key file",
      "Enable the Cloud Billing API and Cloud Asset API"
    ],
    documentationUrl: "https://cloud.google.com/billing/docs/"
  }
]

const CloudConnector: React.FC<CloudConnectorProps> = ({
  providers = cloudProviders,
  onConnect,
  connectedProviders = [],
  className
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const testConnection = async (provider: CloudProvider) => {
    setLoading(true)
    setError(null)

    try {
      if (provider.id === "aws") {
        // Test AWS connection
        const response = await fetch("/api/aws/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            region: credentials.region || "us-east-1",
          }),
        })

        const result = await response.json()

        const isOk = response.ok && (result?.ok === true || result?.via === "mcp");
        if (!isOk) {
          throw new Error(result?.error || "Failed to connect to AWS");
        }

        // Call parent onConnect handler
        await onConnect(provider.id, credentials)
        setCredentials({})
        setSelectedProvider(null)
      } else {
        // For other providers, just call the handler
        await onConnect(provider.id, credentials)
        setCredentials({})
        setSelectedProvider(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect provider")
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (fieldKey: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }))
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Connect Your Cloud Providers</h2>
        <p className="text-muted-foreground">
          Securely connect your cloud accounts to start monitoring costs across all your infrastructure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => {
          const isConnected = connectedProviders.includes(provider.id)
          const isSelected = selectedProvider === provider.id

          return (
            <Card
              key={provider.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-md",
                isConnected && "ring-2 ring-financial-profit-500 bg-financial-profit-50/50",
                isSelected && "ring-2 ring-primary bg-primary/5",
                !isConnected && !isSelected && "hover:shadow-lg"
              )}
              onClick={() => !isConnected && setSelectedProvider(isSelected ? null : provider.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {provider.logo}
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  {isConnected && (
                    <div className="flex items-center space-x-1 text-financial-profit-600">
                      <Check className="h-4 w-4" />
                      <span className="text-xs font-medium">Connected</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  {provider.description}
                </p>

                {!isConnected && (
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProvider(isSelected ? null : provider.id)
                    }}
                  >
                    {isSelected ? "Configure" : "Connect"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedProvider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Configure {providers.find(p => p.id === selectedProvider)?.name}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {providers.find(p => p.id === selectedProvider)?.requiredFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {field.type === "file" ? (
                    <Input
                      id={field.key}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setCredentials(prev => ({
                              ...prev,
                              [field.key]: e.target?.result as string
                            }))
                          }
                          reader.readAsText(file)
                        }
                      }}
                    />
                  ) : (
                    <div className="relative">
                      <Input
                        id={field.key}
                        type={field.type === "password" && showPasswords[field.key] ? "text" : field.type}
                        placeholder={field.placeholder}
                        value={credentials[field.key] || ""}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))}
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => togglePasswordVisibility(field.key)}
                        >
                          {showPasswords[field.key] ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Key className="h-4 w-4" />
                <span>Setup Instructions</span>
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {providers.find(p => p.id === selectedProvider)?.setupInstructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(providers.find(p => p.id === selectedProvider)?.documentationUrl)}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Documentation
              </Button>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  const provider = providers.find(p => p.id === selectedProvider)
                  if (provider) testConnection(provider)
                }}
                disabled={loading || !credentials}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Connecting..." : "Test & Save Connection"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedProvider(null)
                  setCredentials({})
                  setError(null)
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { CloudConnector, type CloudProvider }
