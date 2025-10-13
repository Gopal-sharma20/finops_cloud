# 📊 Dashboard URLs - Complete Guide

## 🚀 Available Dashboards & Screens

Here are all the dashboards and screens you can access in your FinOps application:

---

## 1. 🏠 Home Page (Landing)
```
http://localhost:3000/
```
**Description:** Main landing page with overview

---

## 2. 🎯 Onboarding Pages

### Standard Onboarding
```
http://localhost:3000/onboarding
```
**Description:** Initial onboarding flow

### Lovely Onboarding
```
http://localhost:3000/onboarding/lovely
```
**Description:** Alternative onboarding experience

---

## 3. ☁️ Cloud Provider Dashboards

### AWS Cloud Management (WITH REAL DATA) ⭐
```
http://localhost:3000/clouds/aws
```
**Features:**
- ✅ **Real AWS Cost Data** from Cost Explorer
- ✅ **Real Regional Costs** for all 33+ AWS regions
- ✅ **Real Audit Findings** (stopped instances, unattached volumes, etc.)
- ✅ **Real Recommendations** based on audit
- 5 Tabs: Overview, Resources, Utilization, Costs, Recommendations
- Region filters, Timezone filters, Service filters
- Beautiful charts and visualizations

**Console Message:** `✅ Using REAL cost data`

### AWS Cloud Management (MOCK DATA ONLY) 🎭
```
http://localhost:3000/clouds/aws-mock
```
**Features:**
- Same beautiful UI as real AWS dashboard
- ✅ **Always shows MOCK data** (no API calls)
- Perfect for comparing with real data side-by-side
- Account ID shows: "MOCK-ACCOUNT"
- Total cost shows: $91,500 (fake large number)
- 8 hardcoded regions, 8 hardcoded services
- 4 generic recommendations

**Console Message:** `🎭 MOCK DATA PAGE - Using only mock data for comparison`

**Use Case:** Open this in one browser window and the real AWS dashboard in another window to compare!

### AWS Live Data (API Testing)
```
http://localhost:3000/aws-live
```
**Description:** Raw AWS data display for testing API responses
**Features:**
- Shows JSON responses from AWS APIs
- Cost data, audit data, budget data
- Good for debugging and verification

### Azure Cloud Management (MOCK DATA)
```
http://localhost:3000/clouds/azure
```
**Description:** Azure cloud dashboard
**Data:** Uses mock data (real Azure integration not yet implemented)

### GCP Cloud Management (MOCK DATA)
```
http://localhost:3000/clouds/gcp
```
**Description:** Google Cloud Platform dashboard
**Data:** Uses mock data (real GCP integration not yet implemented)

---

## 4. 📈 Role-Based Dashboards

### CFO Dashboard (Financial)
```
http://localhost:3000/dashboard/cfo
```
**Description:** Chief Financial Officer view
**Focus:** Cost analysis, budget tracking, financial metrics
**Data:** Mock data with financial KPIs

### CTO Dashboard (Technical)
```
http://localhost:3000/dashboard/cto
```
**Description:** Chief Technology Officer view
**Focus:** Resource utilization, technical metrics, infrastructure health
**Data:** Mock data with technical KPIs

### DevOps Dashboard
```
http://localhost:3000/dashboard/devops
```
**Description:** DevOps team view
**Focus:** Operational metrics, deployments, resource management
**Data:** Mock data with DevOps KPIs

### OptScale Dashboard
```
http://localhost:3000/dashboard/optscale
```
**Description:** Cost optimization focused dashboard
**Focus:** Optimization recommendations, savings opportunities
**Data:** Mock data with optimization insights

---

## 5. 🎯 FinOps Phase 1
```
http://localhost:3000/finops/phase1
```
**Description:** FinOps Phase 1 implementation tracking
**Data:** Mock data showing FinOps maturity and progress

---

## 🎨 Visual Comparison: Real vs Mock Data

### AWS Dashboard - Real Data Features

**Access:** `http://localhost:3000/clouds/aws`

**Real Data Indicators:**
1. Open browser DevTools (F12) → Console tab
2. Look for these messages:
   ```
   ✅ Using REAL cost data: { totalCost: 86.56, ... }
   ✅ Using REAL regional cost data: { "us-east-1": 45.23, ... }
   ```
3. Account ID badge shows: **428055055471** (your real account)
4. Total cost shows: **$86.56** (real monthly cost)

**Mock Data Indicators:**
1. Console shows:
   ```
   ⚠️ Using MOCK data
   ```
2. Account ID shows: **"Loading..."**
3. Total cost shows: **$91,500** (fake large number)

### How to Force Mock Data Display

**Option 1: Disconnect AWS Credentials Temporarily**
```bash
# Rename AWS credentials file
mv ~/.aws/credentials ~/.aws/credentials.backup

# Reload page - will use mock data

# Restore when done
mv ~/.aws/credentials.backup ~/.aws/credentials
```

**Option 2: Check During Page Load**
- The page shows mock data for 1-2 seconds while fetching real data
- This is the "loading state" with mock data

**Option 3: Create Mock-Only Route** (I can create this for you)
- Create a duplicate page at `/clouds/aws-mock` that only shows mock data
- Good for comparison and demos

---

## 📊 Dashboard Features by Page

### `/clouds/aws` - AWS Dashboard (REAL DATA)

**Tab 1: Overview**
- Service distribution pie chart (real AWS services)
- Regional cost breakdown (33+ AWS regions)
- Top services by cost
- Regional map with real costs

**Tab 2: Resources**
- Grid view of all AWS services
- Real costs per service
- Utilization metrics
- Filter by service type

**Tab 3: Utilization**
- 24-hour CPU usage trends
- Memory utilization
- Network traffic
- Storage usage

**Tab 4: Costs**
- Cost trends over 7 weeks
- Forecast vs actual
- Optimized cost projection
- Historical data

**Tab 5: Recommendations**
- Real recommendations from AWS audit:
  - Stopped EC2 instances to terminate
  - Unattached EBS volumes to delete
  - Unassociated Elastic IPs to release
- Estimated savings per recommendation
- Priority and confidence levels

**Filters:**
- Region filter (all active AWS regions)
- Timezone filter (group by timezone)
- Service filter (EC2, S3, RDS, etc.)
- All filters work with real data

---

## 🎯 Recommended Viewing Order

### For Comparing Real vs Mock Data:

1. **Start with AWS Dashboard (Real Data)**
   ```
   http://localhost:3000/clouds/aws
   ```
   - Open DevTools Console (F12)
   - Look for "✅ Using REAL cost data"
   - Note the real costs, services, regions

2. **Temporarily Disable AWS (to see Mock)**
   ```bash
   mv ~/.aws/credentials ~/.aws/credentials.backup
   ```
   - Refresh the page
   - Console will show "⚠️ Using MOCK data"
   - Note the mock costs ($91,500 vs $86.56)

3. **Compare Azure (Pure Mock Data)**
   ```
   http://localhost:3000/clouds/azure
   ```
   - Uses only mock data
   - Similar UI but different cloud provider

4. **View Role-Based Dashboards (All Mock)**
   - CFO: `http://localhost:3000/dashboard/cfo`
   - CTO: `http://localhost:3000/dashboard/cto`
   - DevOps: `http://localhost:3000/dashboard/devops`
   - OptScale: `http://localhost:3000/dashboard/optscale`

5. **Re-enable AWS Credentials**
   ```bash
   mv ~/.aws/credentials.backup ~/.aws/credentials
   ```

---

## 🔍 Key Differences: Real vs Mock Data

| Feature | Real Data (AWS) | Mock Data |
|---------|----------------|-----------|
| Account ID | 428055055471 | Not shown / "Loading..." |
| Total Cost | $86.56 | $91,500 |
| Services | 5-6 actual services | 8 hardcoded services |
| Regions | Only regions with spend | All 8 regions always shown |
| Recommendations | Based on real audit | 4 generic recommendations |
| Updates | Click refresh for latest | Never changes |
| Console Logs | "✅ Using REAL cost data" | "⚠️ Using MOCK data" |

---

## 🛠️ Do You Want Me To Create?

I can create additional pages for easier comparison:

### Option 1: Mock-Only AWS Page
```
http://localhost:3000/clouds/aws-mock
```
Duplicate of AWS page but forced to use only mock data for side-by-side comparison.

### Option 2: Comparison View
```
http://localhost:3000/comparison
```
Side-by-side view showing real data vs mock data simultaneously.

### Option 3: Dashboard Gallery
```
http://localhost:3000/gallery
```
Overview page with screenshots/links to all dashboards.

**Let me know which option you'd like!**

---

## 📝 Quick Test Commands

```bash
# Start dev server (if not running)
npm run dev

# Open AWS dashboard with real data
open http://localhost:3000/clouds/aws

# Open browser console to see data source
# Press F12 or Right-click → Inspect → Console

# Look for these messages:
# ✅ Using REAL cost data: {...}
# ✅ Using REAL regional cost data: {...}
```

---

**Status:** ✅ All dashboards accessible
**Server:** Running on `http://localhost:3000`
**Real Data:** AWS dashboard only
**Mock Data:** All other dashboards
