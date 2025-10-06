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
            usage_unit,
            cost_type,
            currency
        ORDER BY
            usage_date DESC,
            total_cost DESC
        """
        
        try:
            query_job = self.bq_client.query(query)
            results = query_job.result()
            
            return self._normalize_billing_results(results)
            
        except Exception as e:
            logger.error(f"GCP billing query failed: {e}")
            raise GCPMCPException(str(e))
    
    def _normalize_billing_results(self, results) -> Dict:
        """Normalize BigQuery results"""
        normalized = {
            "provider": "gcp",
            "project_id": self.project_id,
            "collection_timestamp": datetime.utcnow().isoformat(),
            "data_points": []
        }
        
        for row in results:
            normalized['data_points'].append({
                "date": row.usage_date.isoformat(),
                "service": row.service_name,
                "sku": row.sku_description,
                "region": row.region,
                "project_id": row.project_id,
                "project_name": row.project_name,
                "cost": float(row.total_cost),
                "usage_amount": float(row.usage_amount) if row.usage_amount else 0,
                "usage_unit": row.usage_unit,
                "cost_type": row.cost_type,
                "currency": row.currency
            })
        
        return normalized
```

---

## 5. UNIFIED ORCHESTRATOR

### 5.1 Orchestrator Implementation

```python
# mcp_orchestrator.py
import asyncio
from typing import Dict, List
from dataclasses import dataclass
from enum import Enum

class CloudProvider(Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"

@dataclass
class CollectionResult:
    provider: CloudProvider
    status: str  # success, partial, failed
    data: Dict
    errors: List[str]
    collection_duration: float
    timestamp: str

class UnifiedMCPOrchestrator:
    """
    Orchestrates data collection from all cloud providers
    Handles parallel execution, error recovery, and data aggregation
    """
    
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
        self.cloud_accounts = self._load_cloud_accounts()
        self.mcp_servers = self._initialize_mcp_servers()
    
    def _load_cloud_accounts(self) -> Dict[CloudProvider, List[Dict]]:
        """Load connected cloud accounts for organization"""
        from models import CloudAccount
        
        accounts = CloudAccount.get_by_organization(self.organization_id)
        
        grouped = {
            CloudProvider.AWS: [],
            CloudProvider.AZURE: [],
            CloudProvider.GCP: []
        }
        
        for account in accounts:
            if account.status == 'active':
                provider = CloudProvider(account.provider)
                grouped[provider].append(account)
        
        return grouped
    
    def _initialize_mcp_servers(self) -> Dict[CloudProvider, object]:
        """Initialize MCP server instances for each provider"""
        from mcp_servers.aws_mcp_server import AWSFinOpsMCPServer
        from mcp_servers.azure_mcp_server import AzureFinOpsMCPServer
        from mcp_servers.gcp_mcp_server import GCPFinOpsMCPServer
        
        return {
            CloudProvider.AWS: AWSFinOpsMCPServer,
            CloudProvider.AZURE: AzureFinOpsMCPServer,
            CloudProvider.GCP: GCPFinOpsMCPServer
        }
    
    async def collect_all_data(self) -> List[CollectionResult]:
        """
        Collect data from all connected cloud providers in parallel
        """
        logger.info(f"Starting data collection for org {self.organization_id}")
        
        tasks = []
        
        # Create collection tasks for each provider
        for provider, accounts in self.cloud_accounts.items():
            for account in accounts:
                task = self._collect_provider_data(provider, account)
                tasks.append(task)
        
        # Execute all tasks in parallel with timeout
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        collection_results = []
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Collection failed: {result}")
                collection_results.append(CollectionResult(
                    provider=None,
                    status="failed",
                    data={},
                    errors=[str(result)],
                    collection_duration=0,
                    timestamp=datetime.utcnow().isoformat()
                ))
            else:
                collection_results.append(result)
        
        # Store collected data
        await self._store_collected_data(collection_results)
        
        # Trigger downstream processing
        await self._trigger_processing(collection_results)
        
        return collection_results
    
    async def _collect_provider_data(
        self,
        provider: CloudProvider,
        account: Dict
    ) -> CollectionResult:
        """Collect data from a specific provider account"""
        start_time = time.time()
        errors = []
        
        try:
            # Initialize MCP server
            mcp_class = self.mcp_servers[provider]
            mcp_server = mcp_class(
                account_id=account.id,
                credentials=account.get_decrypted_credentials()
            )
            
            # Collect data with timeout
            data = await asyncio.wait_for(
                mcp_server.collect_all_finops_data(),
                timeout=600  # 10 minutes
            )
            
            duration = time.time() - start_time
            
            return CollectionResult(
                provider=provider,
                status="success",
                data=data,
                errors=[],
                collection_duration=duration,
                timestamp=datetime.utcnow().isoformat()
            )
            
        except asyncio.TimeoutError:
            logger.error(f"Collection timeout for {provider} account {account.id}")
            errors.append("Collection timeout after 10 minutes")
            
        except Exception as e:
            logger.error(f"Collection failed for {provider}: {e}")
            errors.append(str(e))
        
        duration = time.time() - start_time
        
        return CollectionResult(
            provider=provider,
            status="failed",
            data={},
            errors=errors,
            collection_duration=duration,
            timestamp=datetime.utcnow().isoformat()
        )
    
    async def _store_collected_data(self, results: List[CollectionResult]):
        """Store collected data in databases"""
        for result in results:
            if result.status != "success":
                continue
            
            try:
                # Store cost data in TimescaleDB
                await self._store_cost_data(result.provider, result.data.get('costs', {}))
                
                # Store resources in MongoDB
                await self._store_resource_data(result.provider, result.data.get('resources', {}))
                
                # Update cache
                await self._update_cache(result.provider, result.data)
                
            except Exception as e:
                logger.error(f"Failed to store data for {result.provider}: {e}")
    
    async def _trigger_processing(self, results: List[CollectionResult]):
        """Trigger downstream processing tasks"""
        from tasks import (
            generate_recommendations,
            detect_anomalies,
            update_budgets,
            refresh_dashboards
        )
        
        # Trigger async processing tasks
        generate_recommendations.delay(self.organization_id)
        detect_anomalies.delay(self.organization_id)
        update_budgets.delay(self.organization_id)
        refresh_dashboards.delay(self.organization_id)
    
    def get_collection_summary(self, results: List[CollectionResult]) -> Dict:
        """Generate summary of collection results"""
        summary = {
            "organization_id": self.organization_id,
            "total_accounts": len(results),
            "successful": sum(1 for r in results if r.status == "success"),
            "failed": sum(1 for r in results if r.status == "failed"),
            "total_duration": sum(r.collection_duration for r in results),
            "by_provider": {}
        }
        
        for provider in CloudProvider:
            provider_results = [r for r in results if r.provider == provider]
            if provider_results:
                summary["by_provider"][provider.value] = {
                    "total": len(provider_results),
                    "successful": sum(1 for r in provider_results if r.status == "success"),
                    "failed": sum(1 for r in provider_results if r.status == "failed"),
                    "avg_duration": sum(r.collection_duration for r in provider_results) / len(provider_results)
                }
        
        return summary
```

### 5.2 Incremental Collection Strategy

```python
# mcp_orchestrator/incremental_collector.py
class IncrementalCollector:
    """
    Implements incremental data collection to reduce API calls
    Only collects changed data since last sync
    """
    
    def __init__(self, organization_id: str):
        self.organization_id = organization_id
        self.state_store = StateStore()
    
    async def collect_incremental(
        self,
        provider: CloudProvider,
        account_id: str
    ) -> Dict:
        """Collect only changed data since last sync"""
        
        # Get last sync state
        last_sync = self.state_store.get_last_sync(account_id)
        
        if not last_sync:
            # First sync - collect everything
            return await self._full_collection(provider, account_id)
        
        # Incremental collection
        changes = {
            "new_resources": [],
            "modified_resources": [],
            "deleted_resources": [],
            "cost_updates": []
        }
        
        # Detect new/modified resources
        current_resources = await self._list_current_resources(provider, account_id)
        last_resources = last_sync.get('resources', {})
        
        for resource_id, resource in current_resources.items():
            if resource_id not in last_resources:
                changes["new_resources"].append(resource)
            elif resource['last_modified'] > last_sync['timestamp']:
                changes["modified_resources"].append(resource)
        
        # Detect deleted resources
        for resource_id in last_resources:
            if resource_id not in current_resources:
                changes["deleted_resources"].append(resource_id)
        
        # Collect cost data since last sync
        cost_updates = await self._get_cost_updates(
            provider,
            account_id,
            since=last_sync['timestamp']
        )
        changes["cost_updates"] = cost_updates
        
        # Update sync state
        self.state_store.update_last_sync(account_id, {
            'timestamp': datetime.utcnow().isoformat(),
            'resources': current_resources
        })
        
        return changes
```

---

## 6. DATA MODELS

### 6.1 Unified Data Schema

```python
# models/unified_schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class CloudProvider(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"

class ResourceState(str, Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    TERMINATED = "terminated"
    DEALLOCATED = "deallocated"

class CostDataPoint(BaseModel):
    """Unified cost data point across all providers"""
    timestamp: datetime
    provider: CloudProvider
    account_id: str
    service: str
    region: Optional[str]
    resource_id: Optional[str]
    cost: float
    currency: str = "USD"
    usage_amount: Optional[float]
    usage_unit: Optional[str]
    tags: Dict[str, str] = {}

class ComputeResource(BaseModel):
    """Unified compute resource model"""
    resource_id: str
    provider: CloudProvider
    account_id: str
    name: Optional[str]
    resource_type: str  # ec2_instance, virtual_machine, compute_instance
    state: ResourceState
    instance_type: str  # t3.large, Standard_D2s_v3, n1-standard-2
    region: str
    availability_zone: Optional[str]
    launch_time: datetime
    platform: str  # linux, windows
    vcpus: int
    memory_gb: float
    
    # Networking
    vpc_id: Optional[str]
    subnet_id: Optional[str]
    private_ip: Optional[str]
    public_ip: Optional[str]
    
    # Cost
    monthly_cost: float
    hourly_rate: float
    
    # Metrics
    metrics: Optional[Dict] = None
    
    # Optimization
    optimization_score: int = Field(ge=0, le=100)
    optimization_flags: List[str] = []
    
    # Metadata
    tags: Dict[str, str] = {}
    last_seen: datetime
    last_updated: datetime

class StorageResource(BaseModel):
    """Unified storage resource model"""
    resource_id: str
    provider: CloudProvider
    account_id: str
    name: Optional[str]
    resource_type: str  # ebs_volume, managed_disk, persistent_disk
    storage_type: str  # gp3, Premium_LRS, pd-standard
    size_gb: int
    iops: Optional[int]
    throughput_mbps: Optional[int]
    encrypted: bool
    
    # Attachment
    attached_to: Optional[str]  # Instance ID
    is_attached: bool
    attachment_time: Optional[datetime]
    
    # Cost
    monthly_cost: float
    
    # Optimization
    age_days: int
    last_accessed: Optional[datetime]
    optimization_flags: List[str] = []
    
    # Metadata
    region: str
    availability_zone: Optional[str]
    tags: Dict[str, str] = {}
    create_time: datetime
    last_updated: datetime

class NetworkResource(BaseModel):
    """Unified network resource model"""
    resource_id: str
    provider: CloudProvider
    account_id: str
    name: Optional[str]
    resource_type: str  # nat_gateway, load_balancer, vpn_gateway
    region: str
    
    # Configuration
    configuration: Dict
    
    # Cost
    monthly_cost: float
    data_processed_gb: float
    
    # Metrics
    metrics: Optional[Dict] = None
    
    # Optimization
    optimization_flags: List[str] = []
    
    # Metadata
    tags: Dict[str, str] = {}
    create_time: datetime
    last_updated: datetime

class OptimizationRecommendation(BaseModel):
    """Unified optimization recommendation"""
    id: str
    provider: CloudProvider
    account_id: str
    
    # Classification
    category: str  # compute, storage, network, database
    type: str  # right_sizing, idle_resource, reserved_instance
    
    # Details
    title: str
    description: str
    affected_resources: List[str]
    
    # Impact
    estimated_savings_monthly: float
    estimated_savings_annual: float
    risk_level: str  # low, medium, high
    confidence: float = Field(ge=0, le=1)
    
    # Actions
    actions: List[Dict]
    
    # Analysis
    reason: str
    supporting_metrics: Dict
    
    # Metadata
    created_at: datetime
    expires_at: Optional[datetime]
    status: str = "active"
```

### 6.2 Data Transformation Layer

```python
# transformers/resource_transformer.py
class ResourceTransformer:
    """Transforms provider-specific resources to unified format"""
    
    @staticmethod
    def transform_compute_resource(
        provider: CloudProvider,
        raw_resource: Dict
    ) -> ComputeResource:
        """Transform compute resource to unified format"""
        
        if provider == CloudProvider.AWS:
            return ResourceTransformer._transform_aws_ec2(raw_resource)
        elif provider == CloudProvider.AZURE:
            return ResourceTransformer._transform_azure_vm(raw_resource)
        elif provider == CloudProvider.GCP:
            return ResourceTransformer._transform_gcp_instance(raw_resource)
    
    @staticmethod
    def _transform_aws_ec2(ec2_instance: Dict) -> ComputeResource:
        """Transform AWS EC2 instance to unified format"""
        return ComputeResource(
            resource_id=ec2_instance['instance_id'],
            provider=CloudProvider.AWS,
            account_id=ec2_instance['account_id'],
            name=ec2_instance.get('name'),
            resource_type="ec2_instance",
            state=ResourceState(ec2_instance['state']),
            instance_type=ec2_instance['instance_type'],
            region=ec2_instance['region'],
            availability_zone=ec2_instance['availability_zone'],
            launch_time=datetime.fromisoformat(ec2_instance['launch_time']),
            platform=ec2_instance.get('platform', 'linux'),
            vcpus=ResourceTransformer._get_instance_specs(
                'aws',
                ec2_instance['instance_type']
            )['vcpus'],
            memory_gb=ResourceTransformer._get_instance_specs(
                'aws',
                ec2_instance['instance_type']
            )['memory_gb'],
            vpc_id=ec2_instance.get('vpc_id'),
            subnet_id=ec2_instance.get('subnet_id'),
            private_ip=ec2_instance.get('private_ip'),
            public_ip=ec2_instance.get('public_ip'),
            monthly_cost=ec2_instance.get('monthly_cost', 0),
            hourly_rate=ec2_instance.get('hourly_rate', 0),
            metrics=ec2_instance.get('metrics'),
            optimization_score=ec2_instance.get('optimization_score', 0),
            optimization_flags=ec2_instance.get('optimization_flags', []),
            tags=ec2_instance.get('tags', {}),
            last_seen=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )
    
    @staticmethod
    def _transform_azure_vm(vm: Dict) -> ComputeResource:
        """Transform Azure VM to unified format"""
        return ComputeResource(
            resource_id=vm['vm_id'],
            provider=CloudProvider.AZURE,
            account_id=vm['subscription_id'],
            name=vm['vm_name'],
            resource_type="virtual_machine",
            state=ResourceState(vm['power_state']),
            instance_type=vm['vm_size'],
            region=vm['location'],
            availability_zone=vm.get('zones', [None])[0],
            launch_time=datetime.fromisoformat(vm['provision_time']),
            platform=vm['os_type'].lower(),
            vcpus=ResourceTransformer._get_instance_specs(
                'azure',
                vm['vm_size']
            )['vcpus'],
            memory_gb=ResourceTransformer._get_instance_specs(
                'azure',
                vm['vm_size']
            )['memory_gb'],
            monthly_cost=vm.get('monthly_cost', 0),
            hourly_rate=vm.get('hourly_rate', 0),
            metrics=vm.get('metrics'),
            optimization_score=vm.get('optimization_score', 0),
            optimization_flags=vm.get('optimization_flags', []),
            tags=vm.get('tags', {}),
            last_seen=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )
```

---

## 7. ERROR HANDLING

### 7.1 Exception Hierarchy

```python
# exceptions.py
class MCPException(Exception):
    """Base exception for MCP servers"""
    pass

class AuthenticationException(MCPException):
    """Authentication/Authorization failures"""
    pass

class RateLimitException(MCPException):
    """API rate limit exceeded"""
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds")

class DataValidationException(MCPException):
    """Data validation failures"""
    pass

class ProviderAPIException(MCPException):
    """Cloud provider API errors"""
    def __init__(self, provider: str, error_code: str, message: str):
        self.provider = provider
        self.error_code = error_code
        super().__init__(f"{provider} API error [{error_code}]: {message}")

class AWSMCPException(ProviderAPIException):
    def __init__(self, error_code: str, message: str):
        super().__init__("AWS", error_code, message)

class AzureMCPException(ProviderAPIException):
    def __init__(self, error_code: str, message: str):
        super().__init__("Azure", error_code, message)

class GCPMCPException(ProviderAPIException):
    def __init__(self, error_code: str, message: str):
        super().__init__("GCP", error_code, message)
```

### 7.2 Retry Strategy

```python
# retry.py
import asyncio
from functools import wraps
from typing import Callable

def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Decorator for exponential backoff retry"""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            delay = base_delay
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                    
                except RateLimitException as e:
                    # Use provider-specified retry time
                    delay = e.retry_after
                    last_exception = e
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        break
                    
                    logger.warning(
                        f"Attempt {attempt + 1}/{max_retries + 1} failed: {e}. "
                        f"Retrying in {delay}s..."
                    )
                    
                    await asyncio.sleep(delay)
                    
                    # Exponential backoff
                    delay = min(delay * exponential_base, max_delay)
            
            # All retries exhausted
            logger.error(f"All {max_retries + 1} attempts failed")
            raise last_exception
        
        return wrapper
    return decorator

# Usage
@retry_with_backoff(max_retries=3, base_delay=2.0)
async def collect_aws_costs(account_id: str):
    # This will retry up to 3 times with exponential backoff
    return await aws_client.get_cost_data(account_id)
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Parallel Collection

```python
# performance/parallel_collector.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

class ParallelCollector:
    """Optimizes data collection with parallel execution"""
    
    def __init__(self, max_workers: int = 10):
        self.max_workers = max_workers
        self.semaphore = asyncio.Semaphore(max_workers)
    
    async def collect_regions_parallel(
        self,
        collector: Callable,
        regions: List[str]
    ) -> Dict[str, Dict]:
        """Collect data from multiple regions in parallel"""
        
        async def collect_with_semaphore(region: str):
            async with self.semaphore:
                return region, await collector(region)
        
        tasks = [collect_with_semaphore(region) for region in regions]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        region_data = {}
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Region collection failed: {result}")
                continue
            
            region, data = result
            region_data[region] = data
        
        return region_data
```

### 8.2 Batch Processing

```python
# performance/batch_processor.py
class BatchProcessor:
    """Process resources in batches to optimize API calls"""
    
    def __init__(self, batch_size: int = 100):
        self.batch_size = batch_size
    
    async def process_in_batches(
        self,
        items: List,
        processor: Callable
    ) -> List:
        """Process items in batches"""
        results = []
        
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            
            batch_results = await processor(batch)
            results.extend(batch_results)
            
            # Small delay between batches to avoid rate limiting
            await asyncio.sleep(0.1)
        
        return results
```

---

## 9. TESTING STRATEGY

### 9.1 Unit Tests

```python
# tests/test_aws_mcp_server.py
import pytest
from unittest.mock import Mock, patch
from mcp_servers.aws_mcp_server import AWSFinOpsMCPServer

@pytest.fixture
def mock_boto3_session():
    with patch('boto3.Session') as mock:
        yield mock

@pytest.fixture
def aws_mcp_server(mock_boto3_session):
    return AWSFinOpsMCPServer(account_id="test-account")

class TestAWSCostCollector:
    
    def test_collect_cost_data_success(self, aws_mcp_server):
        """Test successful cost data collection"""
        # Mock CE client response
        mock_response = {
            'ResultsByTime': [
                {
                    'TimePeriod': {'Start': '2025-01-01', 'End': '2025-01-02'},
                    'Groups': [{
                        'Keys': ['EC2', 'us-east-1'],
                        'Metrics': {
                            'UnblendedCost': {'Amount': '123.45', 'Unit': 'USD'}
                        }
                    }]
                }
            ]
        }
        
        aws_mcp_server.ce_client.get_cost_and_usage = Mock(return_value=mock_response)
        
        # Execute
        result = aws_mcp_server.collect_cost_data('2025-01-01', '2025-01-02')
        
        # Assert
        assert result['provider'] == 'aws'
        assert len(result['data_points']) > 0
        assert result['data_points'][0]['cost'] == 123.45
    
    def test_collect_cost_data_api_error(self, aws_mcp_server):
        """Test API error handling"""
        aws_mcp_server.ce_client.get_cost_and_usage = Mock(
            side_effect=Exception("API Error")
        )
        
        with pytest.raises(AWSMCPException):
            aws_mcp_server.collect_cost_data('2025-01-01', '2025-01-02')
```

### 9.2 Integration Tests

```python
# tests/integration/test_mcp_orchestrator.py
import pytest
from mcp_orchestrator import UnifiedMCPOrchestrator

@pytest.mark.integration
class TestMCPOrchestrator:
    
    @pytest.mark.asyncio
    async def test_collect_all_providers(self, test_organization):
        """Test data collection from all providers"""
        orchestrator = UnifiedMCPOrchestrator(test_organization.id)
        
        results = await orchestrator.collect_all_data()
        
        # Verify results
        assert len(results) > 0
        assert any(r.provider == CloudProvider.AWS for r in results)
        assert all(r.status in ['success', 'partial', 'failed'] for r in results)
```

---

## 10. DEPLOYMENT

### 10.1 Docker Configuration

```dockerfile
# Dockerfile.mcp-workers
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP servers
COPY mcp_servers/ ./mcp_servers/
COPY mcp_orchestrator.py .
COPY config/ ./config/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Run as non-root user
RUN useradd -m mcpworker
USER mcpworker

CMD ["celery", "-A", "celery_app", "worker", "--loglevel=info", "--concurrency=4", "-Q", "collection"]
```

### 10.2 Kubernetes Deployment

```yaml
# k8s/mcp-workers-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-collection-workers
  labels:
    app: mcp-workers
    type: collection
spec:
  replicas: 5
  selector:
    matchLabels:
      app: mcp-workers
      type: collection
  template:
    metadata:
      labels:
        app: mcp-workers
        type: collection
    spec:
      containers:
      - name: mcp-worker
        image: cloudoptima/mcp-workers:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        env:
        - name: CELERY_BROKER_URL
          valueFrom:
            secretKeyRef:
              name: celery-secrets
              key: broker-url
        - name: AWS_ROLE_ARN
          valueFrom:
            secretKeyRef:
              name: cloud-credentials
              key: aws-role-arn
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: encryption-keys
              key: master-key
```

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: MCP Team  
**Next Review**: Quarterly

---

## Summary

This comprehensive documentation provides everything needed to build world-class MCP servers for the Multi-Cloud FinOps platform. Key highlights:

1. **Three specialized MCP servers** for AWS, Azure, and GCP
2. **Unified orchestrator** for parallel data collection
3. **Standardized data models** for cross-cloud consistency
4. **Robust error handling** and retry mechanisms
5. **Performance optimizations** for large-scale deployments
6. **Comprehensive testing** strategy
7. **Production-ready** deployment configurations

The MCP servers are designed to be:
- **Scalable**: Handle hundreds of cloud accounts
- **Reliable**: Automatic retries and error recovery
- **Efficient**: Incremental updates and caching
- **Maintainable**: Clear separation of concerns
- **Observable**: Comprehensive logging and metrics# Multi-Cloud FinOps Platform - MCP Servers Documentation

## Table of Contents
1. [M