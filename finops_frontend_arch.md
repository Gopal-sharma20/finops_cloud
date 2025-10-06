# Multi-Cloud FinOps Platform - Frontend Architecture

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Application Structure](#application-structure)
3. [Page Layouts & Components](#page-layouts--components)
4. [Design System](#design-system)
5. [State Management](#state-management)
6. [Data Visualization](#data-visualization)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility](#accessibility)

---

## 1. TECHNOLOGY STACK

### Core Framework
```yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript 5.0+
Package Manager: pnpm
Node Version: 20.x LTS
```

### UI & Styling
```yaml
Component Library: shadcn/ui (Radix UI primitives)
Styling: Tailwind CSS 3.4+
Icons: Lucide React
Animations: Framer Motion
CSS-in-JS: None (Tailwind only for consistency)
```

### State & Data Management
```yaml
Server State: TanStack Query (React Query) v5
Client State: Zustand
Forms: React Hook Form + Zod validation
Data Tables: TanStack Table v8
Real-time: Socket.IO Client / SSE
```

### Visualization & Charts
```yaml
Primary: Recharts (for standard charts)
Advanced: Apache ECharts (complex dashboards)
Custom: D3.js (when needed)
Maps: Deck.gl (for geo-cost visualization)
```

### Development Tools
```yaml
Linting: ESLint + Prettier
Testing: Vitest + React Testing Library
E2E Testing: Playwright
Type Checking: TypeScript strict mode
Code Quality: Husky + lint-staged
```

### Build & Deployment
```yaml
Build Tool: Next.js built-in (Turbopack)
Hosting: Vercel / AWS Amplify / Cloudflare Pages
CDN: Cloudflare
Analytics: PostHog / Mixpanel
Error Tracking: Sentry
```

---

## 2. APPLICATION STRUCTURE

### Project Structure
```
cloudoptima-frontend/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Main app layout group
│   │   ├── dashboard/            # Home dashboard
│   │   ├── costs/                # Cost analysis
│   │   │   ├── overview/
│   │   │   ├── by-service/
│   │   │   ├── by-region/
│   │   │   └── anomalies/
│   │   ├── resources/            # Resource inventory
│   │   │   ├── compute/
│   │   │   ├── storage/
│   │   │   ├── network/
│   │   │   └── databases/
│   │   ├── recommendations/      # Optimization recommendations
│   │   │   ├── active/
│   │   │   ├── scheduled/
│   │   │   └── history/
│   │   ├── budgets/              # Budget management
│   │   ├── reports/              # Custom reports
│   │   ├── automation/           # Policy & automation
│   │   ├── settings/             # Settings
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── webhooks/
│   │   └── stream/               # SSE endpoints
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── charts/                   # Reusable chart components
│   │   ├── cost-trend-chart.tsx
│   │   ├── spend-breakdown-donut.tsx
│   │   ├── forecast-chart.tsx
│   │   └── heatmap.tsx
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── stat-card.tsx
│   │   ├── quick-actions.tsx
│   │   ├── recent-activity.tsx
│   │   └── alert-banner.tsx
│   ├── resources/                # Resource components
│   │   ├── resource-table.tsx
│   │   ├── resource-card.tsx
│   │   └── resource-details.tsx
│   ├── recommendations/          # Recommendation components
│   │   ├── recommendation-card.tsx
│   │   ├── savings-calculator.tsx
│   │   └── approval-workflow.tsx
│   ├── layouts/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── breadcrumbs.tsx
│   ├── common/
│   │   ├── loading-spinner.tsx
│   │   ├── error-boundary.tsx
│   │   ├── empty-state.tsx
│   │   └── skeleton-loader.tsx
│   └── providers/
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       └── auth-provider.tsx
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-cost-data.ts
│   │   ├── use-recommendations.ts
│   │   ├── use-resources.ts
│   │   └── use-real-time.ts
│   ├── utils/                    # Utility functions
│   │   ├── format-currency.ts
│   │   ├── date-utils.ts
│   │   ├── chart-utils.ts
│   │   └── export-utils.ts
│   ├── stores/                   # Zustand stores
│   │   ├── user-store.ts
│   │   ├── filter-store.ts
│   │   └── notification-store.ts
│   ├── schemas/                  # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── budget.schema.ts
│   │   └── policy.schema.ts
│   └── constants/
│       ├── routes.ts
│       ├── cloud-providers.ts
│       └── colors.ts
├── types/
│   ├── api.types.ts
│   ├── dashboard.types.ts
│   ├── resource.types.ts
│   └── recommendation.types.ts
├── styles/
│   └── globals.css
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── config/
│   ├── site.config.ts
│   └── chart.config.ts
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. PAGE LAYOUTS & COMPONENTS

### 3.1 Dashboard Homepage

**URL**: `/dashboard`

**Layout Structure**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Header (Cloud Account Selector, User Menu, Notifications) │
├──────┬──────────────────────────────────────────────────────┤
│      │  Key Metrics Row (4 Stat Cards)                      │
│      │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐            │
│      │  │ Total │ │ Waste │ │Savings│ │ Optim │            │
│      │  │ Spend │ │Detected│ │Potential│ Score│            │
│      │  └───────┘ └───────┘ └───────┘ └───────┘            │
│ Side │                                                       │
│ bar  │  Cost Trend Chart (30-day with forecast)            │
│      │  ┌─────────────────────────────────────────────────┐│
│ Nav  │  │ [Line Chart with Forecast Shading]              ││
│      │  └─────────────────────────────────────────────────┘│
│      │                                                       │
│      │  Two-Column Layout                                   │
│      │  ┌──────────────────┬──────────────────────────────┐│
│      │  │ Top 5 Cost       │ Recent Recommendations       ││
│      │  │ Contributors     │ [Quick Actions]              ││
│      │  │ [Horizontal Bar] │                              ││
│      │  ├──────────────────┼──────────────────────────────┤│
│      │  │ Anomaly Alerts   │ Savings This Month           ││
│      │  │ [Alert Cards]    │ [Donut Chart]                ││
│      │  └──────────────────┴──────────────────────────────┘│
└──────┴──────────────────────────────────────────────────────┘
```

**Key Components**:

1. **Stat Card Component**
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
    isGood: boolean;
  };
  icon: React.ReactNode;
  loading?: boolean;
}

Features:
- Skeleton loading state
- Animated number counting
- Color-coded trends (green/red)
- Click to drill down
- Sparkline mini chart option
```

2. **Cost Trend Chart**
```tsx
Features:
- 30-day historical data
- 7-day forecast (shaded area)
- Interactive tooltips
- Zoom & pan
- Annotations for anomalies
- Export to PNG/CSV
- Date range selector
- Compare periods overlay
```

3. **Recommendation Card**
```tsx
interface RecommendationCardProps {
  id: string;
  title: string;
  description: string;
  savings: number;
  risk: 'low' | 'medium' | 'high';
  category: string;
  affectedResources: number;
  actions: Array<{
    label: string;
    handler: () => void;
  }>;
}

Features:
- Risk badge with color coding
- Estimated savings display
- One-click approve/dismiss
- Schedule for later
- View details modal
- Share with team
```

---

### 3.2 Cost Analysis Pages

#### 3.2.1 Cost Overview (`/costs/overview`)

**Features**:
- Multi-dimensional cost breakdown
- Time series analysis
- Cost allocation by tags
- Filter by cloud, service, region, tags
- Export capabilities

**Component Structure**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Filters Bar                                                 │
│  [Date Range] [Cloud Provider] [Service] [Region] [Tags]    │
├─────────────────────────────────────────────────────────────┤
│  Summary Cards                                               │
│  Total Spend | Average Daily | Trend % | Forecast          │
├─────────────────────────────────────────────────────────────┤
│  Main Cost Chart (Stacked Area)                             │
│  - Group by: Service/Region/Tag                             │
│  - Toggle between absolute and relative views               │
├──────────────────────┬──────────────────────────────────────┤
│  Service Breakdown   │  Regional Distribution               │
│  [Tree Map]          │  [Geo Heat Map]                      │
└──────────────────────┴──────────────────────────────────────┘
```

**Interactive Features**:
- Click chart segments to filter
- Drag to zoom on timeline
- Toggle data series on/off
- Save custom views
- Schedule automated reports

---

#### 3.2.2 Cost Anomalies (`/costs/anomalies`)

**Features**:
- Real-time anomaly detection
- ML-powered alerts
- Root cause analysis
- Historical anomaly patterns

**Layout**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Active Anomalies Banner                                     │
│  🚨 3 Active Anomalies | Total Impact: $2,847              │
├─────────────────────────────────────────────────────────────┤
│  Anomaly Timeline (Scatter Plot)                            │
│  - X-axis: Time                                             │
│  - Y-axis: Cost deviation %                                 │
│  - Size: Impact amount                                       │
│  - Color: Severity                                           │
├─────────────────────────────────────────────────────────────┤
│  Anomaly Cards (List View)                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🔴 HIGH | AWS Lambda | us-east-1                     │  │
│  │ Cost spike: +847% ($12 → $847)                       │  │
│  │ Detected: 2 hours ago                                 │  │
│  │ Root cause: Retry loop on S3 access errors           │  │
│  │ [View Details] [Create Alert] [Dismiss]              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Anomaly Details Modal**:
```tsx
- Impact timeline chart
- Service metrics correlation
- Related resources list
- Recommended actions
- Similar historical anomalies
- Create Jira/ServiceNow ticket
- Share via Slack/Teams
```

---

### 3.3 Resource Inventory

#### 3.3.1 Compute Resources (`/resources/compute`)

**Features**:
- Advanced filtering and search
- Bulk actions
- Right-sizing recommendations inline
- Tag management
- Export to CSV/Excel

**Table Structure**:
```tsx
Columns:
├── Checkbox (bulk select)
├── Resource Name (with cloud icon)
├── Status (running/stopped with indicator)
├── Type/Size
├── Region
├── Cost/Month
├── CPU Utilization (sparkline)
├── Optimization Score (0-100)
├── Tags
├── Actions Menu
└── Expand for details

Features:
- Column sorting
- Column reordering (drag & drop)
- Column visibility toggle
- Saved column presets
- Infinite scroll pagination
- Density toggle (compact/comfortable)
```

**Inline Actions**:
```tsx
Per Row Actions:
- View details
- Right-size
- Start/Stop
- Create snapshot
- Add to policy
- Add tags
- Delete (with confirmation)

Bulk Actions:
- Apply tags
- Start/Stop selected
- Apply optimization policy
- Export selection
- Delete selected
```

---

### 3.4 Recommendations Hub

**URL**: `/recommendations`

**Three-Tab Layout**:

#### Tab 1: Active Recommendations
```tsx
Filters:
- Savings potential: Low/Medium/High
- Risk level: Low/Medium/High
- Category: Compute/Storage/Network/etc.
- Cloud provider
- Affected teams

Sort by:
- Savings amount
- Risk level
- Age
- Impact scope

Card View Options:
- Detailed cards (default)
- Compact list
- Table view
```

**Recommendation Card Design**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  🔵 LOW RISK | STORAGE                          💰 $347/month│
│  Delete 5 Unused EBS Volumes                                 │
│                                                               │
│  These volumes have been unattached for 90+ days             │
│  Last attached: 127 days ago                                 │
│                                                               │
│  Affected Resources: 5 volumes (238 GB total)                │
│  ├─ vol-abc123 (50 GB, us-east-1) - 143 days unattached    │
│  ├─ vol-def456 (48 GB, us-west-2) - 127 days unattached    │
│  └─ [+3 more...]                                             │
│                                                               │
│  Impact Analysis:                                             │
│  ✓ Zero risk - no resources depend on these                 │
│  ✓ Automatic snapshots created before deletion              │
│  ✓ 30-day recovery window                                    │
│                                                               │
│  [🗑️ Delete Now] [📅 Schedule] [ℹ️ Details] [✕ Dismiss]    │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 2: Scheduled Recommendations
- Show pending actions
- Countdown timers
- Cancel/Reschedule options
- Approval workflow status

#### Tab 3: History
- Completed recommendations
- Actual savings vs estimated
- Failed actions with reasons
- Rollback options (if applicable)

---

### 3.5 Budget Management

**URL**: `/budgets`

**Layout**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Budget Summary Cards                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Total  │ │ On Track │ │ At Risk  │ │ Exceeded │      │
│  │  $500K   │ │    12    │ │    3     │ │    1     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Budget List (Cards)                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Production Environment - Q4 2025                     │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 87% ($261K of $300K)  │  │
│  │  Forecast: $287K (96%) ✅ On Track                   │  │
│  │                                                        │  │
│  │  [View Details] [Edit] [Create Alert]                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Development - Q4 2025                                │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━ 94% ($70.5K of $75K)     │  │
│  │  Forecast: $82K (109%) ⚠️ At Risk                    │  │
│  │                                                        │  │
│  │  [View Details] [Request Increase] [Optimize]        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Budget Detail Page**:
```tsx
Components:
1. Budget Progress Chart (Burn-down)
   - Actual spend vs planned
   - Forecast line
   - Alert thresholds marked

2. Spend by Category (Donut/Tree Map)
   - Drill down by service
   - Click to filter

3. Daily Spend Trend
   - Heatmap view
   - Identify spending patterns

4. Alert Configuration
   - Threshold-based alerts
   - Recipient management
   - Notification channels

5. Recommendations to Stay on Budget
   - Auto-generated cost-cutting suggestions
   - One-click apply
```

---

### 3.6 Automation & Policies

**URL**: `/automation`

**Features**:
- Visual workflow builder (no-code)
- Policy templates library
- Schedule management
- Execution logs

**Policy Builder UI**:
```tsx
┌─────────────────────────────────────────────────────────────┐
│  Create New Policy                                           │
├─────────────────────────────────────────────────────────────┤
│  Policy Name: [Stop Dev Instances on Weekends]              │
│  Description: [Automatically stop dev instances...]          │
│                                                               │
│  TRIGGER                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🕐 Schedule: Every Friday at 6:00 PM                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  CONDITIONS (All must match)                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  + Tag: Environment = "Development"                    │  │
│  │  + Instance State = "Running"                          │  │
│  │  + [Add Condition]                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ACTIONS                                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Send Slack notification to #dev-team              │  │
│  │  2. Wait 30 minutes                                    │  │
│  │  3. Stop instances                                     │  │
│  │  4. Send confirmation email                            │  │
│  │  [Add Action]                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  SAFETY CONTROLS                                              │
│  ☑ Dry run first                                            │
│  ☑ Require approval for high-risk actions                   │
│  ☑ Enable rollback (24 hours)                               │
│                                                               │
│  [💾 Save Policy] [🧪 Test Run] [✕ Cancel]                 │
└─────────────────────────────────────────────────────────────┘
```

**Pre-built Policy Templates**:
```yaml
1. Weekend Instance Shutdown
2. Snapshot Lifecycle Management
3. Unused Resource Cleanup
4. Right-Sizing Automation
5. Tag Enforcement
6. Budget Alert Actions
7. Idle Resource Detection
8. DR Environment Scheduling
9. Security Group Cleanup
10. EIP Release Automation
```

---

## 4. DESIGN SYSTEM

### 4.1 Color Palette

**Primary Colors**:
```css
/* Brand */
--primary: 217 91% 60%;          /* #3B82F6 - Blue */
--primary-foreground: 0 0% 100%; /* White */

/* Semantic Colors */
--success: 142 71% 45%;          /* #16A34A - Green */
--warning: 38 92% 50%;           /* #F59E0B - Amber */
--danger: 0 84% 60%;             /* #EF4444 - Red */
--info: 199 89% 48%;             /* #0EA5E9 - Sky Blue */

/* Cloud Provider Colors */
--aws: 232 76% 36%;              /* #FF9900 - AWS Orange */
--azure: 207 90% 54%;            /* #0078D4 - Azure Blue */
--gcp: 9 100% 58%;               /* #DB4437 - GCP Red */
```

**Neutral Scale**:
```css
/* Light Mode */
--background: 0 0% 100%;         /* White */
--foreground: 222 47% 11%;       /* Near Black */
--card: 0 0% 100%;
--card-foreground: 222 47% 11%;
--muted: 210 40% 96%;            /* Light Gray */
--muted-foreground: 215 16% 47%;

/* Dark Mode */
--background: 222 47% 11%;       /* Dark Blue-Gray */
--foreground: 210 40% 98%;       /* Off White */
--card: 222 47% 15%;
--card-foreground: 210 40% 98%;
--muted: 217 33% 17%;
--muted-foreground: 215 20% 65%;
```

### 4.2 Typography

```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 4.3 Component Patterns

**Card Component**:
```tsx
Variants:
- default: Standard white/dark card
- outlined: Border only, no fill
- elevated: With shadow
- interactive: Hover effects, clickable

Padding Options:
- sm: 12px
- md: 16px (default)
- lg: 24px
- xl: 32px

Features:
- Optional header with title and actions
- Optional footer for actions
- Loading state with skeleton
- Error state with retry button
```

**Button Component**:
```tsx
Variants:
- primary: Filled with brand color
- secondary: Outlined
- ghost: No background, hover effect
- destructive: Red for dangerous actions
- link: Text only, no border

Sizes:
- sm: 32px height
- md: 40px height (default)
- lg: 48px height
- icon: Square, icon-only

States:
- loading: Shows spinner
- disabled: Grayed out, no interaction
- active: Selected state for toggles
```

**Badge Component**:
```tsx
Variants:
- default: Gray
- success: Green
- warning: Amber
- danger: Red
- info: Blue

Use Cases:
- Status indicators
- Tag display
- Count badges
- Risk levels
- Cloud provider badges
```

---

## 5. STATE MANAGEMENT

### 5.1 Server State (React Query)

**Query Keys Structure**:
```typescript
export const queryKeys = {
  costs: {
    all: ['costs'] as const,
    overview: (filters: CostFilters) => 
      ['costs', 'overview', filters] as const,
    byService: (filters: CostFilters) => 
      ['costs', 'by-service', filters] as const,
    anomalies: () => ['costs', 'anomalies'] as const,
    forecast: (days: number) => 
      ['costs', 'forecast', days] as const,
  },
  resources: {
    all: ['resources'] as const,
    compute: (filters: ResourceFilters) => 
      ['resources', 'compute', filters] as const,
    storage: (filters: ResourceFilters) => 
      ['resources', 'storage', filters] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    active: () => ['recommendations', 'active'] as const,
    history: () => ['recommendations', 'history'] as const,
  },
};
```

**Custom Hooks Pattern**:
```typescript
// useCostOverview.ts
export function useCostOverview(filters: CostFilters) {
  return useQuery({
    queryKey: queryKeys.costs.overview(filters),
    queryFn: () => api.costs.getOverview(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 min
    select: (data) => transformCostData(data), // Transform data
  });
}

// Usage in component
const { data, isLoading, error } = useCostOverview(filters);
```

**Mutations Pattern**:
```typescript
// useApplyRecommendation.ts
export function useApplyRecommendation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recommendationId: string) => 
      api.recommendations.apply(recommendationId),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.recommendations.all
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.resources.all
      });
      toast.success('Recommendation applied successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to apply: ${error.message}`);
    },
  });
}
```

### 5.2 Client State (Zustand)

**Filter Store**:
```typescript
// stores/filter-store.ts
interface FilterStore {
  dateRange: DateRange;
  cloudProviders: string[];
  regions: string[];
  tags: Record<string, string>;
  
  setDateRange: (range: DateRange) => void;
  toggleCloudProvider: (provider: string) => void;
  addTagFilter: (key: string, value: string) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  dateRange: { start: ..., end: ... },
  cloudProviders: ['aws', 'azure', 'gcp'],
  regions: [],
  tags: {},
  
  setDateRange: (range) => set({ dateRange: range }),
  toggleCloudProvider: (provider) => set((state) => ({
    cloudProviders: state.cloudProviders.includes(provider)
      ? state.cloudProviders.filter(p => p !== provider)
      : [...state.cloudProviders, provider]
  })),
  // ... other actions
}));
```

**Notification Store**:
```typescript
// stores/notification-store.ts
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  addNotification: (notif: Omit<Notification, 'id'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}
```

---

## 6. DATA VISUALIZATION

### 6.1 Chart Library Selection Guide

**Use Recharts for**:
- Line charts
- Bar charts
- Area charts
- Pie/Donut charts
- Simple composed charts
- Fast rendering needs

**Use Apache ECharts for**:
- Complex dashboards
- Heatmaps
- Sankey diagrams
- Gauge charts
- 3D visualizations
- Large datasets (>10K points)

**Use D3.js for**:
- Custom, unique visualizations
- Network graphs
- Force-directed layouts
- Geo maps with custom projections
- Maximum customization needs

### 6.2 Chart Components

**Cost Trend Chart**:
```typescript
<CostTrendChart
  data={costData}
  metric="total_cost"
  showForecast={true}
  annotations={anomalies}
  onPointClick={handlePointClick}
  exportable={true}
  compareMode={false}
/>

Features:
- Responsive and adaptive
- Touch-friendly on mobile
- Keyboard navigation
- Screen reader support
- Export to PNG/SVG/CSV
- Print-friendly
```

**Spend Breakdown Donut**:
```typescript
<SpendBreakdownDonut
  data={serviceData}
  centerMetric="total"
  interactive={true}
  maxSlices={8} // Others grouped
  onSliceClick={handleSliceClick}
  legendPosition="right"
/>

Features:
- Animated transitions
- Hover tooltips
- Click to filter/drill-down
- Percentage and absolute values
- Color-blind friendly palette
```

**Resource Heatmap**:
```typescript
<ResourceHeatmap
  data={utilizationData}
  xAxis="time"
  yAxis="resource"
  metric="cpu_utilization"
  colorScale="sequential"
  threshold={80}
  onCellClick={handleCellClick}
/>

Features:
- Color intensity for values
- Threshold highlighting
- Zoom and pan
- Export capability
```

---

## 7. PERFORMANCE OPTIMIZATION

### 7.1 Code Splitting

```typescript
// Dynamic imports for heavy pages
const ReportsPage = dynamic(() => import('@/app/(dashboard)/reports/page'), {
  loading: () => <PageSkeleton />,
  ssr: false, // Client-side only if not needed for SEO
});

// Component-level splitting
const HeavyChart = dynamic(() => import('@/components/charts/heavy-chart'), {
  loading: () => <ChartSkeleton />,
});
```

### 7.2 Image Optimization

```typescript
import Image from 'next/image';

<Image
  src="/cloud-providers/aws.png"
  alt="AWS"
  width={32}
  height={32}
  quality={85}
  priority={false} // Only for above-fold images
  placeholder="blur" // LQIP for better UX
/>
```

### 7.3 Data Loading Strategies

**Pagination**:
```typescript
// Infinite scroll for resource tables
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
  useInfiniteQuery({
    queryKey: ['resources', filters],
    queryFn: ({ pageParam = 0 }) => 
      api.resources.list({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
```

**Virtualization**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// For large lists (1000+ items)
const virtualizer = useVirtualizer({
  count: resources.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60, // Row height
  overscan: 5,
});
```

**Debouncing & Throttling**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleSearch = useDebouncedCallback(
  (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
  },
  300 // 300ms delay
);
```

### 7.4 Bundle Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      '@/components/ui',
      'lucide-react',
      'recharts',
    ],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        charts: {
          test: /[\\/]node_modules[\\/](recharts|d3|echarts)[\\/]/,
          name: 'charts',
          priority: 20,
        },
      },
    };
    return config;
  },
};
```

---

## 8. ACCESSIBILITY (A11Y)

### 8.1 WCAG 2.1 AA Compliance

**Requirements**:
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation for all interactive elements
- Screen reader support with proper ARIA labels
- Focus indicators visible and clear
- No flashing content (seizure risk)
- Responsive text sizing (up to 200% zoom)

### 8.2 Implementation Checklist

**Semantic HTML**:
```tsx
✅ Use proper heading hierarchy (h1 → h2 → h3)
✅ Use <nav> for navigation
✅ Use <main> for primary content
✅ Use <aside> for sidebars
✅ Use <button> not <div> for clickable actions
✅ Use <a> with href for navigation
```

**ARIA Labels**:
```tsx
// Icon-only buttons
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// Chart descriptions
<div role="img" aria-label="Cost trend chart showing 30% increase">
  <CostTrendChart data={data} />
</div>

// Loading states
<div role="status" aria-live="polite">
  Loading cost data...
</div>
```

**Keyboard Navigation**:
```typescript
// Custom keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openCommandPalette();
    }
    if (e.key === '/' && !isInputFocused) {
      e.preventDefault();
      focusSearch();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Focus Management**:
```tsx
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';

// Modal dialog focus trap
function Dialog({ open, onClose, children }) {
  const dialogRef = useFocusTrap(open);
  
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

### 8.3 Screen Reader Testing

**Tools**:
- NVDA (Windows) - Free
- JAWS (Windows) - Commercial
- VoiceOver (macOS) - Built-in
- TalkBack (Android) - Built-in

**Test Scenarios**:
1. Navigate entire dashboard with Tab key
2. Announce all chart data points
3. Read table contents row by row
4. Navigate forms with proper field labels
5. Announce dynamic content changes (alerts, notifications)

---

## 9. RESPONSIVE DESIGN

### 9.1 Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Tablet */
--breakpoint-md: 768px;   /* Tablet landscape */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large */
```

### 9.2 Mobile Optimizations

**Dashboard Mobile View**:
```tsx
Mobile (< 768px):
- Stack all cards vertically
- Collapsible sidebar (drawer)
- Bottom navigation bar
- Simplified charts (less data points)
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for navigation

Tablet (768px - 1024px):
- Two-column layout
- Side drawer navigation
- Full-featured charts
- Hover states disabled

Desktop (> 1024px):
- Multi-column layouts
- Persistent sidebar
- Rich interactions
- Hover previews
```

**Mobile-Specific Components**:
```tsx
// Mobile action sheet instead of dropdown
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

function MobileActions() {
  return (
    <Sheet>
      <SheetTrigger>
        <MoreVertical />
      </SheetTrigger>
      <SheetContent side="bottom">
        <ActionList />
      </SheetContent>
    </Sheet>
  );
}
```

### 9.3 Touch Interactions

```typescript
// Swipe gestures for mobile tables
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => nextPage(),
  onSwipedRight: () => prevPage(),
  trackMouse: false, // Only track touch
  preventDefaultTouchmoveEvent: true,
});

<div {...handlers}>
  <ResourceTable />
</div>
```

---

## 10. REAL-TIME FEATURES

### 10.1 WebSocket Connection

```typescript
// lib/websocket-client.ts
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(userId: string) {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?user=${userId}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      this.handleReconnect();
    };
  }
  
  private handleMessage(message: WSMessage) {
    switch (message.type) {
      case 'cost_update':
        queryClient.invalidateQueries({ queryKey: ['costs'] });
        break;
      case 'anomaly_detected':
        toast.warning(message.data.title);
        break;
      case 'recommendation_ready':
        toast.info('New recommendation available');
        break;
    }
  }
  
  subscribe(channel: string) {
    this.ws?.send(JSON.stringify({ 
      action: 'subscribe', 
      channel 
    }));
  }
}
```

### 10.2 Real-Time UI Updates

```tsx
// components/real-time-cost-badge.tsx
export function RealTimeCostBadge() {
  const [currentCost, setCurrentCost] = useState(0);
  
  useEffect(() => {
    const ws = new WebSocketClient();
    ws.connect(userId);
    ws.subscribe('cost_updates');
    
    ws.on('cost_update', (data) => {
      setCurrentCost(data.current_cost);
    });
    
    return () => ws.disconnect();
  }, [userId]);
  
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
      <span>Live: ${formatCurrency(currentCost)}</span>
    </div>
  );
}
```

### 10.3 Optimistic Updates

```typescript
// Optimistic UI for recommendation approval
const applyRecommendation = useMutation({
  mutationFn: api.recommendations.apply,
  onMutate: async (recommendationId) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ 
      queryKey: ['recommendations'] 
    });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['recommendations']);
    
    // Optimistically update UI
    queryClient.setQueryData(['recommendations'], (old) => ({
      ...old,
      items: old.items.map(item => 
        item.id === recommendationId 
          ? { ...item, status: 'applying' }
          : item
      )
    }));
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['recommendations'], 
      context?.previous
    );
    toast.error('Failed to apply recommendation');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ 
      queryKey: ['recommendations'] 
    });
  },
});
```

---

## 11. ERROR HANDLING

### 11.1 Error Boundary

```tsx
// components/error-boundary.tsx
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    Sentry.captureException(error, { 
      contexts: { react: errorInfo } 
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">
            Something went wrong
          </h2>
          <p className="mt-2 text-muted-foreground">
            {this.state.error?.message}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Reload Page
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 11.2 API Error Handling

```typescript
// lib/api/client.ts
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
          ...options?.headers,
        },
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status, error);
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error or other unexpected error
    throw new ApiError('Network error. Please try again.', 0);
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 11.3 User-Friendly Error Messages

```tsx
// components/error-display.tsx
export function ErrorDisplay({ error }: { error: Error }) {
  const getMessage = () => {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return "You don't have permission to access this resource.";
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please slow down.';
        case 500:
          return 'Server error. Our team has been notified.';
        default:
          return error.message;
      }
    }
    return 'An unexpected error occurred.';
  };
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{getMessage()}</AlertDescription>
    </Alert>
  );
}
```

---

## 12. INTERNATIONALIZATION (i18n)

### 12.1 Setup

```typescript
// i18n.config.ts
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de', 'ja', 'pt'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
```

### 12.2 Translation Files

```typescript
// locales/en.json
{
  "dashboard": {
    "title": "Dashboard",
    "totalSpend": "Total Spend",
    "wasteDetected": "Waste Detected",
    "savingsPotential": "Savings Potential",
    "optimizationScore": "Optimization Score"
  },
  "recommendations": {
    "title": "Recommendations",
    "apply": "Apply",
    "dismiss": "Dismiss",
    "schedule": "Schedule",
    "lowRisk": "Low Risk",
    "mediumRisk": "Medium Risk",
    "highRisk": "High Risk"
  }
}

// locales/es.json
{
  "dashboard": {
    "title": "Panel de Control",
    "totalSpend": "Gasto Total",
    // ... Spanish translations
  }
}
```

### 12.3 Usage in Components

```tsx
import { useTranslations } from 'next-intl';

export function Dashboard() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <StatCard label={t('totalSpend')} value={totalSpend} />
    </div>
  );
}
```

### 12.4 Currency & Date Formatting

```typescript
// lib/format.ts
export function formatCurrency(
  amount: number,
  locale: string,
  currency: string = 'USD'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(date);
}
```

---

## 13. TESTING STRATEGY

### 13.1 Unit Tests (Vitest)

```typescript
// __tests__/components/stat-card.test.tsx
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/dashboard/stat-card';

describe('StatCard', () => {
  it('renders value correctly', () => {
    render(
      <StatCard 
        title="Total Spend" 
        value="$12,345" 
      />
    );
    
    expect(screen.getByText('Total Spend')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
  });
  
  it('shows trend indicator when provided', () => {
    render(
      <StatCard 
        title="Total Spend" 
        value="$12,345"
        change={{ value: 15, trend: 'up', isGood: false }}
      />
    );
    
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });
});
```

### 13.2 Integration Tests

```typescript
// __tests__/pages/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/app/(dashboard)/dashboard/page';

describe('Dashboard Page', () => {
  it('loads and displays cost data', async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <Dashboard />
      </QueryClientProvider>
    );
    
    // Show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('$12,345')).toBeInTheDocument();
    });
  });
});
```

### 13.3 E2E Tests (Playwright)

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('user can view and apply recommendation', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Navigate to recommendations
  await page.click('text=Recommendations');
  await expect(page).toHaveURL('/recommendations');
  
  // Apply first recommendation
  await page.click('button:has-text("Apply")').first();
  
  // Confirm action
  await page.click('button:has-text("Confirm")');
  
  // Verify success message
  await expect(page.locator('text=Applied successfully')).toBeVisible();
});
```

---

## 14. DEPLOYMENT & CI/CD

### 14.1 Environment Variables

```bash
# .env.example
NEXT_PUBLIC_API_URL=https://api.cloudoptima.com
NEXT_PUBLIC_WS_URL=wss://ws.cloudoptima.com
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# Server-only variables
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=xxx
```

### 14.2 Build Configuration

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    domains: ['avatars.githubusercontent.com', 'cloudoptima.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 14.3 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 15. ANALYTICS & MONITORING

### 15.1 Product Analytics (PostHog)

```typescript
// lib/analytics.ts
import posthog from 'posthog-js';

export const analytics = {
  init() {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: 'https://app.posthog.com',
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.debug();
          }
        },
      });
    }
  },
  
  identify(userId: string, traits?: Record<string, any>) {
    posthog.identify(userId, traits);
  },
  
  track(event: string, properties?: Record<string, any>) {
    posthog.capture(event, properties);
  },
  
  page(name: string, properties?: Record<string, any>) {
    posthog.capture('$pageview', { page: name, ...properties });
  },
};

// Usage in components
analytics.track('recommendation_applied', {
  recommendationId: rec.id,
  savings: rec.savings,
  risk: rec.risk,
});
```

### 15.2 Performance Monitoring

```typescript
// lib/performance.ts
export function measurePageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      
      analytics.track('page_performance', {
        domContentLoaded: perfData.domContentLoadedEventEnd,
        loadComplete: perfData.loadEventEnd,
        totalTime: perfData.loadEventEnd - perfData.fetchStart,
      });
    });
  }
}

// Measure component render time
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (renderTime > 1000) { // Log if > 1 second
          analytics.track('slow_component_render', {
            component: componentName,
            renderTime,
          });
        }
      };
    }, []);
    
    return <Component {...props} />;
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: Frontend Team  
**Next Review**: Quarterly