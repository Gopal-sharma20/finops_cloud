# AWS FinOps Integration Guide

This document explains how to integrate the Next.js FinOps application with AWS services to fetch real cost and audit data.

## Overview

The application integrates with AWS using the AWS SDK for JavaScript v3 to provide:
- **Cost Data**: Fetch cost and usage data from AWS Cost Explorer
- **Audit Data**: Identify unused resources (EC2, EBS, EIPs) and budget status

## Prerequisites

### 1. AWS CLI Configuration

You need to have AWS CLI installed and configured with at least one profile:

```bash
# Install AWS CLI (if not already installed)
# See: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure a profile
aws configure --profile default
```

You'll be prompted for:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Output format (e.g., `json`)

### 2. IAM Permissions

The AWS identity (IAM User or Role) needs the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowFinOpsAccess",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "budgets:DescribeBudgets",
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeAddresses",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. Environment Configuration

Configure your `.env.local` file:

```env
# AWS Configuration
AWS_DEFAULT_REGION=us-east-1
AWS_PROFILES=default,production,staging

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Endpoints

### Cost Data API

**Endpoint**: `/api/aws/cost`

#### POST Request

Fetch cost data for multiple profiles with advanced filtering:

```typescript
// Request body
{
  profiles: ["default", "production"],     // Optional: specific profiles
  allProfiles: false,                      // Optional: use all configured profiles
  timeRangeDays: 30,                       // Optional: last N days
  startDateIso: "2024-01-01",             // Optional: start date (YYYY-MM-DD)
  endDateIso: "2024-01-31",               // Optional: end date (YYYY-MM-DD)
  tags: ["Team=DevOps", "Env=Prod"],      // Optional: filter by tags
  dimensions: ["REGION=us-east-1"],        // Optional: filter by dimensions
  groupBy: "SERVICE"                       // Optional: grouping dimension
}

// Response
{
  accounts_cost_data: {
    "Profile Name: default": {
      "AWS Account #": "123456789012",
      "Period Start Date": "2024-01-01",
      "Period End Date": "2024-01-31",
      "Total Cost": 1234.56,
      "Cost By SERVICE": {
        "Amazon EC2": 500.00,
        "Amazon S3": 234.56,
        "AWS Lambda": 100.00
      },
      "Status": "success"
    }
  },
  errors_for_profiles: {}
}
```

#### GET Request

Simplified single-profile query:

```bash
GET /api/aws/cost?profile=default&timeRangeDays=30
```

### Audit Data API

**Endpoint**: `/api/aws/audit`

#### POST Request

Run FinOps audit for multiple profiles and regions:

```typescript
// Request body
{
  profiles: ["default"],                   // Optional: specific profiles
  allProfiles: false,                      // Optional: use all configured profiles
  regions: ["us-east-1", "us-west-2"]     // Required: regions to audit
}

// Response
{
  "Audit Report": {
    "Profile Name: default": {
      "AWS Account": "123456789012",
      "Stopped EC2 Instances": [
        {
          "instanceId": "i-1234567890abcdef0",
          "instanceType": "t3.medium",
          "state": "stopped",
          "region": "us-east-1"
        }
      ],
      "Unattached EBS Volumes": [
        {
          "volumeId": "vol-1234567890abcdef0",
          "size": 100,
          "volumeType": "gp3",
          "state": "available",
          "region": "us-east-1"
        }
      ],
      "Un-associated EIPs": [
        {
          "publicIp": "54.123.45.67",
          "allocationId": "eipalloc-1234567890abcdef0",
          "region": "us-east-1"
        }
      ],
      "Budget Status": [
        {
          "budgetName": "Monthly Budget",
          "budgetLimit": 1000.00,
          "actualSpend": 850.00,
          "forecastedSpend": 950.00,
          "percentUsed": 85.00,
          "status": "WARNING"
        }
      ]
    }
  },
  "Error processing profiles": {}
}
```

#### GET Request

Simplified single-profile audit:

```bash
GET /api/aws/audit?profile=default&regions=us-east-1,us-west-2
```

## React Hooks

### useAWSCost

Fetch cost data in your components:

```typescript
import { useAWSCost } from "@/hooks/useAWSCost";

function CostDashboard() {
  const { data, isLoading, error } = useAWSCost({
    profiles: ["default"],
    timeRangeDays: 30,
    groupBy: "SERVICE"
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {Object.entries(data.accounts_cost_data).map(([profile, data]) => (
        <div key={profile}>
          <h2>{profile}</h2>
          <p>Total Cost: ${data["Total Cost"]}</p>
        </div>
      ))}
    </div>
  );
}
```

### useProfileCost

Simplified hook for single profile:

```typescript
import { useProfileCost } from "@/hooks/useAWSCost";

function ProfileCost() {
  const { data, isLoading, error } = useProfileCost("default", 30);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Total Cost: ${data.totalCost}</div>;
}
```

### useAWSAudit

Fetch audit data:

```typescript
import { useAWSAudit } from "@/hooks/useAWSAudit";

function AuditReport() {
  const { data, isLoading, error } = useAWSAudit({
    profiles: ["default"],
    regions: ["us-east-1"]
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {Object.entries(data["Audit Report"]).map(([profile, report]) => (
        <div key={profile}>
          <h2>{profile}</h2>
          <p>Stopped EC2: {report["Stopped EC2 Instances"].length}</p>
          <p>Unattached EBS: {report["Unattached EBS Volumes"].length}</p>
        </div>
      ))}
    </div>
  );
}
```

## Cost Considerations

### AWS Cost Explorer API

- **Cost**: $0.01 per API call
- Each `get_cost` request makes 2 calls = **$0.02**
- Plan your queries accordingly

### Other APIs

- EC2 DescribeInstances, DescribeVolumes, DescribeAddresses: Generally free tier
- Budgets API: Free tier includes first 2 budgets

## Security

### Credentials Storage

- Credentials are stored in `~/.aws/credentials` (local machine)
- Never commit credentials to version control
- Use IAM roles when deploying to AWS (EC2, Lambda, ECS)

### API Security

The API routes run server-side only:
- Credentials never exposed to browser
- API routes protected by Next.js server runtime
- Consider adding authentication middleware for production

## Troubleshooting

### "No valid profiles found"

1. Check AWS CLI is installed: `aws --version`
2. Verify profiles exist: `cat ~/.aws/credentials`
3. Test profile: `aws sts get-caller-identity --profile default`

### "Access Denied" errors

1. Verify IAM permissions match the required policy above
2. Check profile credentials are valid
3. Ensure Cost Explorer is enabled in your AWS account

### "Invalid date format"

- Dates must be in `YYYY-MM-DD` format
- Start date must be before end date
- Dates cannot be in the future

## Next Steps

1. **Add Authentication**: Implement user authentication to protect API routes
2. **Caching**: Add Redis/Memcached for cost data caching
3. **Scheduling**: Set up cron jobs for regular data fetching
4. **Alerts**: Implement cost threshold alerts
5. **Multi-Cloud**: Extend to support Azure and GCP

## Related Resources

- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [AWS Cost Explorer API](https://docs.aws.amazon.com/cost-management/latest/APIReference/API_GetCostAndUsage.html)
- [AWS CLI Configuration](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
