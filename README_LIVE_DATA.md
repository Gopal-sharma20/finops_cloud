# AWS Live Data Integration

## Overview

The application now has **real-time AWS data integration** alongside the existing demo UI with mock data.

## Pages

### 1. **Mock Data Pages** (Demo UI)
These pages use hardcoded/mock data for demonstration:
- `/` - Homepage
- `/clouds/aws` - AWS Cloud Management (mock data)
- `/clouds/azure` - Azure Cloud Management (mock data)
- `/finops/phase1` - Phase 1 Dashboard (mock data)

### 2. **Live Data Page** (Real AWS)
- **`/aws-live`** - **Real-time AWS data from your account**

## Accessing Live AWS Data

### Step 1: Configure AWS Credentials

Make sure you have AWS CLI configured with credentials:

```bash
# Configure default profile
aws configure

# Or configure a named profile
aws configure --profile myprofile
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)

### Step 2: Set Environment Variables

Edit `.env.local`:

```env
AWS_DEFAULT_REGION=us-east-1
AWS_PROFILES=default
```

### Step 3: View Live Data

Navigate to: **http://localhost:3000/aws-live**

This page will:
- Fetch real cost data from AWS Cost Explorer (last 30 days)
- Show cost breakdown by service
- Display stopped EC2 instances
- Show unattached EBS volumes
- List unassociated Elastic IPs
- Display budget status (if configured)

## Features of `/aws-live`

### Real-Time Cost Data
- **Total Cost**: Shows actual AWS spending for the last 30 days
- **Cost by Service**: Breaks down costs by AWS service (EC2, S3, Lambda, etc.)
- **Account Info**: Displays your AWS account ID

### Audit Findings
- **Stopped EC2 Instances**: Find instances that are stopped (still costing money for EBS)
- **Unattached EBS Volumes**: Identify volumes not attached to any instance
- **Unassociated Elastic IPs**: Find EIPs not associated with any resource (charged hourly)
- **Budget Status**: View your AWS Budget status and utilization

### UI Features
- **Refresh Button**: Manually refresh data from AWS
- **Loading States**: Shows spinner while fetching data
- **Error Handling**: Displays errors if credentials are missing or API fails
- **Responsive Design**: Works on mobile, tablet, and desktop

## Cost Considerations

⚠️ **AWS Cost Explorer API charges $0.01 per request**

Each page load makes 2 Cost Explorer API calls = **$0.02**

The audit APIs (EC2, EBS, EIP, Budgets) are generally free tier or have negligible costs.

## Troubleshooting

### "Error loading data" message

**Check:**
1. AWS credentials are configured: `aws sts get-caller-identity --profile default`
2. IAM permissions are correct (see `docs/AWS_INTEGRATION.md`)
3. Cost Explorer is enabled in your AWS account
4. Environment variables are set in `.env.local`

### "No data" or empty results

**Possible reasons:**
- No AWS spending in the last 30 days
- No stopped EC2 instances
- No unattached volumes
- No unassociated Elastic IPs
- No budgets configured

This is normal if you have a clean/optimized AWS account!

### API rate limiting

If you refresh too frequently, AWS may rate-limit your requests. Wait a few seconds between refreshes.

## Next Steps

### Integrate Live Data into Main Pages

To show real data on the main `/clouds/aws` page:

1. Replace mock data with API hooks:
```typescript
// Instead of:
const totalCost = 28450 // mock

// Use:
const { data } = useProfileCost("default", 30)
const totalCost = data?.totalCost || 0
```

2. Transform API responses to match component structure
3. Add loading and error states
4. Handle edge cases (no data, API failures)

### Add More Features

- Multi-profile support (switch between AWS accounts)
- Multi-region selection
- Date range picker (custom time periods)
- Cost forecasting
- Savings recommendations
- Export to CSV/PDF
- Email alerts

## API Documentation

Full API documentation: `docs/AWS_INTEGRATION.md`

### Quick API Examples

**Fetch cost data:**
```typescript
import { useProfileCost } from "@/hooks/useAWSCost"

const { data, isLoading, error } = useProfileCost("default", 30)
```

**Fetch audit data:**
```typescript
import { useProfileAudit } from "@/hooks/useAWSAudit"

const { data, isLoading, error } = useProfileAudit("default", ["us-east-1"])
```

**Direct API calls:**
```bash
# GET cost data
curl http://localhost:3000/api/aws/cost?profile=default&timeRangeDays=30

# GET audit data
curl http://localhost:3000/api/aws/audit?profile=default&regions=us-east-1

# POST for advanced queries
curl -X POST http://localhost:3000/api/aws/cost \
  -H "Content-Type: application/json" \
  -d '{"profiles":["default"],"timeRangeDays":30,"groupBy":"SERVICE"}'
```

## Architecture

```
Frontend (Next.js)
    ↓
React Hooks (useAWSCost, useAWSAudit)
    ↓
API Routes (/api/aws/cost, /api/aws/audit)
    ↓
AWS SDK (lib/aws/)
    ↓
AWS Services (Cost Explorer, EC2, Budgets)
```

## Demo vs Live

| Feature | Mock Pages | Live Page (`/aws-live`) |
|---------|-----------|------------------------|
| Data Source | Hardcoded | Real AWS API |
| Cost | Free | $0.02 per page load |
| Setup Required | None | AWS credentials |
| Real-time | No | Yes |
| Customizable | Easy | Via API params |

## Support

For issues or questions:
1. Check `docs/AWS_INTEGRATION.md` for detailed setup
2. Review AWS IAM permissions
3. Check browser console for errors
4. Verify AWS CLI works: `aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY --metrics UnblendedCost`

---

**Built with ❤️ using Next.js, AWS SDK, and React Query**
