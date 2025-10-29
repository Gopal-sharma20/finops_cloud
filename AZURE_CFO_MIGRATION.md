# Azure Dashboard - CFO Pattern Migration

## Overview
Replacing the current Azure dashboard with the CFO dashboard pattern, adapted for Azure-only data.

## Changes Being Made

### 1. Visual Components (Keep from CFO)
- ✅ BenchmarkCard - Industry performance comparison
- ✅ ScenarioPlanningCard - Budget projections
- ✅ Vendor Risk Matrix → Adapted to "Service Risk Matrix" for Azure
- ✅ MetricCard - Executive metrics
- ✅ CostTrendChart - Financial trending

### 2. Data Sources (Change to Azure-only)
- ❌ Remove: useAWSProfile, useAWSCost, useGcpCost
- ✅ Keep: useAzureProfiles, useAzureCost
- ✅ Keep: useBudget, useCostTrends, useSavings, useEfficiency, useForecast

### 3. Branding Updates
- Change from multi-cloud to Azure blue theme
- Update title from "CFO Dashboard" to "Azure Cloud Management"
- Replace multi-cloud vendor analysis with Azure service analysis

### 4. Component Adaptations

**Vendor Risk Matrix → Service Performance Matrix**
- Instead of showing AWS/Azure/GCP distribution
- Show Azure service distribution (Compute, Storage, Databases)
- Keep same visual pattern

**Budget Scenario Planning**
- Keep exact same component
- Use Azure cost data only

**Benchmark Cards**
- Keep exact same component
- Use Azure metrics only

### 5. Logout Button
- ✅ Already implemented
- Will be added to new Azure dashboard

## File Structure

```
app/clouds/azure/
├── page.tsx            ← Current Azure dashboard
├── page.backup.tsx     ← Backup of current
└── page.new.tsx        ← CFO pattern being adapted
```

## Implementation Steps

1. Copy CFO dashboard structure ✅
2. Remove multi-cloud hooks and logic
3. Adapt vendor risk to service performance
4. Update branding to Azure theme
5. Add logout button
6. Test and replace page.tsx

## Expected Result

Azure dashboard at `/clouds/azure` will have:
- Executive-level CFO dashboard visual design
- Azure-specific data only
- Industry benchmarks
- Budget scenario planning  
- Service performance analysis
- Professional financial presentation
