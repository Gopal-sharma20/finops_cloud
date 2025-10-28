// app/api/efficiency/route.ts
import { NextRequest, NextResponse } from "next/server";

const AZURE_REST_URL = process.env.AZURE_MCP_SERVER_URL || "http://localhost:8000";
const AWS_REST_URL = process.env.MCP_SERVER_URL || "http://localhost:3001";
const GCP_REST_URL = process.env.GCP_MCP_SERVER_URL || "http://localhost:3002";

async function callAPI(url: string, endpoint: string, args: Record<string, any>) {
  const res = await fetch(`${url}${endpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    throw new Error(`API call failed: ${res.status}`);
  }

  return res.json();
}

interface EfficiencyMetrics {
  overallScore: number; // 0-100
  resourceUtilization: number; // 0-100
  wasteRatio: number; // 0-100
  costPerResource: number;
  totalResources: number;
  unusedResources: number;
  breakdown: {
    aws: {
      score: number;
      unusedInstances: number;
      totalInstances: number;
      unusedVolumes: number;
      totalVolumes: number;
    };
    azure: {
      score: number;
      unusedVMs: number;
      totalVMs: number;
      unusedDisks: number;
      totalDisks: number;
    };
    gcp: {
      score: number;
      terminatedInstances: number;
      totalInstances: number;
      unattachedDisks: number;
      totalDisks: number;
    };
  };
}

/**
 * GET /api/efficiency
 * Calculates resource efficiency metrics across all cloud providers
 */
export async function GET(request: NextRequest) {
  try {
    const metrics: EfficiencyMetrics = {
      overallScore: 0,
      resourceUtilization: 0,
      wasteRatio: 0,
      costPerResource: 0,
      totalResources: 0,
      unusedResources: 0,
      breakdown: {
        aws: { score: 0, unusedInstances: 0, totalInstances: 0, unusedVolumes: 0, totalVolumes: 0 },
        azure: { score: 0, unusedVMs: 0, totalVMs: 0, unusedDisks: 0, totalDisks: 0 },
        gcp: { score: 0, terminatedInstances: 0, totalInstances: 0, unattachedDisks: 0, totalDisks: 0 },
      },
    };

    // Fetch AWS audit data
    try {
      const awsAudit = await callAPI(AWS_REST_URL, "/api/audit", {
        all_profiles: true,
      });

      if (awsAudit?.audit_results) {
        Object.values(awsAudit.audit_results).forEach((result: any) => {
          if (result.instances) {
            metrics.breakdown.aws.totalInstances += result.instances.length;
            const stopped = result.instances.filter(
              (i: any) => i.State?.Name === "stopped"
            ).length;
            metrics.breakdown.aws.unusedInstances += stopped;
          }
          if (result.unattached_volumes) {
            metrics.breakdown.aws.totalVolumes += result.unattached_volumes.length;
            metrics.breakdown.aws.unusedVolumes += result.unattached_volumes.length;
          }
        });

        // Calculate AWS efficiency score
        const awsTotal =
          metrics.breakdown.aws.totalInstances + metrics.breakdown.aws.totalVolumes;
        const awsUnused =
          metrics.breakdown.aws.unusedInstances + metrics.breakdown.aws.unusedVolumes;
        metrics.breakdown.aws.score =
          awsTotal > 0 ? Math.round(((awsTotal - awsUnused) / awsTotal) * 100) : 100;
      }
    } catch (err) {
      console.error("AWS audit fetch failed:", err);
      metrics.breakdown.aws.score = 0;
    }

    // Fetch Azure audit data
    try {
      const azureAudit = await callAPI(AZURE_REST_URL, "/api/audit", {
        all_profiles: true,
      });

      if (azureAudit?.audit_results) {
        Object.values(azureAudit.audit_results).forEach((result: any) => {
          if (result.vms) {
            metrics.breakdown.azure.totalVMs += result.vms.length;
            const deallocated = result.vms.filter(
              (vm: any) => vm.powerState === "VM deallocated"
            ).length;
            metrics.breakdown.azure.unusedVMs += deallocated;
          }
          if (result.unattached_disks) {
            metrics.breakdown.azure.totalDisks += result.unattached_disks.length;
            metrics.breakdown.azure.unusedDisks += result.unattached_disks.length;
          }
        });

        // Calculate Azure efficiency score
        const azureTotal =
          metrics.breakdown.azure.totalVMs + metrics.breakdown.azure.totalDisks;
        const azureUnused =
          metrics.breakdown.azure.unusedVMs + metrics.breakdown.azure.unusedDisks;
        metrics.breakdown.azure.score =
          azureTotal > 0 ? Math.round(((azureTotal - azureUnused) / azureTotal) * 100) : 100;
      }
    } catch (err) {
      console.error("Azure audit fetch failed:", err);
      metrics.breakdown.azure.score = 0;
    }

    // Fetch GCP audit data
    try {
      const gcpAudit = await callAPI(GCP_REST_URL, "/api/audit", {
        projectId: process.env.GCP_PROJECT_ID,
      });

      if (gcpAudit?.success && gcpAudit?.data) {
        // Parse instances
        const instancesData = gcpAudit.data.instances?.content?.[0]?.text;
        if (instancesData) {
          try {
            const instances = JSON.parse(instancesData);
            if (Array.isArray(instances)) {
              metrics.breakdown.gcp.totalInstances = instances.length;
              metrics.breakdown.gcp.terminatedInstances = instances.filter(
                (i: any) => i.status !== "RUNNING"
              ).length;
            }
          } catch (parseErr) {
            console.error("Failed to parse GCP instances:", parseErr);
          }
        }

        // Parse disks
        const disksData = gcpAudit.data.disks?.content?.[0]?.text;
        if (disksData) {
          try {
            const disks = JSON.parse(disksData);
            if (Array.isArray(disks)) {
              metrics.breakdown.gcp.totalDisks = disks.length;
              metrics.breakdown.gcp.unattachedDisks = disks.filter(
                (d: any) => !d.users || d.users.length === 0
              ).length;
            }
          } catch (parseErr) {
            console.error("Failed to parse GCP disks:", parseErr);
          }
        }

        // Calculate GCP efficiency score
        const gcpTotal =
          metrics.breakdown.gcp.totalInstances + metrics.breakdown.gcp.totalDisks;
        const gcpUnused =
          metrics.breakdown.gcp.terminatedInstances + metrics.breakdown.gcp.unattachedDisks;
        metrics.breakdown.gcp.score =
          gcpTotal > 0 ? Math.round(((gcpTotal - gcpUnused) / gcpTotal) * 100) : 100;
      }
    } catch (err) {
      console.error("GCP audit fetch failed:", err);
      metrics.breakdown.gcp.score = 0;
    }

    // Calculate overall metrics
    metrics.totalResources =
      metrics.breakdown.aws.totalInstances +
      metrics.breakdown.aws.totalVolumes +
      metrics.breakdown.azure.totalVMs +
      metrics.breakdown.azure.totalDisks +
      metrics.breakdown.gcp.totalInstances +
      metrics.breakdown.gcp.totalDisks;

    metrics.unusedResources =
      metrics.breakdown.aws.unusedInstances +
      metrics.breakdown.aws.unusedVolumes +
      metrics.breakdown.azure.unusedVMs +
      metrics.breakdown.azure.unusedDisks +
      metrics.breakdown.gcp.terminatedInstances +
      metrics.breakdown.gcp.unattachedDisks;

    metrics.resourceUtilization =
      metrics.totalResources > 0
        ? Math.round(
            ((metrics.totalResources - metrics.unusedResources) / metrics.totalResources) * 100
          )
        : 100;

    metrics.wasteRatio =
      metrics.totalResources > 0
        ? Math.round((metrics.unusedResources / metrics.totalResources) * 100)
        : 0;

    // Calculate overall efficiency score (weighted average)
    const scores = [
      metrics.breakdown.aws.score,
      metrics.breakdown.azure.score,
      metrics.breakdown.gcp.score,
    ].filter((s) => s > 0);

    metrics.overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Error calculating efficiency metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate efficiency metrics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
