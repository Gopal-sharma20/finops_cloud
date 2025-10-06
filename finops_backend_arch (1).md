│  │ AWS MCP    │      │ Azure MCP  │      │  GCP MCP   │      │
│  │  Server    │      │   Server   │      │   Server   │      │
│  │            │      │            │      │            │      │
│  │ - Cost API │      │ - Cost API │      │ - Cost API │      │
│  │ - EC2 API  │      │ - VM API   │      │ - GCE API  │      │
│  │ - EBS API  │      │ - Disk API │      │ - PD API   │      │
│  │ - IAM API  │      │ - AAD API  │      │ - IAM API  │      │
│  └────────────┘      └────────────┘      └────────────┘      │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │ PostgreSQL          │    │ MongoDB             │           │
│  │ + TimescaleDB       │    │                     │           │
│  │                     │    │ - Resource metadata │           │
│  │ - User data         │    │ - Cloud configs     │           │
│  │ - Cost metrics      │    │ - Policies          │           │
│  │ - Budgets           │    │ - Audit logs        │           │
│  │ - Recommendations   │    │                     │           │
│  └─────────────────────┘    └─────────────────────┘           │
│                                                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐           │
│  │ Redis Cluster       │    │ Elasticsearch       │           │
│  │                     │    │                     │           │
│  │ - Session cache     │    │ - Full-text search  │           │
│  │ - API cache         │    │ - Log aggregation   │           │
│  │ - Real-time data    │    │ - Analytics queries │           │
│  │ - Rate limit data   │    │                     │           │
│  └─────────────────────┘    └─────────────────────┘           │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Object Storage (S3/Blob/GCS)                    │           │
│  │                                                  │           │
│  │ - Raw billing CSV files                         │           │
│  │ - Generated reports (PDF/Excel)                 │           │
│  │ - ML model artifacts                            │           │
│  │ - Backup data                                   │           │
│  └─────────────────────────────────────────────────┘           │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Microservices Architecture

```
Core Services (Each independently deployable):

1. auth-service (Port 8001)
   - User authentication
   - JWT token management
   - OAuth integrations
   - RBAC enforcement

2. cost-service (Port 8002)
   - Cost data ingestion
   - Cost analytics
   - Forecasting
   - Anomaly detection

3. resource-service (Port 8003)
   - Resource discovery
   - Inventory management
   - Tag management
   - Utilization tracking

4. recommendation-service (Port 8004)
   - Optimization algorithms
   - Recommendation generation
   - Impact analysis
   - Prioritization engine

5. remediation-service (Port 8005)
   - Policy execution
   - Automated remediation
   - Approval workflows
   - Rollback management

6. budget-service (Port 8006)
   - Budget creation
   - Spend tracking
   - Alert management
   - Forecasting integration

7. notification-service (Port 8007)
   - Email notifications
   - Slack/Teams integration
   - In-app notifications
   - Webhook management

8. reporting-service (Port 8008)
   - Report generation
   - Custom dashboards
   - Data export
   - Scheduled reports
```

---

## 3. API DESIGN

### 3.1 API Structure

**Base URL**: `https://api.cloudoptima.com/v1`

**Authentication**: Bearer token (JWT)

**Rate Limits**:
- Free tier: 1,000 requests/hour
- Pro tier: 10,000 requests/hour
- Enterprise: 100,000 requests/hour

### 3.2 Core Endpoints

#### Authentication API

```yaml
POST /auth/register
  Description: Register new user
  Request:
    email: string
    password: string (min 8 chars)
    company_name: string
    role: enum (cfo, devops, engineer)
  Response:
    user_id: string
    access_token: string
    refresh_token: string

POST /auth/login
  Description: Login user
  Request:
    email: string
    password: string
  Response:
    access_token: string
    refresh_token: string
    expires_in: number

POST /auth/refresh
  Description: Refresh access token
  Request:
    refresh_token: string
  Response:
    access_token: string
    expires_in: number

POST /auth/logout
  Description: Logout user (invalidate tokens)
  Headers:
    Authorization: Bearer {token}
  Response:
    success: boolean
```

#### Cloud Accounts API

```yaml
GET /cloud-accounts
  Description: List connected cloud accounts
  Query Params:
    provider: enum (aws, azure, gcp)
    status: enum (active, error, pending)
  Response:
    accounts: array[
      id: string
      provider: string
      account_id: string
      account_name: string
      status: string
      last_sync: datetime
      monthly_spend: number
    ]
    total: number

POST /cloud-accounts/aws
  Description: Connect AWS account
  Request:
    role_arn: string
    external_id: string
    account_name: string (optional)
  Response:
    account_id: string
    status: string
    verification_status: enum (pending, verified, failed)

POST /cloud-accounts/azure
  Description: Connect Azure subscription
  Request:
    subscription_id: string
    tenant_id: string
    client_id: string
    client_secret: string
  Response:
    account_id: string
    status: string

POST /cloud-accounts/gcp
  Description: Connect GCP project
  Request:
    project_id: string
    service_account_json: string (base64 encoded)
  Response:
    account_id: string
    status: string

DELETE /cloud-accounts/{account_id}
  Description: Disconnect cloud account
  Response:
    success: boolean
```

#### Cost Data API

```yaml
GET /costs/overview
  Description: Get cost overview with trends
  Query Params:
    start_date: date (ISO 8601)
    end_date: date (ISO 8601)
    granularity: enum (daily, weekly, monthly)
    group_by: enum (service, region, tag, account)
    cloud_provider: string (optional)
  Response:
    total_cost: number
    currency: string
    period_comparison: {
      previous_period: number
      change_percent: number
    }
    breakdown: array[{
      dimension: string
      cost: number
      percentage: number
    }]
    time_series: array[{
      date: datetime
      cost: number
    }]

GET /costs/forecast
  Description: Get cost forecast
  Query Params:
    days_ahead: number (default: 30, max: 365)
    confidence_level: number (default: 0.95)
  Response:
    forecast: array[{
      date: datetime
      predicted_cost: number
      lower_bound: number
      upper_bound: number
    }]
    total_forecasted: number
    accuracy_metrics: {
      mape: number (mean absolute percentage error)
      rmse: number
    }

GET /costs/anomalies
  Description: Get detected cost anomalies
  Query Params:
    start_date: date
    end_date: date
    severity: enum (high, medium, low)
    status: enum (active, resolved, ignored)
  Response:
    anomalies: array[{
      id: string
      detected_at: datetime
      service: string
      region: string
      severity: string
      impact_amount: number
      deviation_percent: number
      root_cause: string (ML-generated)
      status: string
      affected_resources: array[string]
    }]

GET /costs/by-service
  Description: Cost breakdown by cloud service
  Response:
    services: array[{
      service_name: string
      provider: string
      current_month: number
      last_month: number
      trend: number (percentage)
      top_resources: array[{
        resource_id: string
        cost: number
      }]
    }]
```

#### Resources API

```yaml
GET /resources/compute
  Description: List compute resources
  Query Params:
    provider: string
    region: string
    status: enum (running, stopped, terminated)
    tags: object (key-value pairs)
    page: number
    page_size: number (max 100)
  Response:
    resources: array[{
      id: string
      name: string
      provider: string
      type: string (instance type/size)
      status: string
      region: string
      monthly_cost: number
      utilization: {
        cpu_avg: number
        memory_avg: number
        network_gb: number
      }
      tags: object
      optimization_score: number (0-100)
      recommendations_count: number
    }]
    pagination: {
      page: number
      page_size: number
      total: number
      total_pages: number
    }

GET /resources/storage
  Description: List storage resources
  Response:
    volumes: array[{
      id: string
      type: string (ebs, managed-disk, persistent-disk)
      size_gb: number
      iops: number
      attached_to: string (instance_id or null)
      monthly_cost: number
      age_days: number
      snapshot_count: number
    }]

POST /resources/bulk-tag
  Description: Apply tags to multiple resources
  Request:
    resource_ids: array[string]
    tags: object (key-value pairs)
    overwrite: boolean
  Response:
    success: boolean
    updated_count: number
    failed: array[{
      resource_id: string
      error: string
    }]
```

#### Recommendations API

```yaml
GET /recommendations
  Description: Get optimization recommendations
  Query Params:
    status: enum (active, scheduled, completed, dismissed)
    category: enum (compute, storage, network, database)
    risk_level: enum (low, medium, high)
    min_savings: number
    sort_by: enum (savings, age, risk)
  Response:
    recommendations: array[{
      id: string
      title: string
      description: string
      category: string
      risk_level: string
      estimated_savings_monthly: number
      estimated_savings_annual: number
      affected_resources: array[{
        id: string
        name: string
        current_cost: number
      }]
      actions: array[{
        type: string
        description: string
        parameters: object
      }]
      impact_analysis: {
        performance_impact: string
        availability_impact: string
        security_impact: string
      }
      created_at: datetime
      expires_at: datetime
    }]

POST /recommendations/{id}/apply
  Description: Apply recommendation
  Request:
    schedule: datetime (optional, for scheduled execution)
    approval_required: boolean
    dry_run: boolean
  Response:
    execution_id: string
    status: enum (queued, executing, completed, failed)
    estimated_completion: datetime

POST /recommendations/{id}/dismiss
  Description: Dismiss recommendation
  Request:
    reason: string
    permanent: boolean
  Response:
    success: boolean

GET /recommendations/{id}/impact-preview
  Description: Preview impact before applying
  Response:
    cost_impact: {
      current_monthly: number
      projected_monthly: number
      savings: number
    }
    resource_changes: array[{
      resource_id: string
      change_type: string
      before: object
      after: object
    }]
    risks: array[string]
```

#### Budget API

```yaml
GET /budgets
  Description: List all budgets
  Response:
    budgets: array[{
      id: string
      name: string
      amount: number
      period: enum (monthly, quarterly, annual)
      scope: {
        type: enum (account, service, tag, team)
        filters: object
      }
      current_spend: number
      forecasted_spend: number
      utilization_percent: number
      status: enum (on_track, at_risk, exceeded)
      alerts: array[{
        threshold: number
        triggered: boolean
        last_triggered_at: datetime
      }]
    }]

POST /budgets
  Description: Create new budget
  Request:
    name: string
    amount: number
    period: string
    start_date: date
    end_date: date
    scope: object
    alerts: array[{
      threshold: number (percentage)
      channels: array[enum (email, slack, webhook)]
    }]
  Response:
    budget_id: string

PUT /budgets/{id}
  Description: Update budget
  Request: (same as POST)
  Response:
    success: boolean

DELETE /budgets/{id}
  Description: Delete budget
  Response:
    success: boolean
```

#### Policies API

```yaml
GET /policies
  Description: List automation policies
  Response:
    policies: array[{
      id: string
      name: string
      description: string
      enabled: boolean
      trigger: {
        type: enum (schedule, event, threshold)
        config: object
      }
      conditions: array[{
        field: string
        operator: string
        value: any
      }]
      actions: array[{
        type: string
        config: object
      }]
      last_executed: datetime
      execution_count: number
      success_rate: number
    }]

POST /policies
  Description: Create automation policy
  Request:
    name: string
    description: string
    enabled: boolean
    trigger: object
    conditions: array[object]
    actions: array[object]
    safety_controls: {
      dry_run_first: boolean
      require_approval: boolean
      rollback_enabled: boolean
      max_resources_per_execution: number
    }
  Response:
    policy_id: string

POST /policies/{id}/execute
  Description: Manually trigger policy execution
  Request:
    dry_run: boolean
  Response:
    execution_id: string
    status: string

GET /policies/{id}/executions
  Description: Get policy execution history
  Response:
    executions: array[{
      id: string
      started_at: datetime
      completed_at: datetime
      status: enum (success, failed, partial)
      resources_affected: number
      logs: array[string]
    }]
```

#### Reports API

```yaml
GET /reports/templates
  Description: List available report templates
  Response:
    templates: array[{
      id: string
      name: string
      description: string
      parameters: array[object]
    }]

POST /reports/generate
  Description: Generate custom report
  Request:
    template_id: string
    parameters: object
    format: enum (pdf, excel, csv, json)
    delivery: {
      method: enum (download, email, s3)
      recipients: array[string] (for email)
    }
  Response:
    report_id: string
    status: enum (generating, completed, failed)
    download_url: string (if completed)

POST /reports/schedule
  Description: Schedule recurring reports
  Request:
    template_id: string
    parameters: object
    schedule: {
      frequency: enum (daily, weekly, monthly)
      day_of_week: number (for weekly)
      day_of_month: number (for monthly)
      time: string (HH:MM)
      timezone: string
    }
    recipients: array[string]
  Response:
    schedule_id: string
```

### 3.3 WebSocket API

**Connection URL**: `wss://ws.cloudoptima.com/v1/stream`

**Authentication**: Query parameter `?token={jwt_token}`

**Message Format**:
```json
{
  "type": "subscribe" | "unsubscribe" | "message",
  "channel": "cost_updates" | "anomalies" | "recommendations",
  "data": object
}
```

**Channels**:
- `cost_updates`: Real-time cost changes
- `anomalies`: New anomaly detections
- `recommendations`: New recommendations
- `policy_executions`: Policy execution status
- `resource_changes`: Resource state changes

---

## 4. DATABASE SCHEMA

### 4.1 PostgreSQL Schema

```sql
-- Users and Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cloud Accounts
CREATE TABLE cloud_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    provider VARCHAR(20) NOT NULL, -- aws, azure, gcp
    account_identifier VARCHAR(255) NOT NULL,
    account_name VARCHAR(255),
    credentials_encrypted TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    last_sync_at TIMESTAMP,
    monthly_spend DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, provider, account_identifier)
);

-- Cost Data (TimescaleDB Hypertable)
CREATE TABLE cost_data (
    time TIMESTAMP NOT NULL,
    organization_id UUID NOT NULL,
    cloud_account_id UUID REFERENCES cloud_accounts(id),
    provider VARCHAR(20),
    service_name VARCHAR(255),
    region VARCHAR(100),
    resource_id VARCHAR(255),
    cost DECIMAL(15, 4) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    usage_amount DECIMAL(20, 6),
    usage_unit VARCHAR(50),
    tags JSONB,
    PRIMARY KEY (time, organization_id, cloud_account_id, service_name, region)
);

-- Convert to hypertable (TimescaleDB)
SELECT create_hypertable('cost_data', 'time');

-- Create indexes
CREATE INDEX idx_cost_data_org ON cost_data(organization_id, time DESC);
CREATE INDEX idx_cost_data_service ON cost_data(service_name, time DESC);
CREATE INDEX idx_cost_data_tags ON cost_data USING GIN (tags);

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) NOT NULL, -- monthly, quarterly, annual
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    scope_type VARCHAR(50),
    scope_filters JSONB,
    alert_thresholds JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    estimated_savings_monthly DECIMAL(15, 2),
    estimated_savings_annual DECIMAL(15, 2),
    affected_resources JSONB NOT NULL,
    actions JSONB NOT NULL,
    impact_analysis JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    applied_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    dismissal_reason TEXT
);

-- Policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    trigger_config JSONB NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    safety_controls JSONB,
    last_executed_at TIMESTAMP,
    execution_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Policy Executions
CREATE TABLE policy_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID REFERENCES policies(id),
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    resources_affected INTEGER,
    execution_logs JSONB,
    error_message TEXT
);

-- Anomalies
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    cloud_account_id UUID REFERENCES cloud_accounts(id),
    detected_at TIMESTAMP DEFAULT NOW(),
    service_name VARCHAR(255),
    region VARCHAR(100),
    severity VARCHAR(20) NOT NULL,
    impact_amount DECIMAL(15, 2),
    deviation_percent DECIMAL(5, 2),
    root_cause TEXT,
    status VARCHAR(50) DEFAULT 'active',
    affected_resources JSONB,
    resolved_at TIMESTAMP,
    resolution_note TEXT
);
```

### 4.2 MongoDB Collections

```javascript
// Resource Inventory Collection
db.resources.createIndex({ "organization_id": 1, "provider": 1, "resource_type": 1 });
db.resources.createIndex({ "tags": 1 });
db.resources.createIndex({ "last_seen": 1 });

{
  "_id": ObjectId(),
  "organization_id": "uuid",
  "cloud_account_id": "uuid",
  "resource_id": "i-1234567890abcdef0",
  "resource_arn": "arn:aws:ec2:us-east-1:123456789012:instance/i-1234567890abcdef0",
  "resource_name": "web-server-prod-01",
  "provider": "aws",
  "resource_type": "ec2_instance",
  "region": "us-east-1",
  "status": "running",
  "configuration": {
    "instance_type": "t3.large",
    "ami_id": "ami-0c55b159cbfafe1f0",
    "vpc_id": "vpc-123456",
    "subnet_id": "subnet-789012",
    "security_groups": ["sg-123456"],
    "key_name": "prod-key"
  },
  "metrics": {
    "cpu_utilization_avg": 45.2,
    "cpu_utilization_max": 78.5,
    "memory_utilization_avg": 62.3,
    "network_in_gb": 125.4,
    "network_out_gb": 98.7
  },
  "cost": {
    "monthly": 87.60,
    "daily_avg": 2.92
  },
  "tags": {
    "Environment": "Production",
    "Team": "Backend",
    "Project": "Main-API",
    "CostCenter": "CC-1234"
  },
  "optimization_score": 72,
  "recommendations": ["right-size", "reserved-instance"],
  "created_at": ISODate("2025-01-15T10:00:00Z"),
  "last_seen": ISODate("2025-01-20T15:30:00Z"),
  "last_updated": ISODate("2025-01-20T15:30:00Z")
}

// Audit Logs Collection
db.audit_logs.createIndex({ "organization_id": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "user_id": 1, "timestamp": -1 });
db.audit_logs.createIndex({ "action": 1 });

{
  "_id": ObjectId(),
  "organization_id": "uuid",
  "user_id": "uuid",
  "timestamp": ISODate("2025-01-20T15:45:00Z"),
  "action": "recommendation.apply",
  "resource_type": "recommendation",
  "resource_id": "uuid",
  "details": {
    "recommendation_title": "Delete 5 unused EBS volumes",
    "estimated_savings": 347.00,
    "affected_resources": ["vol-123", "vol-456"]
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "result": "success"
}
```

---

## 5. DATA PROCESSING PIPELINE

### 5.1 Data Collection Flow

```
Every 5 minutes:
┌─────────────────────────────────────────────────────────────┐
│ 1. Celery Beat Scheduler triggers collection tasks          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Collection Workers (per cloud provider)                  │
│    ├─ AWS Worker: Fetch cost data, resource metadata       │
│    ├─ Azure Worker: Fetch cost data, resource metadata     │
│    └─ GCP Worker: Fetch cost data, resource metadata       │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Raw Data Storage (S3/Blob/GCS)                          │
│    └─ Store raw JSON/CSV for audit and reprocessing        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Data Normalization                                       │
│    ├─ Standardize field names                              │
│    ├─ Convert currencies                                    │
│    ├─ Validate data quality                                 │
│    └─ Enrich with metadata                                  │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Database Storage                                          │
│    ├─ TimescaleDB: Cost time-series data                   │
│    ├─ MongoDB: Resource inventory                           │
│    └─ Redis: Real-time cache                                │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Trigger downstream processes                             │
│    ├─ Anomaly detection                                     │
│    ├─ Recommendation generation                             │
│    ├─ Budget tracking                                       │
│    └─ Notification dispatch                                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Recommendation Generation Pipeline

```python
# recommendation_engine.py
class RecommendationEngine:
    """
    Analyzes resources and generates optimization recommendations
    """
    
    def generate_recommendations(self, organization_id: str):
        """Main recommendation generation flow"""
        
        # 1. Fetch resources
        resources = self.get_resources(organization_id)
        
        # 2. Run analyzers in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            
            futures.append(executor.submit(
                self.analyze_right_sizing, resources
            ))
            futures.append(executor.submit(
                self.analyze_idle_resources, resources
            ))
            futures.append(executor.submit(
                self.analyze_storage_optimization, resources
            ))
            futures.append(executor.submit(
                self.analyze_reserved_instances, resources
            ))
            futures.append(executor.submit(
                self.analyze_network_optimization, resources
            ))
            
            # Collect results
            recommendations = []
            for future in concurrent.futures.as_completed(futures):
                recommendations.extend(future.result())
        
        # 3. Prioritize recommendations
        prioritized = self.prioritize_recommendations(recommendations)
        
        # 4. Save to database
        self.save_recommendations(prioritized)
        
        # 5. Notify users
        self.notify_new_recommendations(organization_id, prioritized)
        
        return prioritized
    
    def analyze_right_sizing(self, resources):
        """Analyze compute resources for right-sizing opportunities"""
        recommendations = []
        
        compute_resources = [r for r in resources if r['type'] in ['ec2', 'vm', 'gce']]
        
        for resource in compute_resources:
            if resource['metrics']['cpu_avg'] < 20 and resource['metrics']['memory_avg'] < 40:
                # Suggest smaller instance
                current_cost = resource['cost']['monthly']
                suggested_type = self.get_smaller_instance_type(resource)
                new_cost = self.estimate_cost(suggested_type)
                
                recommendations.append({
                    'title': f"Right-size {resource['name']}",
                    'category': 'compute',
                    'risk_level': 'medium',
                    'savings_monthly': current_cost - new_cost,
                    'affected_resources': [resource['id']],
                    'actions': [{
                        'type': 'resize_instance',
                        'params': {
                            'instance_id': resource['id'],
                            'new_type': suggested_type
                        }
                    }]
                })
        
        return recommendations
```

---

## 6. AUTHENTICATION & AUTHORIZATION

### 6.1 JWT Token Structure

```python
# Token payload
{
  "sub": "user_uuid",  # Subject (user ID)
  "org_id": "organization_uuid",
  "role": "admin",
  "permissions": ["read:costs", "write:policies", "execute:policies"],
  "iat": 1705747200,  # Issued at
  "exp": 1705833600,  # Expiration
  "jti": "token_uuid"  # JWT ID (for revocation)
}
```

### 6.2 RBAC Permissions

```python
ROLES = {
    "viewer": [
        "read:dashboard",
        "read:costs",
        "read:resources",
        "read:recommendations",
        "read:budgets",
    ],
    "analyst": [
        # All viewer permissions plus:
        "read:reports",
        "create:reports",
        "export:data",
    ],
    "engineer": [# Multi-Cloud FinOps Platform - Backend Architecture

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [API Design](#api-design)
4. [Database Schema](#database-schema)
5. [Data Processing Pipeline](#data-processing-pipeline)
6. [Authentication & Authorization](#authentication--authorization)
7. [Background Jobs & Scheduling](#background-jobs--scheduling)
8. [Caching Strategy](#caching-strategy)
9. [Security](#security)
10. [Scalability](#scalability)

---

## 1. TECHNOLOGY STACK

### Core Backend
```yaml
Primary Language: Python 3.11+
Web Framework: FastAPI 0.104+
API Documentation: OpenAPI 3.1 (Auto-generated)
ASGI Server: Uvicorn with Gunicorn
Task Queue: Celery 5.3+
Message Broker: RabbitMQ / AWS SQS
```

### Databases
```yaml
Primary Database: PostgreSQL 15+ (with TimescaleDB extension)
Time-Series Data: TimescaleDB (for cost metrics)
Document Store: MongoDB 7.0+ (for resource metadata)
Cache: Redis 7.2+ (Cluster mode)
Search: Elasticsearch 8.x (for logs and full-text search)
Data Warehouse: Snowflake / BigQuery (for analytics)
```

### Cloud SDKs
```yaml
AWS: boto3
Azure: azure-sdk-for-python
GCP: google-cloud-python
```

### Data Processing
```yaml
Data Validation: Pydantic 2.0+
Data Transformation: Pandas, NumPy
ML/Analytics: scikit-learn, Prophet (forecasting)
Data Export: Apache Parquet, Apache Arrow
```

### Monitoring & Observability
```yaml
APM: Datadog / New Relic
Logging: Structured logging with ELK stack
Tracing: OpenTelemetry
Metrics: Prometheus + Grafana
Error Tracking: Sentry
```

### Infrastructure
```yaml
Container: Docker
Orchestration: Kubernetes (EKS/AKS/GKE)
IaC: Terraform
CI/CD: GitHub Actions
Secrets: AWS Secrets Manager / HashiCorp Vault
```

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│              (Next.js App - See Frontend Doc)                   │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Kong Gateway │  │ Rate Limiting│  │   WAF        │        │
│  │ / AWS APIGW  │  │              │  │ CloudFlare   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 │ Load Balanced
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              FastAPI Application Servers                  │ │
│  │  (Auto-scaling: 3-20 instances based on load)            │ │
│  │                                                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │ Auth API │  │ Cost API │  │Resource  │              │ │
│  │  │          │  │          │  │  API     │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  │                                                            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │Recommend │  │Budget API│  │Policy API│              │ │
│  │  │   API    │  │          │  │          │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                         │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │ Cost Analysis  │  │ Recommendation │  │  Forecasting   │  │
│  │    Engine      │  │    Engine      │  │   Engine (ML)  │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │
│  │  Remediation   │  │ Anomaly Detect │  │  Tag Mgmt      │  │
│  │    Engine      │  │   Engine (ML)  │  │   Engine       │  │
│  └────────────────┘  └────────────────┘  └────────────────┘  │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                  BACKGROUND WORKERS LAYER                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                   Celery Workers                          │ │
│  │  (Distributed across 10+ worker nodes)                   │ │
│  │                                                            │ │
│  │  Worker Types:                                            │ │
│  │  ├─ Data Collection Workers (AWS/Azure/GCP)             │ │
│  │  ├─ Data Processing Workers                              │ │
│  │  ├─ ML Model Training Workers                            │ │
│  │  ├─ Report Generation Workers                            │ │
│  │  └─ Remediation Execution Workers                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Message Queue (RabbitMQ)                     │ │
│  │  ├─ collection_queue (high priority)                     │ │
│  │  ├─ processing_queue (medium priority)                   │ │
│  │  ├─ ml_queue (low priority, resource intensive)          │ │
│  │  └─ remediation_queue (medium priority)                  │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────┬───────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                     DATA COLLECTION LAYER                       │
│                                                                  │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐      │
│  │ AWS MCP    │      │ Azure MCP  │      │  GCP MCP   │      │
│  │  Server    │      │   Server