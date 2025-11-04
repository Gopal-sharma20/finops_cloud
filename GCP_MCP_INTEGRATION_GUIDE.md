# GCP MCP Integration Guide

## Overview

This document explains how to integrate **real data** from the GCP MCP server into the FinOps Cloud application, replacing mock data with actual Google Cloud Platform resource information.

## GCP MCP Server Capabilities

The GCP MCP server (running on `http://localhost:3002`) provides the following endpoints:

### 1. `/api/cost` - Resource Inventory
**Returns:** Compute instances, storage buckets, Cloud SQL instances

**Example Response:**
```json
{
  "success": true,
  "data": {
    "compute": {
      "content": [{
        "type": "text",
        "text": "[{\"id\":\"...\",\"name\":\"devozylite\",\"machineType\":\"e2-medium\",\"status\":\"RUNNING\",\"zone\":\"us-central1-a\"}]"
      }]
    },
    "storage": { "content": [{"type": "text", "text": "[]"}] },
    "sql": { "content": [{"type": "text", "text": "[]"}] }
  }
}
```

### 2. `/api/audit` - FinOps Audit
**Returns:** Unattached disks, idle static IPs, cost recommendations

**Findings Include:**
- Unattached persistent disks (wasting money)
- Reserved but unused static IP addresses
- Machine type rightsizing recommendations

### 3. `/api/recommender/list` - Cost Optimization
**Returns:** Google Cloud Recommender API suggestions

**Recommendation Types:**
- `google.compute.instance.MachineTypeRecommender` - VM rightsizing
- `google.compute.disk.IdleResourceRecommender` - Idle disk detection
- `google.compute.address.IdleResourceRecommender` - Unused IP addresses
- `google.compute.commitment.UsageCommitmentRecommender` - CUD opportunities

### 4. `/api/gcloud/execute` - Direct gcloud Commands
**Allows:** Execution of any gcloud CLI command

**Example:**
```typescript
POST /api/gcloud/execute
{
  "args": ["compute", "instances", "list", "--format=json"]
}
```

### 5. `/api/logs/query` - Cloud Logging
**Returns:** Log entries from Cloud Logging

### 6. `/api/metrics/timeseries` - Cloud Monitoring
**Returns:** Metrics data for charts (CPU, memory, network, etc.)

---

## Current Integration Status

### ✅ Already Integrated (Real Data)
1. **Resource Inventory** - `/app/clouds/gcp/page.tsx` lines 459-537
   - Compute Engine instances
   - Cloud Storage buckets
   - Cloud SQL instances
   - Uses `useGcpCost` hook

### ❌ Still Using Mock Data
1. **Recommendations** - Lines 126-195 (`gcpRecommendations` array)
2. **Utilization Charts** - Lines 103-112 (`gcpUtilizationData` array)
3. **Cost Trends** - Lines 115-123 (`gcpCostTrends` array)
4. **Carbon Footprint** - Lines 198-205 (`carbonData` array) *(Optional - external data)*
5. **Regional Costs** - Lines 77-86 (`gcpRegions` array with fake costs)

---

## Step-by-Step Integration Plan

### Phase 1: Replace Recommendations with Real Data ✅ DONE

**Created Files:**
- `/hooks/useGcpRecommendations.ts` - Hook to fetch recommendations
- `/hooks/useGcpAudit.ts` - Hook to fetch audit findings

**Next Step:** Update `/app/clouds/gcp/page.tsx` to use these hooks

**Implementation:**
```typescript
// In page.tsx, add:
import { useGcpRecommendations } from "@/hooks/useGcpRecommendations"
import { useGcpAudit } from "@/hooks/useGcpAudit"

// Inside component:
const { data: recommendationsData } = useGcpRecommendations({}, true)
const { data: auditData } = useGcpAudit({}, true)

// Parse real recommendations:
const realRecommendations = useMemo(() => {
  if (!recommendationsData?.success) return gcpRecommendations // fallback to mock

  try {
    const content = recommendationsData.data?.content?.[0]?.text
    if (content) {
      const recs = JSON.parse(content)
      return recs.map((rec: any) => ({
        id: rec.name,
        title: rec.recommenderSubtype || "Optimization",
        service: rec.recommenderSubtype?.includes("compute") ? "Compute Engine" : "GCP",
        region: rec.name.split("/")[3] || "global",
        description: rec.description || "",
        impact: rec.priority === "P1" ? "high" : rec.priority === "P2" ? "medium" : "low",
        effort: "low",
        currentCost: 0, // Calculate from rec.primaryImpact.costProjection
        projectedCost: 0,
        savings: Math.abs(parseInt(rec.primaryImpact?.costProjection?.cost?.units || "0")),
        confidence: 90,
        resources: [],
        timeline: "This month",
        gcpSpecific: "Google Cloud Recommender",
        mlInsight: rec.description
      }))
    }
  } catch (e) {
    console.error("Failed to parse recommendations:", e)
  }

  return gcpRecommendations // fallback
}, [recommendationsData])

// Then use realRecommendations instead of gcpRecommendations
```

### Phase 2: Add Metrics for Utilization Charts

**Create:** `/hooks/useGcpMetrics.ts`

**Fetch:** Real CPU, memory, network metrics from Cloud Monitoring

**Implementation:**
```typescript
export function useGcpMetrics(params: {
  projectId?: string;
  metricType: string;
  hours?: number;
}, enabled: boolean = true) {
  return useQuery({
    queryKey: ["gcp-metrics", params],
    queryFn: async () => {
      const endTime = new Date().toISOString()
      const startTime = new Date(Date.now() - (params.hours || 24) * 60 * 60 * 1000).toISOString()

      const response = await fetch("/api/gcp/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: params.projectId,
          filter: `metric.type = "${params.metricType}"`,
          interval: { startTime, endTime }
        })
      })

      return await response.json()
    },
    enabled,
    staleTime: 5 * 60 * 1000
  })
}
```

**Required Metrics:**
- `compute.googleapis.com/instance/cpu/utilization`
- `compute.googleapis.com/instance/network/received_bytes_count`
- `storage.googleapis.com/storage/object_count`

### Phase 3: Add API Routes

**Create:** `/app/api/gcp/metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { gcpClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, filter, interval } = body;

    const data = await gcpClient.callAPI("/api/metrics/timeseries", {
      projectId,
      filter,
      interval
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GCP metrics API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

### Phase 4: Real Cost Trends

**Option 1:** If BigQuery billing export is enabled
- Query BigQuery dataset for historical costs
- Group by day/week for trend analysis

**Option 2:** If no BigQuery export (current situation)
- Use current resource inventory × estimated costs
- Cannot show historical trends without billing export
- Show current cost projection instead

**Recommendation:** Display a message asking user to enable BigQuery billing export for historical cost data.

---

## Testing the Integration

### 1. Start the GCP MCP Server
```bash
pm2 list
# Should show: gcp-finops-mcp-server (online)
```

### 2. Test MCP Server Health
```bash
curl http://localhost:3002/health
# Should return: {"status":"ok","service":"GCP FinOps MCP Server"...}
```

### 3. Test Cost Endpoint
```bash
curl -X POST http://localhost:3002/api/cost \
  -H "Content-Type: application/json" \
  -d '{"projectId":"fresh-almanac-445207-q9"}'
```

### 4. Test Recommender Endpoint
```bash
curl -X POST http://localhost:3002/api/recommender/list \
  -H "Content-Type: application/json" \
  -d '{"projectId":"fresh-almanac-445207-q9","recommenderType":"google.compute.instance.MachineTypeRecommender"}'
```

### 5. Test Audit Endpoint
```bash
curl -X POST http://localhost:3002/api/audit \
  -H "Content-Type: application/json" \
  -d '{"projectId":"fresh-almanac-445207-q9"}'
```

### 6. Run the Next.js App
```bash
cd /root/git/finops_cloud
npm run dev
```

### 7. Check Browser Console
- Open DevTools → Console
- Look for logs:
  - `📊 Fetching GCP cost data...`
  - `✅ GCP cost data fetched`
  - `🎯 Fetching GCP recommendations...`
  - `🔍 Fetching GCP audit data...`

### 8. Verify Real Data Display
- Check if the UI shows "Real Data" badge
- Verify resource counts match actual GCP resources
- Check if costs are calculated based on actual resources

---

## Key Files Reference

```
finops_cloud/
├── app/
│   ├── clouds/gcp/page.tsx          # Main GCP dashboard UI
│   └── api/gcp/
│       ├── cost/route.ts            # ✅ Real data
│       ├── audit/route.ts           # ✅ Real data
│       ├── recommender/route.ts     # ✅ Real data
│       ├── test-connection/route.ts # ✅ Real data
│       └── metrics/route.ts         # ⚠️ TO BE CREATED
├── hooks/
│   ├── useGcpCost.ts                # ✅ Real data
│   ├── useGcpRecommendations.ts     # ✅ CREATED
│   ├── useGcpAudit.ts               # ✅ CREATED
│   └── useGcpMetrics.ts             # ⚠️ TO BE CREATED
└── lib/mcp/
    ├── client.ts                    # ✅ GCP MCP client
    └── index.ts                     # ✅ Exports
```

---

## What Data Can Be Shown

### ✅ Currently Available (Real Data)
1. **Compute Engine Instances**
   - Name, machine type, zone, status
   - Count of running vs terminated instances

2. **Cloud Storage Buckets**
   - Bucket names, locations, storage class

3. **Cloud SQL Instances**
   - Instance names, regions, database versions, tiers

4. **Unattached Disks** (via audit)
   - Disks not attached to any VM (cost savings opportunity)

5. **Idle Static IPs** (via audit)
   - Reserved IPs not in use (cost savings)

6. **Cost Recommendations** (via recommender)
   - VM rightsizing suggestions
   - Idle resource detection
   - Committed use discount opportunities

### ❌ NOT Available Without Additional Setup
1. **Historical Cost Data**
   - Requires BigQuery billing export
   - Cannot get past 60 days of costs via API
   - User must enable in Cloud Console

2. **Detailed Cost Breakdown by Service**
   - Requires BigQuery export
   - Can only estimate based on current resources

3. **Real-time Utilization Metrics**
   - Available via Cloud Monitoring API
   - Requires additional API calls (can add)

4. **Carbon Footprint**
   - Not available via GCP API
   - Requires external data source or manual calculation

---

## Recommended Next Steps

### Immediate (High Priority)
1. ✅ Create hooks for recommendations and audit
2. Update `/app/clouds/gcp/page.tsx` to use real recommendations
3. Replace mock recommendation cards with real data
4. Test the integration

### Short Term (Medium Priority)
1. Create metrics hook for utilization charts
2. Add `/api/gcp/metrics/route.ts` endpoint
3. Fetch real CPU/memory/network metrics
4. Update utilization charts with real data

### Long Term (Nice to Have)
1. Add notification for BigQuery billing export setup
2. Create billing export setup wizard
3. Add historical cost query (if export exists)
4. Implement carbon footprint calculation

---

## GCP MCP Server Architecture

```
┌─────────────────────────────────────────────────────┐
│  Next.js App (finops_cloud)                         │
│  http://localhost:3000                              │
│                                                     │
│  ┌─────────────────┐    ┌─────────────────┐       │
│  │  /clouds/gcp    │───▶│  /api/gcp/*     │       │
│  │  (UI Page)      │    │  (API Routes)   │       │
│  └─────────────────┘    └────────┬────────┘       │
│                                   │                 │
└───────────────────────────────────┼─────────────────┘
                                    │
                                    │ HTTP POST
                                    ▼
          ┌──────────────────────────────────────┐
          │  GCP MCP Server (gcloud-mcp)         │
          │  http://localhost:3002               │
          │                                      │
          │  Endpoints:                          │
          │  • POST /api/cost                    │
          │  • POST /api/audit                   │
          │  • POST /api/recommender/list        │
          │  • POST /api/gcloud/execute          │
          │  • POST /api/logs/query              │
          │  • POST /api/metrics/timeseries      │
          │  • GET  /health                      │
          │  • GET  /api/tools/list              │
          └──────────────┬───────────────────────┘
                         │
                         │ gcloud CLI + APIs
                         ▼
                ┌────────────────────┐
                │   Google Cloud     │
                │   Platform         │
                │                    │
                │  • Compute Engine  │
                │  • Cloud Storage   │
                │  • Cloud SQL       │
                │  • Recommender API │
                │  • Cloud Logging   │
                │  • Cloud Monitoring│
                └────────────────────┘
```

---

## Summary

The GCP MCP server provides **real-time access** to your Google Cloud Platform resources and recommendations. By integrating these endpoints into the FinOps Cloud UI, you can:

1. **Replace mock data** with actual resource information
2. **Show real cost optimization recommendations** from Google Cloud Recommender
3. **Display actual resource utilization** from Cloud Monitoring
4. **Identify cost savings** through audit findings (idle resources)

The integration is straightforward - fetch data from the MCP server, parse JSON responses, and render them in the UI components. The MCP server handles all authentication and API calls to GCP.

**Next Step:** Update the GCP page UI to use the new hooks and display real recommendations!
