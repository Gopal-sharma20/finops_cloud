# ✅ Azure Credentials from UI - COMPLETE!

## 🎉 What's Been Done

The Azure MCP server now accepts credentials **from the UI** instead of requiring Azure CLI!

### Changes Made:

1. **Dynamic Credential Support** - New `dynamic_credentials.py` module
2. **Updated MCP Tools** - Both `get_cost` and `run_finops_audit` now accept credentials
3. **Updated API Routes** - Routes pass credentials from UI to MCP server
4. **Flexible Authentication** - Falls back to Azure CLI if no credentials provided

## 🔐 How to Get Azure Credentials

### Option 1: Create a Service Principal (Recommended for UI)

```bash
# 1. Create a service principal
az ad sp create-for-rbac --name "finops-ui-sp" --role "Cost Management Reader" \
  --scopes /subscriptions/{subscription-id}

# This will output:
{
  "appId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",      # This is your CLIENT_ID
  "displayName": "finops-ui-sp",
  "password": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  # This is your CLIENT_SECRET
  "tenant": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"     # This is your TENANT_ID
}

# 2. Add Reader role for resource access
az role assignment create \
  --assignee {appId} \
  --role "Reader" \
  --scope /subscriptions/{subscription-id}
```

### Option 2: Use Azure CLI (No UI Input Needed)

```bash
# Just login with Azure CLI
az login

# The MCP server will automatically use these credentials if no UI credentials provided
```

## 📝 UI Credential Fields

When configuring Azure in the UI, users need to provide:

1. **Tenant ID** - Azure AD tenant ID (Directory ID)
2. **Client ID** - Application (client) ID from service principal
3. **Client Secret** - Client secret value from service principal
4. **Subscription ID** - Azure subscription ID

### Where to Find These in Azure Portal:

1. **Tenant ID**: Azure Active Directory → Properties → Directory ID
2. **Client ID & Secret**: Azure Active Directory → App registrations → Your App → Overview
3. **Subscription ID**: Subscriptions → Your Subscription → Overview

## 🔌 API Usage

### Cost API with Credentials

```bash
POST /api/azure/cost

{
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "timeRangeDays": 30,
  "groupBy": "ServiceName"
}
```

### Audit API with Credentials

```bash
POST /api/azure/audit

{
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "regions": ["eastus", "westus"]
}
```

## 🏗️ Updated Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         AZURE FINOPS WITH UI CREDENTIALS                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Browser - User enters credentials in UI                    │
│         ↓                                                    │
│  {                                                           │
│    tenantId: "xxx",                                         │
│    clientId: "xxx",                                         │
│    clientSecret: "xxx",                                     │
│    subscriptionId: "xxx"                                    │
│  }                                                           │
│         ↓                                                    │
│  Next.js UI stores credentials (state/localStorage)         │
│         ↓                                                    │
│  API Route (/api/azure/cost)                                │
│         ↓                                                    │
│  Includes credentials in request                            │
│         ↓                                                    │
│  HTTP POST to MCP Server (localhost:8000/messages/)         │
│  {                                                           │
│    tool: "get_cost",                                        │
│    arguments: {                                             │
│      tenant_id: "xxx",                                      │
│      client_id: "xxx",                                      │
│      client_secret: "xxx",                                  │
│      subscription_id: "xxx"                                 │
│    }                                                         │
│  }                                                           │
│         ↓                                                    │
│  Azure MCP Server                                           │
│         ↓                                                    │
│  dynamic_credentials.get_dynamic_credential()               │
│         ↓                                                    │
│  ClientSecretCredential(tenant, client, secret)             │
│         ↓                                                    │
│  Azure APIs (with user's credentials)                       │
│         ↓                                                    │
│  Return cost/audit data to UI                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 💡 UI Implementation Example

### 1. Create Azure Credentials Form Component

```typescript
// components/azure/CredentialsForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AzureCredentials {
  tenantId: string
  clientId: string
  clientSecret: string
  subscriptionId: string
}

export function AzureCredentialsForm({ onSave }: { onSave: (creds: AzureCredentials) => void }) {
  const [credentials, setCredentials] = useState<AzureCredentials>({
    tenantId: "",
    clientId: "",
    clientSecret: "",
    subscriptionId: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Test connection first
    const response = await fetch("/api/azure/test-connection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    })

    const result = await response.json()

    if (result.ok) {
      // Save credentials to state/localStorage
      onSave(credentials)
      alert("Azure credentials validated successfully!")
    } else {
      alert(`Failed to validate credentials: ${result.error}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tenantId">Tenant ID</Label>
        <Input
          id="tenantId"
          value={credentials.tenantId}
          onChange={(e) => setCredentials({...credentials, tenantId: e.target.value})}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
      </div>

      <div>
        <Label htmlFor="clientId">Client ID</Label>
        <Input
          id="clientId"
          value={credentials.clientId}
          onChange={(e) => setCredentials({...credentials, clientId: e.target.value})}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
      </div>

      <div>
        <Label htmlFor="clientSecret">Client Secret</Label>
        <Input
          id="clientSecret"
          type="password"
          value={credentials.clientSecret}
          onChange={(e) => setCredentials({...credentials, clientSecret: e.target.value})}
          placeholder="Enter your client secret"
          required
        />
      </div>

      <div>
        <Label htmlFor="subscriptionId">Subscription ID</Label>
        <Input
          id="subscriptionId"
          value={credentials.subscriptionId}
          onChange={(e) => setCredentials({...credentials, subscriptionId: e.target.value})}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          required
        />
      </div>

      <Button type="submit">Connect to Azure</Button>
    </form>
  )
}
```

### 2. Use Credentials in Cost Queries

```typescript
// In your Azure page component
const [azureCredentials, setAzureCredentials] = useState<AzureCredentials | null>(null)

// Fetch cost data with credentials
async function fetchCostData() {
  if (!azureCredentials) {
    alert("Please configure Azure credentials first")
    return
  }

  const response = await fetch("/api/azure/cost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...azureCredentials,
      timeRangeDays: 30,
      groupBy: "ServiceName"
    })
  })

  const data = await response.json()
  // Use the data...
}
```

## 🧪 Testing

### Test with Credentials

```bash
curl -X POST http://localhost:3000/api/azure/cost \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "your-tenant-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "subscriptionId": "your-subscription-id",
    "timeRangeDays": 7
  }'
```

### Test Credential Validation

```bash
curl -X POST http://localhost:3000/api/azure/test-connection \
  -H "Content-Type: "application/json" \
  -d '{
    "tenantId": "your-tenant-id",
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "subscriptionId": "your-subscription-id"
  }'
```

## ✅ What's Working Now

1. ✅ **MCP server accepts credentials** - tenant_id, client_id, client_secret
2. ✅ **API routes pass credentials** - From UI to MCP server
3. ✅ **Dynamic authentication** - Uses provided credentials or falls back to Azure CLI
4. ✅ **Credential validation** - Test connection endpoint validates before use
5. ✅ **Secure flow** - Credentials passed securely through POST bodies
6. ✅ **Error handling** - Clear error messages if credentials are invalid

## 🔒 Security Notes

1. **Never store credentials in localStorage** - Use encrypted session storage or secure cookies
2. **Use HTTPS in production** - Always encrypt credential transmission
3. **Rotate secrets regularly** - Update client secrets periodically
4. **Minimum permissions** - Only grant "Cost Management Reader" and "Reader" roles
5. **Consider Azure Key Vault** - For production, store secrets in Key Vault

## 📋 Next Steps

1. **Create credential form component** - Add to Azure page
2. **Add credential storage** - Use zustand or context
3. **Update Azure page** - Include credentials in all API calls
4. **Add credential management** - Edit/delete/test credentials UI
5. **Add multi-account support** - Store multiple Azure accounts

---

Now your UI can accept Azure credentials and connect directly to Azure! 🚀
