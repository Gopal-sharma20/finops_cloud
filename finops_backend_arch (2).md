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
    "engineer": [
        # All analyst permissions plus:
        "write:resources",
        "write:tags",
        "dismiss:recommendations",
        "apply:low_risk_recommendations",
    ],
    "finops_manager": [
        # All engineer permissions plus:
        "write:budgets",
        "write:policies",
        "apply:medium_risk_recommendations",
        "schedule:policies",
    ],
    "admin": [
        # All permissions
        "*"
    ]
}

# Permission decorator
def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = get_current_user()
            if not has_permission(user, permission):
                raise HTTPException(status_code=403, detail="Insufficient permissions")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage in API endpoints
@app.post("/recommendations/{id}/apply")
@require_permission("apply:recommendations")
async def apply_recommendation(id: str, current_user: User):
    recommendation = get_recommendation(id)
    
    # Check risk-based permissions
    if recommendation.risk_level == "high":
        if not has_permission(current_user, "apply:high_risk_recommendations"):
            raise HTTPException(status_code=403, detail="High-risk recommendations require admin approval")
    
    return execute_recommendation(recommendation)
```

### 6.3 Multi-Tenancy Isolation

```python
# Automatic organization filtering middleware
@app.middleware("http")
async def organization_context_middleware(request: Request, call_next):
    user = await get_current_user_from_token(request)
    
    if user:
        # Inject organization context
        request.state.organization_id = user.organization_id
        request.state.user_id = user.id
    
    response = await call_next(request)
    return response

# Database query helper
class BaseRepository:
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
    
    def query(self, model, filters=None):
        """Automatically add organization filter to all queries"""
        base_filter = {"organization_id": self.organization_id}
        if filters:
            base_filter.update(filters)
        return model.filter(**base_filter)
```

---

## 7. BACKGROUND JOBS & SCHEDULING

### 7.1 Celery Task Structure

```python
# celery_app.py
from celery import Celery
from celery.schedules import crontab

celery_app = Celery(
    'cloudoptima',
    broker='amqp://rabbitmq:5672',
    backend='redis://redis:6379/0'
)

# Task routing
celery_app.conf.task_routes = {
    'tasks.collect_aws_data': {'queue': 'collection'},
    'tasks.collect_azure_data': {'queue': 'collection'},
    'tasks.collect_gcp_data': {'queue': 'collection'},
    'tasks.process_cost_data': {'queue': 'processing'},
    'tasks.generate_recommendations': {'queue': 'processing'},
    'tasks.train_ml_models': {'queue': 'ml'},
    'tasks.execute_remediation': {'queue': 'remediation'},
}

# Scheduled tasks
celery_app.conf.beat_schedule = {
    # Data collection every 5 minutes
    'collect-cloud-data': {
        'task': 'tasks.collect_all_cloud_data',
        'schedule': crontab(minute='*/5'),
    },
    
    # Generate recommendations every hour
    'generate-recommendations': {
        'task': 'tasks.generate_recommendations_all_orgs',
        'schedule': crontab(minute=0),
    },
    
    # Anomaly detection every 15 minutes
    'detect-anomalies': {
        'task': 'tasks.detect_cost_anomalies',
        'schedule': crontab(minute='*/15'),
    },
    
    # Retrain ML models daily at 2 AM
    'retrain-ml-models': {
        'task': 'tasks.retrain_forecasting_models',
        'schedule': crontab(hour=2, minute=0),
    },
    
    # Budget tracking every hour
    'track-budgets': {
        'task': 'tasks.check_budget_thresholds',
        'schedule': crontab(minute=0),
    },
    
    # Clean up old data weekly
    'cleanup-old-data': {
        'task': 'tasks.cleanup_old_data',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),
    },
}
```

### 7.2 Task Implementations

```python
# tasks/collection.py
from celery import group
from celery_app import celery_app

@celery_app.task(bind=True, max_retries=3)
def collect_aws_data(self, account_id: str):
    """Collect data from AWS account"""
    try:
        from mcp_servers.aws_mcp_server import AWSFinOpsMCPServer
        
        # Get account credentials
        account = CloudAccount.get(account_id)
        
        # Initialize MCP server
        mcp = AWSFinOpsMCPServer(role_arn=account.role_arn)
        
        # Collect all data
        data = mcp.collect_all_finops_data()
        
        # Store raw data
        store_raw_data(account_id, 'aws', data)
        
        # Trigger processing
        process_collected_data.delay(account_id, data)
        
        # Update last sync time
        account.update_last_sync()
        
        return {"status": "success", "resources_collected": len(data)}
        
    except Exception as e:
        logger.error(f"Failed to collect AWS data for {account_id}: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@celery_app.task
def collect_all_cloud_data():
    """Collect data from all connected cloud accounts"""
    accounts = CloudAccount.get_all_active()
    
    # Create task group for parallel execution
    task_group = group(
        collect_aws_data.s(acc.id) for acc in accounts if acc.provider == 'aws'
    ) | group(
        collect_azure_data.s(acc.id) for acc in accounts if acc.provider == 'azure'
    ) | group(
        collect_gcp_data.s(acc.id) for acc in accounts if acc.provider == 'gcp'
    )
    
    result = task_group.apply_async()
    return result

# tasks/processing.py
@celery_app.task
def process_collected_data(account_id: str, raw_data: dict):
    """Process and normalize collected data"""
    
    # 1. Normalize data format
    normalized = normalize_cloud_data(raw_data)
    
    # 2. Store in databases
    store_cost_data(normalized['costs'])
    store_resource_data(normalized['resources'])
    
    # 3. Update aggregations
    update_daily_aggregations(account_id)
    
    # 4. Invalidate caches
    invalidate_cost_cache(account_id)
    
    return {"status": "processed", "records": len(normalized)}

# tasks/recommendations.py
@celery_app.task
def generate_recommendations_all_orgs():
    """Generate recommendations for all organizations"""
    organizations = Organization.get_all_active()
    
    for org in organizations:
        generate_recommendations_for_org.delay(org.id)

@celery_app.task(time_limit=600)  # 10 minute timeout
def generate_recommendations_for_org(org_id: str):
    """Generate recommendations for a specific organization"""
    from engines.recommendation_engine import RecommendationEngine
    
    engine = RecommendationEngine(org_id)
    recommendations = engine.generate_recommendations()
    
    # Save to database
    for rec in recommendations:
        Recommendation.create(rec)
    
    # Notify users
    if recommendations:
        notify_new_recommendations.delay(org_id, len(recommendations))
    
    return {"org_id": org_id, "recommendations_count": len(recommendations)}

# tasks/ml.py
@celery_app.task(time_limit=3600)  # 1 hour timeout
def retrain_forecasting_models():
    """Retrain ML forecasting models with latest data"""
    from engines.forecasting_engine import ForecastingEngine
    
    organizations = Organization.get_all_active()
    
    for org in organizations:
        try:
            engine = ForecastingEngine(org.id)
            
            # Get training data (last 90 days)
            training_data = get_cost_data(org.id, days=90)
            
            # Train model
            model = engine.train_prophet_model(training_data)
            
            # Save model
            save_ml_model(org.id, 'forecast', model)
            
            logger.info(f"Retrained forecast model for org {org.id}")
            
        except Exception as e:
            logger.error(f"Failed to retrain model for org {org.id}: {str(e)}")

@celery_app.task
def detect_cost_anomalies():
    """Detect cost anomalies across all organizations"""
    organizations = Organization.get_all_active()
    
    for org in organizations:
        detect_anomalies_for_org.delay(org.id)

@celery_app.task
def detect_anomalies_for_org(org_id: str):
    """Detect anomalies for a specific organization"""
    from engines.anomaly_detection import AnomalyDetector
    
    detector = AnomalyDetector(org_id)
    
    # Get recent cost data
    recent_costs = get_recent_costs(org_id, hours=24)
    
    # Detect anomalies
    anomalies = detector.detect(recent_costs)
    
    # Save and notify
    for anomaly in anomalies:
        Anomaly.create(anomaly)
        send_anomaly_alert.delay(org_id, anomaly)
    
    return {"org_id": org_id, "anomalies_detected": len(anomalies)}

# tasks/remediation.py
@celery_app.task(bind=True)
def execute_remediation(self, remediation_id: str):
    """Execute a remediation action"""
    remediation = Remediation.get(remediation_id)
    
    try:
        # Update status
        remediation.update_status('executing')
        
        # Execute based on action type
        if remediation.action_type == 'stop_instance':
            result = stop_instance(remediation.resource_id)
        elif remediation.action_type == 'delete_volume':
            result = delete_volume(remediation.resource_id)
        elif remediation.action_type == 'resize_instance':
            result = resize_instance(remediation.resource_id, remediation.params)
        
        # Update status
        remediation.update_status('completed', result=result)
        
        # Notify user
        send_remediation_success.delay(remediation.organization_id, remediation_id)
        
        return {"status": "success", "result": result}
        
    except Exception as e:
        logger.error(f"Remediation failed: {str(e)}")
        remediation.update_status('failed', error=str(e))
        
        # Notify user of failure
        send_remediation_failure.delay(remediation.organization_id, remediation_id, str(e))
        
        raise
```

---

## 8. CACHING STRATEGY

### 8.1 Multi-Layer Cache

```python
# cache.py
import redis
from functools import wraps
import hashlib
import json

class CacheManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='redis',
            port=6379,
            db=0,
            decode_responses=True
        )
    
    def cache_key(self, prefix: str, **kwargs) -> str:
        """Generate cache key from parameters"""
        params_str = json.dumps(kwargs, sort_keys=True)
        params_hash = hashlib.md5(params_str.encode()).hexdigest()
        return f"{prefix}:{params_hash}"
    
    def get(self, key: str):
        """Get from cache"""
        value = self.redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    
    def set(self, key: str, value: any, ttl: int = 300):
        """Set cache with TTL (default 5 minutes)"""
        self.redis_client.setex(
            key,
            ttl,
            json.dumps(value, default=str)
        )
    
    def invalidate_pattern(self, pattern: str):
        """Invalidate all keys matching pattern"""
        for key in self.redis_client.scan_iter(pattern):
            self.redis_client.delete(key)

cache = CacheManager()

# Cache decorator
def cached(prefix: str, ttl: int = 300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache.cache_key(prefix, **kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Usage example
@cached(prefix="cost_overview", ttl=300)
async def get_cost_overview(org_id: str, start_date: str, end_date: str):
    # Expensive database query
    return query_cost_data(org_id, start_date, end_date)
```

### 8.2 Cache Invalidation Strategy

```python
# Cache invalidation on data updates
class CostService:
    def update_cost_data(self, org_id: str, new_data: dict):
        # Update database
        self.db.update_costs(new_data)
        
        # Invalidate related caches
        cache.invalidate_pattern(f"cost_overview:*{org_id}*")
        cache.invalidate_pattern(f"cost_by_service:*{org_id}*")
        cache.invalidate_pattern(f"cost_forecast:*{org_id}*")
        
        # Publish cache invalidation event for distributed systems
        redis_client.publish('cache_invalidate', json.dumps({
            'patterns': [f"cost*{org_id}*"]
        }))
```

### 8.3 Cache Warming

```python
# Warm cache for frequently accessed data
@celery_app.task
def warm_cache_for_active_users():
    """Pre-populate cache for active users"""
    # Get users active in last 24 hours
    active_users = User.get_active_last_24h()
    
    for user in active_users:
        # Warm dashboard data
        warm_dashboard_cache.delay(user.organization_id)

@celery_app.task
def warm_dashboard_cache(org_id: str):
    """Pre-populate dashboard cache"""
    from services.cost_service import CostService
    
    service = CostService(org_id)
    
    # Pre-calculate and cache common queries
    service.get_cost_overview(days=30)
    service.get_cost_by_service(days=30)
    service.get_top_resources(limit=10)
```

---

## 9. SECURITY

### 9.1 Security Best Practices

```python
# security.py
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import secrets

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Encryption for sensitive data (cloud credentials)
class CredentialEncryption:
    def __init__(self):
        # Load encryption key from environment
        key = os.getenv('ENCRYPTION_KEY')
        self.cipher = Fernet(key.encode())
    
    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        return self.cipher.decrypt(encrypted_data.encode()).decode()

credential_encryption = CredentialEncryption()

# API Key generation
def generate_api_key() -> str:
    return secrets.token_urlsafe(32)

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/costs/overview")
@limiter.limit("100/minute")  # 100 requests per minute
async def get_cost_overview(request: Request):
    # Endpoint logic
    pass
```

### 9.2 Input Validation

```python
# schemas/validation.py
from pydantic import BaseModel, Field, validator
from datetime import datetime, date

class CostQueryParams(BaseModel):
    start_date: date
    end_date: date
    granularity: str = Field(..., regex="^(daily|weekly|monthly)$")
    group_by: str = Field(..., regex="^(service|region|tag|account)$")
    
    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
    
    @validator('end_date')
    def date_range_not_too_large(cls, v, values):
        if 'start_date' in values:
            delta = v - values['start_date']
            if delta.days > 365:
                raise ValueError('Date range cannot exceed 365 days')
        return v

class BudgetCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    amount: float = Field(..., gt=0, le=10000000)
    period: str = Field(..., regex="^(monthly|quarterly|annual)$")
    start_date: date
    end_date: date
    
    @validator('name')
    def sanitize_name(cls, v):
        # Remove potentially dangerous characters
        return v.strip().replace('<', '').replace('>', '')
```

### 9.3 SQL Injection Prevention

```python
# Use parameterized queries with SQLAlchemy
from sqlalchemy import text

# WRONG - SQL Injection vulnerability
def get_user_unsafe(email: str):
    query = f"SELECT * FROM users WHERE email = '{email}'"
    return db.execute(query)

# CORRECT - Parameterized query
def get_user_safe(email: str):
    query = text("SELECT * FROM users WHERE email = :email")
    return db.execute(query, {"email": email})

# Even better - Use ORM
def get_user_orm(email: str):
    return db.query(User).filter(User.email == email).first()
```

### 9.4 Security Headers

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.cloudoptima.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["api.cloudoptima.com", "*.cloudoptima.com"]
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

---

## 10. SCALABILITY

### 10.1 Horizontal Scaling

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cloudoptima-api
spec:
  replicas: 3  # Start with 3 replicas
  selector:
    matchLabels:
      app: cloudoptima-api
  template:
    metadata:
      labels:
        app: cloudoptima-api
    spec:
      containers:
      - name: api
        image: cloudoptima/api:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cloudoptima-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cloudoptima-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 10.2 Database Scaling

```python
# Database connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Maintain 20 connections
    max_overflow=10,  # Allow 10 additional connections
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Read replicas for read-heavy operations
class DatabaseRouter:
    def __init__(self):
        self.primary = create_engine(PRIMARY_DB_URL)
        self.replicas = [
            create_engine(REPLICA_1_URL),
            create_engine(REPLICA_2_URL),
        ]
    
    def get_read_engine(self):
        """Load balance reads across replicas"""
        return random.choice(self.replicas)
    
    def get_write_engine(self):
        """All writes go to primary"""
        return self.primary

# TimescaleDB data retention policy
# Keep detailed data for 90 days, aggregations for 2 years
CREATE MATERIALIZED VIEW cost_data_daily AS
SELECT
    time_bucket('1 day', time) AS day,
    organization_id,
    cloud_account_id,
    service_name,
    SUM(cost) as total_cost,
    AVG(cost) as avg_cost
FROM cost_data
GROUP BY day, organization_id, cloud_account_id, service_name;

-- Refresh daily aggregations
SELECT add_continuous_aggregate_policy('cost_data_daily',
    start_offset => INTERVAL '3 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour');

-- Drop old raw data
SELECT add_retention_policy('cost_data', INTERVAL '90 days');
```

### 10.3 Asynchronous Processing

```python
# Use async/await for I/O-bound operations
import asyncio
from fastapi import FastAPI

app = FastAPI()

@app.get("/costs/overview")
async def get_cost_overview(org_id: str):
    # Run multiple queries concurrently
    results = await asyncio.gather(
        get_total_costs(org_id),
        get_cost_by_service(org_id),
        get_cost_trend(org_id),
        get_budget_status(org_id),
    )
    
    return {
        "total_costs": results[0],
        "by_service": results[1],
        "trend": results[2],
        "budget_status": results[3],
    }

# Async database queries
async def get_total_costs(org_id: str):
    async with async_session() as session:
        result = await session.execute(
            select(func.sum(CostData.cost))
            .where(CostData.organization_id == org_id)
        )
        return result.scalar()
```

### 10.4 Load Balancing Strategy

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
│               (AWS ALB / NGINX / Kong)                   │
│                                                           │
│  Health Check: /health                                   │
│  Strategy: Least connections                             │
│  Sticky Sessions: Enabled (for WebSocket)                │
└─────────────┬───────────────────────────────────────────┘
              │
              ├──────────┬──────────┬──────────┬──────────┐
              ↓          ↓          ↓          ↓          ↓
         ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
         │ API-1  │ │ API-2  │ │ API-3  │ │ API-4  │ │ API-N  │
         └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

---

## 11. MONITORING & OBSERVABILITY

### 11.1 Health Checks

```python
# health.py
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with dependencies"""
    checks = {
        "api": "healthy",
        "database": check_database(),
        "redis": check_redis(),
        "rabbitmq": check_rabbitmq(),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    all_healthy = all(v == "healthy" for k, v in checks.items() if k != "timestamp")
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks
    }

def check_database():
    try:
        db.execute("SELECT 1")
        return "healthy"
    except:
        return "unhealthy"

def check_redis():
    try:
        redis_client.ping()
        return "healthy"
    except:
        return "unhealthy"
```

### 11.2 Metrics Collection

```python
# metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Define metrics
api_requests_total = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

api_request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

cost_data_points_collected = Counter(
    'cost_data_points_collected_total',
    'Total cost data points collected',
    ['provider']
)

active_organizations = Gauge(
    'active_organizations',
    'Number of active organizations'
)

# Middleware to collect metrics
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    
    # Record metrics
    api_requests_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    api_request_duration.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response

# Expose metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type="text/plain")
```

### 11.3 Structured Logging

```python
# logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields
        if hasattr(record, 'organization_id'):
            log_data['organization_id'] = record.organization_id
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        # Add exception info
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
logger.handlers[0].setFormatter(JSONFormatter())

# Usage
logger.info(
    "Cost data collected",
    extra={
        "organization_id": org_id,
        "provider": "aws",
        "records_count": 1234
    }
)
```

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: Backend Team  
**Next Review**: Quarterly# Multi-Cloud FinOps Platform - Backend Architecture

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