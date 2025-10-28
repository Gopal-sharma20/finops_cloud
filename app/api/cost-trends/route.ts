// app/api/cost-trends/route.ts
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

/**
 * GET /api/cost-trends?days=7
 * POST /api/cost-trends - with GCP credentials in body
 * Returns daily cost breakdown for all cloud providers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const days = parseInt(body.days || "7", 10);
    const gcpCredentials = body.gcpCredentials; // { projectId, serviceAccountJson, billingAccountId }

    const trends: Array<{
      date: string;
      aws: number;
      azure: number;
      gcp: number;
      total: number;
    }> = [];

    // Calculate date ranges for each day
    const today = new Date();
    const promises = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      promises.push(
        fetchDailyCost(dateStr, startDate.toISOString(), endDate.toISOString(), gcpCredentials)
      );
    }

    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - index));
      const dateStr = date.toISOString().split("T")[0];

      if (result.status === "fulfilled") {
        trends.push({
          date: dateStr,
          ...result.value,
          total: result.value.aws + result.value.azure + result.value.gcp,
        });
      } else {
        // If fetch failed, add zero data for that day
        trends.push({
          date: dateStr,
          aws: 0,
          azure: 0,
          gcp: 0,
          total: 0,
        });
      }
    });

    return NextResponse.json({
      success: true,
      days,
      trends,
    });
  } catch (error) {
    console.error("Error fetching cost trends:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cost trends",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function fetchDailyCost(
  date: string,
  startDateIso: string,
  endDateIso: string,
  gcpCredentials?: any
): Promise<{ aws: number; azure: number; gcp: number }> {
  const costs = { aws: 0, azure: 0, gcp: 0 };

  try {
    // Fetch Azure cost
    try {
      const azureData = await callAPI(AZURE_REST_URL, "/api/cost", {
        all_profiles: true,
        start_date_iso: startDateIso,
        end_date_iso: endDateIso,
        group_by: "ServiceName",
      });

      if (azureData?.accounts_cost_data) {
        Object.values(azureData.accounts_cost_data).forEach((account: any) => {
          if (account["Total Cost"]) {
            costs.azure += parseFloat(account["Total Cost"]) || 0;
          }
        });
      }
    } catch (err) {
      console.error(`Azure cost fetch failed for ${date}:`, err);
    }

    // Fetch AWS cost
    try {
      const awsData = await callAPI(AWS_REST_URL, "/api/cost", {
        all_profiles: true,
        start_date_iso: startDateIso,
        end_date_iso: endDateIso,
        group_by: "SERVICE",
      });

      if (awsData?.accounts_cost_data) {
        Object.values(awsData.accounts_cost_data).forEach((account: any) => {
          if (account["Total Cost"]) {
            costs.aws += parseFloat(account["Total Cost"]) || 0;
          }
        });
      }
    } catch (err) {
      console.error(`AWS cost fetch failed for ${date}:`, err);
    }

    // Fetch GCP cost (estimate from instances) - only if credentials provided
    if (gcpCredentials?.projectId) {
      try {
        const gcpData = await callAPI(GCP_REST_URL, "/api/cost", {
          projectId: gcpCredentials.projectId,
          serviceAccountJson: gcpCredentials.serviceAccountJson,
          billingAccountId: gcpCredentials.billingAccountId,
        });

        if (gcpData?.success && gcpData?.data?.compute) {
          const computeData = gcpData.data.compute?.content?.[0]?.text;
          if (computeData) {
            const instances = JSON.parse(computeData);
            if (Array.isArray(instances)) {
              const runningInstances = instances.filter(
                (i: any) => i.status === "RUNNING"
              ).length;
              // Rough daily estimate: $50/month per instance / 30 days
              costs.gcp = (runningInstances * 50) / 30;
            }
          }
        }
      } catch (err) {
        console.error(`GCP cost fetch failed for ${date}:`, err);
      }
    }
  } catch (error) {
    console.error(`Error fetching daily cost for ${date}:`, error);
  }

  return costs;
}
