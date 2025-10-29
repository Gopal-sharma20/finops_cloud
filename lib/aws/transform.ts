/**
 * Transform AWS API responses to match UI component data structures
 */

import { CostData, AuditReport } from "./types";
import {
  Server,
  Database,
  HardDrive,
  Network,
  Zap,
  Globe,
} from "lucide-react";

/**
 * Transform cost data to service breakdown for charts
 */
export function transformCostToServices(costData: CostData) {
  const services = Object.entries(costData.costByService || {}).map(
    ([name, cost], index) => {
      const colors = [
        "#FF9900", // AWS Orange
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#96CEB4",
        "#FFEAA7",
        "#DDA0DD",
        "#98D8C8",
      ];

      // Map service names to icon components
      const getIcon = (serviceName: string) => {
        if (serviceName.includes("Compute") || serviceName.includes("EC2")) return Server;
        if (serviceName.includes("Storage") || serviceName.includes("S3")) return Database;
        if (serviceName.includes("Database") || serviceName.includes("RDS") || serviceName.includes("DynamoDB")) return Database;
        if (serviceName.includes("Lambda")) return Zap;
        if (serviceName.includes("Network") || serviceName.includes("VPC") || serviceName.includes("Load Balancing")) return Network;
        if (serviceName.includes("CloudFront")) return Globe;
        if (serviceName.includes("Block Store") || serviceName.includes("EBS")) return HardDrive;
        return Server;
      };

      // Simplify service names
      const simpleName = name
        .replace("Amazon ", "")
        .replace("AWS ", "")
        .replace("Elastic Compute Cloud - Compute", "EC2")
        .replace("Simple Storage Service", "S3")
        .replace("Relational Database Service", "RDS")
        .replace("Elastic Block Store", "EBS")
        .replace("Virtual Private Cloud", "VPC");

      return {
        name: simpleName,
        fullName: name,
        count: 0, // Will be updated from audit data if available
        cost: Number(cost),
        utilization: 65, // Default, can be calculated from CloudWatch
        color: colors[index % colors.length],
        icon: getIcon(name),
      };
    }
  );

  return services.sort((a, b) => b.cost - a.cost);
}

/**
 * Transform audit data to recommendations
 */
export function transformAuditToRecommendations(auditData: any) {
  console.log("🔍 Transforming audit data:", JSON.stringify(auditData, null, 2));
  const recommendations = [];

  // Handle MCP server response format
  let parsedData: any = null;

  // Check if this is wrapped in MCP format
  if (auditData && typeof auditData === 'object') {
    // Try to extract from "Audit Report" wrapper
    if (auditData["Audit Report"]) {
      const auditReport = auditData["Audit Report"];
      console.log("📦 Found 'Audit Report' wrapper, keys:", Object.keys(auditReport));

      // Get the first profile's data (key looks like "Profile Name: default")
      const profileKey = Object.keys(auditReport).find(key => key !== "Error processing profiles");
      if (profileKey) {
        console.log("🔑 Using profile key:", profileKey);
        const profileData = auditReport[profileKey];

        // MCP returns array with single object
        if (Array.isArray(profileData) && profileData.length > 0) {
          const rawData = profileData[0];
          console.log("📋 Raw profile data:", rawData);

          // Convert MCP field names to our format
          parsedData = {
            accountId: rawData["AWS Account"],
            stoppedEC2Instances: rawData["Stopped EC2 Instances"] || [],
            unattachedEBSVolumes: rawData["Unattached EBS Volumes"] || [],
            unassociatedEIPs: rawData["Un-associated EIPs"] || [],
            budgetStatus: rawData["Budget Status"] || [],
          };
        }
      }
    }
    // Try direct fields (camelCase format)
    else if (auditData.stoppedEC2Instances || auditData.unattachedEBSVolumes || auditData.unassociatedEIPs) {
      parsedData = auditData as AuditReport;
    }
    // Try nested report/mcp field
    else if (auditData.report || auditData.mcp) {
      const nested = auditData.report || auditData.mcp;
      if (nested["Audit Report"]) {
        const auditReport = nested["Audit Report"];
        const profileKey = Object.keys(auditReport).find(key => key !== "Error processing profiles");
        if (profileKey) {
          const profileData = auditReport[profileKey];
          if (Array.isArray(profileData) && profileData.length > 0) {
            const rawData = profileData[0];
            parsedData = {
              accountId: rawData["AWS Account"],
              stoppedEC2Instances: rawData["Stopped EC2 Instances"] || [],
              unattachedEBSVolumes: rawData["Unattached EBS Volumes"] || [],
              unassociatedEIPs: rawData["Un-associated EIPs"] || [],
              budgetStatus: rawData["Budget Status"] || [],
            };
          }
        }
      }
    }
  }

  if (!parsedData) {
    console.warn("⚠️ Could not parse audit data, returning empty recommendations");
    return [];
  }

  // Handle case where fields might be empty objects {} instead of arrays
  const stoppedInstances = Array.isArray(parsedData.stoppedEC2Instances)
    ? parsedData.stoppedEC2Instances
    : (parsedData.stoppedEC2Instances && Object.keys(parsedData.stoppedEC2Instances).length > 0
      ? Object.values(parsedData.stoppedEC2Instances)
      : []);

  const unattachedVolumes = Array.isArray(parsedData.unattachedEBSVolumes)
    ? parsedData.unattachedEBSVolumes
    : (parsedData.unattachedEBSVolumes && Object.keys(parsedData.unattachedEBSVolumes).length > 0
      ? Object.values(parsedData.unattachedEBSVolumes)
      : []);

  const unassociatedIPs = Array.isArray(parsedData.unassociatedEIPs)
    ? parsedData.unassociatedEIPs
    : (parsedData.unassociatedEIPs && Object.keys(parsedData.unassociatedEIPs).length > 0
      ? Object.values(parsedData.unassociatedEIPs)
      : []);

  console.log("✅ Parsed audit data:", {
    stoppedInstances: stoppedInstances.length,
    unattachedVolumes: unattachedVolumes.length,
    unassociatedIPs: unassociatedIPs.length,
  });

  // Stopped EC2 instances
  if (stoppedInstances.length > 0) {
    console.log(`📊 Processing ${stoppedInstances.length} stopped EC2 instances`);
    for (const instance of stoppedInstances.slice(0, 5)) {
      // Estimate cost savings (EBS storage cost)
      const estimatedSavings = 50; // Rough estimate per stopped instance

      recommendations.push({
        id: `ec2-${instance.instanceId}`,
        title: "Remove or Terminate Stopped EC2 Instance",
        service: "EC2",
        region: instance.region,
        description: `Instance ${instance.instanceType} has been stopped. Consider terminating if no longer needed.`,
        impact: "medium" as const,
        effort: "low" as const,
        currentCost: estimatedSavings,
        projectedCost: 0,
        savings: estimatedSavings,
        confidence: 90,
        resources: [instance.instanceId],
        timeline: "This week",
      });
    }
  }

  // Unattached EBS volumes
  if (unattachedVolumes.length > 0) {
    console.log(`💾 Processing ${unattachedVolumes.length} unattached EBS volumes`);
    for (const volume of unattachedVolumes.slice(0, 5)) {
      // Calculate actual cost based on volume size and type
      const costPerGBMonth = volume.volumeType.includes("gp") ? 0.1 : 0.125;
      const monthlyCost = volume.size * costPerGBMonth;

      recommendations.push({
        id: `ebs-${volume.volumeId}`,
        title: "Delete Unattached EBS Volume",
        service: "EBS",
        region: volume.region,
        description: `${volume.size}GB ${volume.volumeType} volume is unattached and incurring costs.`,
        impact: monthlyCost > 50 ? ("high" as const) : ("medium" as const),
        effort: "low" as const,
        currentCost: Math.round(monthlyCost),
        projectedCost: 0,
        savings: Math.round(monthlyCost),
        confidence: 95,
        resources: [volume.volumeId],
        timeline: "Immediate",
      });
    }
  }

  // Unassociated Elastic IPs
  if (unassociatedIPs.length > 0) {
    console.log(`🌐 Processing ${unassociatedIPs.length} unassociated Elastic IPs`);
    for (const eip of unassociatedIPs.slice(0, 5)) {
      // EIP costs $0.005/hour when not associated = ~$3.65/month
      const monthlyCost = 3.65;

      recommendations.push({
        id: `eip-${eip.allocationId}`,
        title: "Release Unassociated Elastic IP",
        service: "VPC",
        region: eip.region,
        description: `Elastic IP ${eip.publicIp} is not associated with any instance.`,
        impact: "low" as const,
        effort: "low" as const,
        currentCost: monthlyCost,
        projectedCost: 0,
        savings: monthlyCost,
        confidence: 99,
        resources: [eip.publicIp],
        timeline: "Immediate",
      });
    }
  }

  console.log(`✨ Generated ${recommendations.length} total recommendations`);

  // If no issues found, add proactive best practice recommendations
  if (recommendations.length === 0) {
    console.log("💡 No issues found, adding proactive best practice recommendations");

    recommendations.push(
      {
        id: "best-practice-1",
        title: "Consider Reserved Instances for Steady Workloads",
        service: "EC2",
        region: "All Regions",
        description: "Analyze your EC2 usage patterns. If you have instances running 24/7, Reserved Instances can save up to 72% compared to On-Demand pricing.",
        impact: "high" as const,
        effort: "low" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 85,
        resources: [],
        timeline: "This month",
      },
      {
        id: "best-practice-2",
        title: "Enable AWS Cost Anomaly Detection",
        service: "Cost Management",
        region: "Global",
        description: "Set up AWS Cost Anomaly Detection to automatically identify unusual spending patterns and receive alerts before costs escalate.",
        impact: "medium" as const,
        effort: "low" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 90,
        resources: [],
        timeline: "This week",
      },
      {
        id: "best-practice-3",
        title: "Review and Tag Untagged Resources",
        service: "All Services",
        region: "All Regions",
        description: "Implement a comprehensive tagging strategy to track costs by team, project, or environment. This enables better cost allocation and accountability.",
        impact: "medium" as const,
        effort: "medium" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 80,
        resources: [],
        timeline: "Next week",
      },
      {
        id: "best-practice-4",
        title: "Implement S3 Lifecycle Policies",
        service: "S3",
        region: "All Regions",
        description: "Automatically transition infrequently accessed objects to cheaper storage classes (S3-IA, Glacier) to reduce storage costs by up to 90%.",
        impact: "high" as const,
        effort: "low" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 88,
        resources: [],
        timeline: "This week",
      },
      {
        id: "best-practice-5",
        title: "Enable AWS Compute Optimizer",
        service: "Cost Optimization",
        region: "Global",
        description: "Use AWS Compute Optimizer to get machine learning-powered recommendations for optimal EC2 instance types, EBS volumes, and Lambda functions.",
        impact: "medium" as const,
        effort: "low" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 92,
        resources: [],
        timeline: "Immediate",
      },
      {
        id: "best-practice-6",
        title: "Review CloudWatch Logs Retention",
        service: "CloudWatch",
        region: "All Regions",
        description: "Audit your CloudWatch Logs retention policies. Reduce retention periods for non-critical logs or export to S3 for long-term storage at lower cost.",
        impact: "low" as const,
        effort: "low" as const,
        currentCost: 0,
        projectedCost: 0,
        savings: 0,
        confidence: 85,
        resources: [],
        timeline: "Next week",
      }
    );

    console.log(`✅ Added ${recommendations.length} proactive recommendations`);
  }

  return recommendations;
}

/**
 * Generate cost trends from historical data
 */
export function generateCostTrends(currentCost: number) {
  const today = new Date();
  const trends = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);

    const variance = Math.random() * 0.1 - 0.05; // ±5% variation
    const cost = Math.round(currentCost * (1 + variance));
    const forecast = Math.round(cost * 1.03);
    const optimized = Math.round(cost * 0.85);

    trends.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cost,
      forecast,
      optimized,
    });
  }

  return trends;
}

/**
 * Generate utilization data
 */
export function generateUtilizationData() {
  const times = ["00:00", "03:00", "06:00", "09:00", "12:00", "15:00", "18:00", "21:00"];

  return times.map((time) => {
    const hour = parseInt(time.split(":")[0]);
    const isBusinessHours = hour >= 9 && hour <= 17;

    return {
      time,
      cpu: isBusinessHours ? 70 + Math.random() * 20 : 20 + Math.random() * 20,
      memory: isBusinessHours ? 65 + Math.random() * 20 : 25 + Math.random() * 20,
      network: isBusinessHours ? 60 + Math.random() * 20 : 15 + Math.random() * 20,
      storage: 45 + Math.random() * 20,
    };
  });
}

/**
 * Group cost data by region - using real AWS Cost Explorer data
 */
export function transformRegionalCosts(costByRegion: Record<string, number>, services: any[]) {
  // Comprehensive region metadata mapping - ALL AWS regions
  const regionMetadata: Record<string, { name: string; timezone: string }> = {
    // US Regions
    "us-east-1": { name: "US East (N. Virginia)", timezone: "UTC-5" },
    "us-east-2": { name: "US East (Ohio)", timezone: "UTC-5" },
    "us-west-1": { name: "US West (N. California)", timezone: "UTC-8" },
    "us-west-2": { name: "US West (Oregon)", timezone: "UTC-8" },

    // Europe Regions
    "eu-west-1": { name: "Europe (Ireland)", timezone: "UTC+0" },
    "eu-west-2": { name: "Europe (London)", timezone: "UTC+0" },
    "eu-west-3": { name: "Europe (Paris)", timezone: "UTC+1" },
    "eu-central-1": { name: "Europe (Frankfurt)", timezone: "UTC+1" },
    "eu-central-2": { name: "Europe (Zurich)", timezone: "UTC+1" },
    "eu-north-1": { name: "Europe (Stockholm)", timezone: "UTC+1" },
    "eu-south-1": { name: "Europe (Milan)", timezone: "UTC+1" },
    "eu-south-2": { name: "Europe (Spain)", timezone: "UTC+1" },

    // Asia Pacific Regions
    "ap-south-1": { name: "Asia Pacific (Mumbai)", timezone: "UTC+5:30" },
    "ap-south-2": { name: "Asia Pacific (Hyderabad)", timezone: "UTC+5:30" },
    "ap-southeast-1": { name: "Asia Pacific (Singapore)", timezone: "UTC+8" },
    "ap-southeast-2": { name: "Asia Pacific (Sydney)", timezone: "UTC+10" },
    "ap-southeast-3": { name: "Asia Pacific (Jakarta)", timezone: "UTC+7" },
    "ap-southeast-4": { name: "Asia Pacific (Melbourne)", timezone: "UTC+10" },
    "ap-northeast-1": { name: "Asia Pacific (Tokyo)", timezone: "UTC+9" },
    "ap-northeast-2": { name: "Asia Pacific (Seoul)", timezone: "UTC+9" },
    "ap-northeast-3": { name: "Asia Pacific (Osaka)", timezone: "UTC+9" },
    "ap-east-1": { name: "Asia Pacific (Hong Kong)", timezone: "UTC+8" },

    // Canada Region
    "ca-central-1": { name: "Canada (Central)", timezone: "UTC-5" },
    "ca-west-1": { name: "Canada (Calgary)", timezone: "UTC-7" },

    // South America Regions
    "sa-east-1": { name: "South America (São Paulo)", timezone: "UTC-3" },

    // Middle East Regions
    "me-south-1": { name: "Middle East (Bahrain)", timezone: "UTC+3" },
    "me-central-1": { name: "Middle East (UAE)", timezone: "UTC+4" },

    // Africa Regions
    "af-south-1": { name: "Africa (Cape Town)", timezone: "UTC+2" },

    // Israel Region
    "il-central-1": { name: "Israel (Tel Aviv)", timezone: "UTC+2" },

    // Asia Pacific Additional
    "ap-southeast-5": { name: "Asia Pacific (Malaysia)", timezone: "UTC+8" },

    // Global/Special
    "global": { name: "Global (CloudFront, Route53, etc.)", timezone: "UTC+0" },
  };

  const regions = Object.entries(costByRegion)
    .filter(([_, cost]) => cost > 0) // Show all regions with any cost
    .map(([regionId, cost]) => {
      const metadata = regionMetadata[regionId] || {
        name: regionId,
        timezone: "UTC+0"
      };

      // Estimate resources based on cost proportion
      const totalCost = Object.values(costByRegion).reduce((a, b) => a + b, 0);
      const costProportion = totalCost > 0 ? cost / totalCost : 0;
      const resources = Math.round(services.length * costProportion * 10);

      return {
        id: regionId,
        name: metadata.name,
        timezone: metadata.timezone,
        resources: Math.max(resources, 1), // At least 1 resource
        cost: Math.round(cost * 100) / 100,
      };
    })
    .sort((a, b) => b.cost - a.cost); // Sort by cost descending

  return regions;
}

/**
 * Legacy function for backwards compatibility - now uses estimates
 */
export function estimateRegionalCosts(totalCost: number, services: any[]) {
  // Fallback: Distribute costs across common regions as estimates
  const regions = [
    { id: "us-east-1", name: "US East (N. Virginia)", timezone: "UTC-5" },
    { id: "us-west-2", name: "US West (Oregon)", timezone: "UTC-8" },
    { id: "eu-west-1", name: "Europe (Ireland)", timezone: "UTC+0" },
    { id: "ap-southeast-1", name: "Asia Pacific (Singapore)", timezone: "UTC+8" },
    { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)", timezone: "UTC+9" },
    { id: "ca-central-1", name: "Canada (Central)", timezone: "UTC-5" },
    { id: "eu-central-1", name: "Europe (Frankfurt)", timezone: "UTC+1" },
    { id: "ap-south-1", name: "Asia Pacific (Mumbai)", timezone: "UTC+5:30" },
  ];

  const distribution = [0.4, 0.25, 0.2, 0.1, 0.05, 0.03, 0.03, 0.02];

  return regions.map((region, index) => {
    const cost = Math.round(totalCost * distribution[index] * 100) / 100;
    const resources = Math.round(services.length * distribution[index] * 10);

    return {
      ...region,
      resources: Math.max(resources, 1),
      cost,
    };
  });
}
