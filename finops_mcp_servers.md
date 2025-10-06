# Multi-Cloud FinOps Platform - MCP Servers Documentation

## Table of Contents
1. [MCP Overview](#mcp-overview)
2. [AWS MCP Server](#aws-mcp-server)
3. [Azure MCP Server](#azure-mcp-server)
4. [GCP MCP Server](#gcp-mcp-server)
5. [Unified Orchestrator](#unified-orchestrator)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)

---

## 1. MCP OVERVIEW

### 1.1 What is MCP?

**Model Context Protocol (MCP)** is a standardized protocol for connecting AI systems to data sources. In our FinOps platform, we use MCP servers as intelligent, specialized connectors that:

- **Collect** cloud cost and resource data from AWS, Azure, and GCP
- **Normalize** data into a unified format across all cloud providers
- **Enrich** data with metadata, tags, and optimization insights
- **Stream** real-time updates to the main application
- **Cache** frequently accessed data for performance

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CloudOptima Backend                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Unified MCP Orchestrator                      │ │
│  │  - Coordinates all MCP servers                        │ │
│  │  - Manages parallel data collection                   │ │
│  │  - Handles retries and error recovery                 │ │
│  └────────┬──────────────┬──────────────┬────────────────┘ │
│           │              │              │                   │
└───────────┼──────────────┼──────────────┼───────────────────┘
            │              │              │
            ↓              ↓              ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  AWS MCP     │  │  Azure MCP   │  │  GCP MCP     │
    │  Server      │  │  Server      │  │  Server      │
    │              │  │              │  │              │
    │ - boto3 SDK  │  │ - Azure SDK  │  │ - Google SDK │
    │ - Cost API   │  │ - Cost API   │  │ - Billing API│
    │ - EC2 API    │  │ - Compute API│  │ - Compute API│
    │ - IAM API    │  │ - AAD API    │  │ - IAM API    │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                  │
           ↓                 ↓                  ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   AWS API    │  │  Azure API   │  │  GCP API     │
    └──────────────┘  └──────────────┘  └──────────────┘
```

### 1.3 Key Features

**1. Incremental Data Collection**
- Collect only changed data since last sync
- Reduce API calls and costs
- Faster synchronization

**2. Intelligent Rate Limiting**
- Respect cloud provider rate limits
- Automatic backoff and retry
- Queue management for API calls

**3. Data Validation**
- Schema validation for all collected data
- Data quality checks
- Anomaly detection during collection

**4. Error Recovery**
- Graceful degradation on API failures
- Partial data collection support
- Comprehensive error logging

**5. Caching Strategy**
- Cache frequently accessed resources
- TTL-based cache invalidation
- Distributed cache for multi-instance deployments

---

## 2. AWS MCP SERVER

### 2.1 Configuration

```python
# config/aws_mcp_config.py
AWS_MCP_CONFIG = {
    "authentication": {
        "method": "iam_role",  # or "access_keys"
        "role_arn": "arn:aws:iam::ACCOUNT_ID:role/CloudOptimaReadOnly",
        "external_id": "cloudoptima-{organization_id}",
        "session_duration": 3600,  # 1 hour
    },
    
    "collection": {
        "regions": "all",  # or list of specific regions
        "services": [
            "ec2",
            "ebs",
            "snapshots",
            "rds",
            "s3",
            "lambda",
            "elb",
            "nat_gateway",
            "vpc",
            "iam",
            "cloudwatch",
        ],
        "batch_size": 100,
        "parallel_regions": 5,
    },
    
    "rate_limiting": {
        "max_calls_per_second": 10,
        "burst_capacity": 50,
        "backoff_strategy": "exponential",
    },
    
    "caching": {
        "enabled": True,
        "ttl": {
            "cost_data": 300,  # 5 minutes
            "resource_metadata": 3600,  # 1 hour
            "static_data": 86400,  # 24 hours
        }
    }
}
```

### 2.2 IAM Policy Requirements

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CostAndUsageReporting",
      "Effect": "Allow",
      "Action": [
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetReservationUtilization",
        "ce:GetSavingsPlansUtilization",
        "cur:DescribeReportDefinitions"
      ],
      "Resource": "*"
    },
    {
      "Sid": "EC2ReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:Get*",
        "ec2:List*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMReadOnly",
      "Effect": "Allow",
      "Action": [
        "iam:Get*",
        "iam:List*",
        "iam:GenerateCredentialReport",
        "iam:GenerateServiceLastAccessedDetails"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudWatchReadOnly",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:Describe*",
        "cloudwatch:Get*",
        "cloudwatch:List*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TrustedAdvisorReadOnly",
      "Effect": "Allow",
      "Action": [
        "support:DescribeTrustedAdvisorChecks",
        "support:DescribeTrustedAdvisorCheckResult"
      ],
      "Resource": "*"
    },
    {
      "Sid": "OrganizationsReadOnly",
      "Effect": "Allow",
      "Action": [
        "organizations:Describe*",
        "organizations:List*"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2.3 Data Collection Methods

```python
# aws_mcp_server/collectors/cost_collector.py
class AWSCostCollector:
    """Collects cost data from AWS Cost Explorer"""
    
    def __init__(self, session: boto3.Session):
        self.ce_client = session.client('ce')
        self.cache = RedisCache()
    
    async def collect_cost_and_usage(
        self,
        start_date: str,
        end_date: str,
        granularity: str = "DAILY"
    ) -> Dict:
        """
        Collect cost and usage data
        
        Args:
            start_date: ISO format date (YYYY-MM-DD)
            end_date: ISO format date (YYYY-MM-DD)
            granularity: DAILY, MONTHLY, or HOURLY
        
        Returns:
            Normalized cost data dictionary
        """
        cache_key = f"aws:cost:{start_date}:{end_date}:{granularity}"
        
        # Check cache first
        cached_data = self.cache.get(cache_key)
        if cached_data:
            logger.info(f"Cache hit for cost data: {cache_key}")
            return cached_data
        
        try:
            response = self.ce_client.get_cost_and_usage(
                TimePeriod={
                    'Start': start_date,
                    'End': end_date
                },
                Granularity=granularity,
                Metrics=['UnblendedCost', 'UsageQuantity'],
                GroupBy=[
                    {'Type': 'DIMENSION', 'Key': 'SERVICE'},
                    {'Type': 'DIMENSION', 'Key': 'REGION'},
                    {'Type': 'TAG', 'Key': 'Environment'}
                ]
            )
            
            # Normalize response
            normalized = self._normalize_cost_response(response)
            
            # Cache for 5 minutes
            self.cache.set(cache_key, normalized, ttl=300)
            
            return normalized
            
        except ClientError as e:
            logger.error(f"Failed to collect cost data: {e}")
            raise AWSMCPException(f"Cost collection failed: {e}")
    
    def _normalize_cost_response(self, response: Dict) -> Dict:
        """Normalize AWS Cost Explorer response to standard format"""
        normalized = {
            "provider": "aws",
            "collection_timestamp": datetime.utcnow().isoformat(),
            "data_points": []
        }
        
        for result in response['ResultsByTime']:
            time_period = result['TimePeriod']
            
            for group in result.get('Groups', []):
                # Extract dimensions
                dimensions = {
                    key['Key']: value 
                    for key, value in zip(
                        [{'Key': 'SERVICE'}, {'Key': 'REGION'}, {'Key': 'TAG'}],
                        group['Keys']
                    )
                }
                
                # Extract metrics
                metrics = group['Metrics']
                
                normalized['data_points'].append({
                    "time": time_period['Start'],
                    "service": dimensions.get('SERVICE'),
                    "region": dimensions.get('REGION'),
                    "environment": dimensions.get('TAG'),
                    "cost": float(metrics['UnblendedCost']['Amount']),
                    "usage_quantity": float(metrics['UsageQuantity']['Amount']),
                    "currency": metrics['UnblendedCost']['Unit']
                })
        
        return normalized

# aws_mcp_server/collectors/resource_collector.py
class AWSResourceCollector:
    """Collects resource inventory from AWS"""
    
    def __init__(self, session: boto3.Session):
        self.session = session
        self.regions = self._get_enabled_regions()
    
    def _get_enabled_regions(self) -> List[str]:
        """Get list of enabled AWS regions"""
        ec2 = self.session.client('ec2', region_name='us-east-1')
        response = ec2.describe_regions(AllRegions=False)
        return [region['RegionName'] for region in response['Regions']]
    
    async def collect_all_resources(self) -> Dict:
        """Collect all resources across all regions"""
        tasks = []
        
        # Collect in parallel across regions
        for region in self.regions:
            tasks.append(self._collect_region_resources(region))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Merge results
        all_resources = {
            "compute": [],
            "storage": [],
            "network": [],
            "database": [],
            "identity": []
        }
        
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Region collection failed: {result}")
                continue
            
            for category, resources in result.items():
                all_resources[category].extend(resources)
        
        return all_resources
    
    async def _collect_region_resources(self, region: str) -> Dict:
        """Collect resources from a specific region"""
        logger.info(f"Collecting resources from {region}")
        
        # Initialize regional clients
        ec2 = self.session.client('ec2', region_name=region)
        cloudwatch = self.session.client('cloudwatch', region_name=region)
        
        resources = {
            "compute": [],
            "storage": [],
            "network": []
        }
        
        # Collect EC2 instances
        try:
            instances = await self._collect_ec2_instances(ec2, cloudwatch, region)
            resources["compute"].extend(instances)
        except Exception as e:
            logger.error(f"Failed to collect EC2 in {region}: {e}")
        
        # Collect EBS volumes
        try:
            volumes = await self._collect_ebs_volumes(ec2, region)
            resources["storage"].extend(volumes)
        except Exception as e:
            logger.error(f"Failed to collect EBS in {region}: {e}")
        
        # Collect NAT Gateways
        try:
            nat_gateways = await self._collect_nat_gateways(ec2, cloudwatch, region)
            resources["network"].extend(nat_gateways)
        except Exception as e:
            logger.error(f"Failed to collect NAT Gateways in {region}: {e}")
        
        return resources
    
    async def _collect_ec2_instances(
        self,
        ec2_client,
        cloudwatch_client,
        region: str
    ) -> List[Dict]:
        """Collect EC2 instance details with metrics"""
        instances = []
        
        paginator = ec2_client.get_paginator('describe_instances')
        
        for page in paginator.paginate():
            for reservation in page['Reservations']:
                for instance in reservation['Instances']:
                    instance_data = {
                        "resource_id": instance['InstanceId'],
                        "resource_type": "ec2_instance",
                        "provider": "aws",
                        "region": region,
                        "name": self._get_tag_value(instance.get('Tags', []), 'Name'),
                        "state": instance['State']['Name'],
                        "instance_type": instance['InstanceType'],
                        "launch_time": instance['LaunchTime'].isoformat(),
                        "vpc_id": instance.get('VpcId'),
                        "subnet_id": instance.get('SubnetId'),
                        "availability_zone": instance['Placement']['AvailabilityZone'],
                        "platform": instance.get('Platform', 'Linux'),
                        "tags": {
                            tag['Key']: tag['Value'] 
                            for tag in instance.get('Tags', [])
                        }
                    }
                    
                    # Get metrics if running
                    if instance['State']['Name'] == 'running':
                        metrics = await self._get_instance_metrics(
                            cloudwatch_client,
                            instance['InstanceId']
                        )
                        instance_data['metrics'] = metrics
                        
                        # Calculate optimization score
                        instance_data['optimization_score'] = self._calculate_optimization_score(
                            instance_data,
                            metrics
                        )
                    
                    instances.append(instance_data)
        
        return instances
    
    async def _get_instance_metrics(
        self,
        cloudwatch_client,
        instance_id: str,
        days: int = 14
    ) -> Dict:
        """Get CloudWatch metrics for instance"""
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        # CPU Utilization
        cpu_response = cloudwatch_client.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='CPUUtilization',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=86400,  # Daily
            Statistics=['Average', 'Maximum']
        )
        
        # Network metrics
        network_in = cloudwatch_client.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='NetworkIn',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=86400,
            Statistics=['Sum']
        )
        
        network_out = cloudwatch_client.get_metric_statistics(
            Namespace='AWS/EC2',
            MetricName='NetworkOut',
            Dimensions=[{'Name': 'InstanceId', 'Value': instance_id}],
            StartTime=start_time,
            EndTime=end_time,
            Period=86400,
            Statistics=['Sum']
        )
        
        return {
            "cpu_utilization_avg": self._calculate_average(cpu_response, 'Average'),
            "cpu_utilization_max": self._calculate_average(cpu_response, 'Maximum'),
            "network_in_bytes": self._calculate_sum(network_in),
            "network_out_bytes": self._calculate_sum(network_out),
            "data_collection_period_days": days
        }
    
    def _calculate_optimization_score(
        self,
        instance: Dict,
        metrics: Dict
    ) -> int:
        """
        Calculate optimization score (0-100)
        100 = perfectly optimized
        0 = highly wasteful
        """
        score = 100
        
        # Penalize low CPU utilization
        cpu_avg = metrics.get('cpu_utilization_avg', 50)
        if cpu_avg < 10:
            score -= 40
        elif cpu_avg < 20:
            score -= 30
        elif cpu_avg < 30:
            score -= 20
        elif cpu_avg < 40:
            score -= 10
        
        # Penalize stopped instances
        if instance['state'] == 'stopped':
            score -= 50
        
        # Reward proper tagging
        required_tags = ['Environment', 'Owner', 'CostCenter']
        missing_tags = [tag for tag in required_tags if tag not in instance['tags']]
        score -= len(missing_tags) * 5
        
        # Ensure score is within bounds
        return max(0, min(100, score))
```

### 2.4 Optimization Detection

```python
# aws_mcp_server/analyzers/optimization_analyzer.py
class AWSOptimizationAnalyzer:
    """Analyzes AWS resources for optimization opportunities"""
    
    def analyze_all(self, resources: Dict) -> List[Dict]:
        """Run all optimization analyzers"""
        optimizations = []
        
        # Right-sizing opportunities
        optimizations.extend(self.analyze_right_sizing(resources['compute']))
        
        # Idle resource detection
        optimizations.extend(self.analyze_idle_resources(resources))
        
        # Storage optimization
        optimizations.extend(self.analyze_storage(resources['storage']))
        
        # Reserved Instance recommendations
        optimizations.extend(self.analyze_reserved_instances(resources['compute']))
        
        # Network optimization
        optimizations.extend(self.analyze_network(resources['network']))
        
        return optimizations
    
    def analyze_right_sizing(self, compute_resources: List[Dict]) -> List[Dict]:
        """Identify right-sizing opportunities"""
        recommendations = []
        
        for resource in compute_resources:
            if resource['state'] != 'running':
                continue
            
            metrics = resource.get('metrics', {})
            cpu_avg = metrics.get('cpu_utilization_avg', 100)
            
            # Under-utilized instance
            if cpu_avg < 20:
                # Suggest smaller instance type
                current_type = resource['instance_type']
                suggested_type = self._get_smaller_instance_type(current_type)
                
                if suggested_type:
                    current_cost = self._get_instance_cost(current_type, resource['region'])
                    suggested_cost = self._get_instance_cost(suggested_type, resource['region'])
                    
                    recommendations.append({
                        "type": "right_sizing",
                        "resource_id": resource['resource_id'],
                        "resource_name": resource['name'],
                        "provider": "aws",
                        "region": resource['region'],
                        "current_type": current_type,
                        "suggested_type": suggested_type,
                        "current_monthly_cost": current_cost,
                        "suggested_monthly_cost": suggested_cost,
                        "estimated_savings": current_cost - suggested_cost,
                        "risk_level": "medium",
                        "confidence": self._calculate_confidence(metrics),
                        "reason": f"Average CPU utilization is {cpu_avg:.1f}% over last 14 days"
                    })
        
        return recommendations
    
    def analyze_idle_resources(self, resources: Dict) -> List[Dict]:
        """Detect idle/unused resources"""
        recommendations = []
        
        # Stopped EC2 instances
        for instance in resources.get('compute', []):
            if instance['state'] == 'stopped':
                launch_time = datetime.fromisoformat(instance['launch_time'].replace('Z', '+00:00'))
                days_stopped = (datetime.now(timezone.utc) - launch_time).days
                
                if days_stopped > 7:
                    recommendations.append({
                        "type": "idle_resource",
                        "subtype": "stopped_instance",
                        "resource_id": instance['resource_id'],
                        "resource_name": instance['name'],
                        "provider": "aws",
                        "region": instance['region'],
                        "days_stopped": days_stopped,
                        "action": "terminate" if days_stopped > 30 else "review",
                        "risk_level": "high" if days_stopped > 30 else "medium",
                        "reason": f"Instance stopped for {days_stopped} days"
                    })
        
        # Unattached EBS volumes
        for volume in resources.get('storage', []):
            if volume['resource_type'] == 'ebs_volume' and not volume.get('attached_to'):
                age_days = (
                    datetime.now(timezone.utc) - 
                    datetime.fromisoformat(volume['create_time'].replace('Z', '+00:00'))
                ).days
                
                monthly_cost = self._calculate_ebs_cost(volume)
                
                recommendations.append({
                    "type": "idle_resource",
                    "subtype": "unattached_volume",
                    "resource_id": volume['resource_id'],
                    "provider": "aws",
                    "region": volume['region'],
                    "size_gb": volume['size_gb'],
                    "volume_type": volume['volume_type'],
                    "age_days": age_days,
                    "monthly_cost": monthly_cost,
                    "estimated_savings": monthly_cost,
                    "action": "delete" if age_days > 30 else "review",
                    "risk_level": "low",
                    "reason": f"Volume unattached for {age_days} days"
                })
        
        return recommendations
```

---

## 3. AZURE MCP SERVER

### 3.1 Configuration

```python
# config/azure_mcp_config.py
AZURE_MCP_CONFIG = {
    "authentication": {
        "method": "service_principal",  # or "managed_identity"
        "tenant_id": "{tenant_id}",
        "client_id": "{client_id}",
        "client_secret": "{client_secret}",
        "subscription_id": "{subscription_id}",
    },
    
    "collection": {
        "resource_groups": "all",  # or list of specific RGs
        "locations": "all",  # or list of specific locations
        "resource_types": [
            "virtualMachines",
            "disks",
            "snapshots",
            "networkInterfaces",
            "networkSecurityGroups",
            "natGateways",
            "storageAccounts",
        ],
        "batch_size": 100,
    },
    
    "cost_management": {
        "scope": "subscription",  # or "resource_group", "management_group"
        "timeframe": "MonthToDate",
        "granularity": "Daily",
    }
}
```

### 3.2 Required Azure Permissions

```json
{
  "permissions": [
    {
      "actions": [
        "Microsoft.CostManagement/*/read",
        "Microsoft.Consumption/*/read",
        "Microsoft.Billing/*/read",
        "Microsoft.Compute/*/read",
        "Microsoft.Storage/*/read",
        "Microsoft.Network/*/read",
        "Microsoft.Resources/*/read",
        "Microsoft.Authorization/*/read",
        "Microsoft.Advisor/*/read"
      ],
      "notActions": [],
      "dataActions": [],
      "notDataActions": []
    }
  ],
  "assignableScopes": [
    "/subscriptions/{subscription-id}"
  ]
}
```

### 3.3 Data Collection Implementation

```python
# azure_mcp_server/collectors/cost_collector.py
from azure.identity import DefaultAzureCredential
from azure.mgmt.costmanagement import CostManagementClient

class AzureCostCollector:
    """Collects cost data from Azure Cost Management"""
    
    def __init__(self, subscription_id: str):
        self.subscription_id = subscription_id
        self.credential = DefaultAzureCredential()
        self.client = CostManagementClient(self.credential)
    
    async def collect_cost_data(
        self,
        start_date: str,
        end_date: str
    ) -> Dict:
        """Collect cost data using Azure Cost Management API"""
        scope = f"/subscriptions/{self.subscription_id}"
        
        # Define query
        query_definition = {
            "type": "ActualCost",
            "timeframe": "Custom",
            "timePeriod": {
                "from": f"{start_date}T00:00:00Z",
                "to": f"{end_date}T23:59:59Z"
            },
            "dataset": {
                "granularity": "Daily",
                "aggregation": {
                    "totalCost": {
                        "name": "Cost",
                        "function": "Sum"
                    },
                    "totalCostUSD": {
                        "name": "CostUSD",
                        "function": "Sum"
                    }
                },
                "grouping": [
                    {
                        "type": "Dimension",
                        "name": "ServiceName"
                    },
                    {
                        "type": "Dimension",
                        "name": "ResourceLocation"
                    },
                    {
                        "type": "TagKey",
                        "name": "Environment"
                    }
                ]
            }
        }
        
        try:
            result = self.client.query.usage(scope, query_definition)
            return self._normalize_response(result)
            
        except Exception as e:
            logger.error(f"Azure cost collection failed: {e}")
            raise AzureMCPException(str(e))
    
    def _normalize_response(self, result) -> Dict:
        """Normalize Azure cost response"""
        normalized = {
            "provider": "azure",
            "subscription_id": self.subscription_id,
            "collection_timestamp": datetime.utcnow().isoformat(),
            "data_points": []
        }
        
        for row in result.rows:
            normalized['data_points'].append({
                "time": row[1],  # Time period
                "cost": row[0],  # Cost
                "service": row[2] if len(row) > 2 else None,
                "location": row[3] if len(row) > 3 else None,
                "environment": row[4] if len(row) > 4 else None,
                "currency": result.properties.get('currency', 'USD')
            })
        
        return normalized
```

---

## 4. GCP MCP SERVER

### 4.1 Configuration

```python
# config/gcp_mcp_config.py
GCP_MCP_CONFIG = {
    "authentication": {
        "method": "service_account",
        "project_id": "{project_id}",
        "credentials_path": "/path/to/service-account.json",
    },
    
    "billing": {
        "billing_account_id": "{billing_account_id}",
        "dataset_id": "{bigquery_dataset_id}",
        "table_id": "gcp_billing_export_v1",
    },
    
    "collection": {
        "zones": "all",  # or list of specific zones
        "resource_types": [
            "compute.instances",
            "compute.disks",
            "compute.snapshots",
            "compute.routers",  # For Cloud NAT
            "compute.firewalls",
            "storage.buckets",
        ]
    }
}
```

### 4.2 Required GCP Roles

```yaml
# Required IAM roles for service account
roles:
  - roles/billing.viewer
  - roles/compute.viewer
  - roles/iam.securityReviewer
  - roles/monitoring.viewer
  - roles/recommender.viewer
  - roles/bigquery.dataViewer  # For billing data
```

### 4.3 Billing Data Collection

```python
# gcp_mcp_server/collectors/billing_collector.py
from google.cloud import bigquery
from google.cloud import billing_v1

class GCPBillingCollector:
    """Collects billing data from BigQuery export"""
    
    def __init__(self, project_id: str, dataset_id: str):
        self.project_id = project_id
        self.dataset_id = dataset_id
        self.bq_client = bigquery.Client(project=project_id)
    
    async def collect_billing_data(
        self,
        start_date: str,
        end_date: str
    ) -> Dict:
        """Query billing data from BigQuery"""
        
        query = f"""
        SELECT
            DATE(usage_start_time) as usage_date,
            service.description as service_name,
            sku.description as sku_description,
            location.region as region,
            project.id as project_id,
            project.name as project_name,
            SUM(cost) as total_cost,
            SUM(usage.amount) as usage_amount,
            usage.unit as usage_unit,
            cost_type,
            currency
        FROM
            `{self.project_id}.{self.dataset_id}.gcp_billing_export_v1_*`
        WHERE
            _TABLE_SUFFIX BETWEEN 
                FORMAT_DATE('%Y%m%d', DATE('{start_date}'))
                AND FORMAT_DATE('%Y%m%d', DATE('{end_date}'))
            AND cost > 0
        GROUP BY
            usage_date,
            service_name,
            sku_description,
            region,
            project_id,
            project_name,
            usage_unit,# Multi-Cloud FinOps Platform - MCP Servers Documentation

## Table of Contents
1. [M