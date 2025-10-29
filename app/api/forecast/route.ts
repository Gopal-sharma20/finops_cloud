// app/api/forecast/route.ts
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

interface ForecastData {
  date: string;
  forecasted: number;
  confidenceUpper: number;
  confidenceLower: number;
  breakdown: {
    aws: number;
    azure: number;
    gcp: number;
  };
}

/**
 * Simple linear regression for forecasting
 */
function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * GET /api/forecast?days=30
 * POST /api/forecast - with GCP credentials in body
 * Generates cost forecast based on historical trends
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const forecastDays = parseInt(body.days || "30", 10);
    const historicalDays = 14; // Use last 14 days for forecasting
    const gcpCredentials = body.gcpCredentials; // { projectId, serviceAccountJson, billingAccountId }
    const connectedProviders: string[] = body.connectedProviders || []; // ['aws', 'azure', 'gcp']

    // Fetch historical data for the last 14 days
    const historicalData: Array<{
      date: string;
      aws: number;
      azure: number;
      gcp: number;
      total: number;
    }> = [];

    const today = new Date();

    for (let i = historicalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      try {
        const costs = await fetchDailyCost(startDate.toISOString(), endDate.toISOString(), gcpCredentials, connectedProviders);
        historicalData.push({
          date: dateStr,
          ...costs,
          total: costs.aws + costs.azure + costs.gcp,
        });
      } catch (err) {
        // If fetch fails, use zero
        historicalData.push({
          date: dateStr,
          aws: 0,
          azure: 0,
          gcp: 0,
          total: 0,
        });
      }
    }

    // Prepare data for regression
    const xData = historicalData.map((_, i) => i);
    const yDataTotal = historicalData.map((d) => d.total);
    const yDataAws = historicalData.map((d) => d.aws);
    const yDataAzure = historicalData.map((d) => d.azure);
    const yDataGcp = historicalData.map((d) => d.gcp);

    // Calculate regression models
    const regressionTotal = linearRegression(xData, yDataTotal);
    const regressionAws = linearRegression(xData, yDataAws);
    const regressionAzure = linearRegression(xData, yDataAzure);
    const regressionGcp = linearRegression(xData, yDataGcp);

    // Calculate standard deviation for confidence intervals
    const predictedValues = xData.map((x) => regressionTotal.slope * x + regressionTotal.intercept);
    const residuals = yDataTotal.map((y, i) => y - predictedValues[i]);
    const stdDev = Math.sqrt(
      residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
    );

    // Generate forecast
    const forecast: ForecastData[] = [];
    const baseIndex = historicalDays;

    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const x = baseIndex + i;
      const forecastedTotal = regressionTotal.slope * x + regressionTotal.intercept;
      const confidenceInterval = 1.96 * stdDev * Math.sqrt(1 + 1 / historicalDays);

      forecast.push({
        date: dateStr,
        forecasted: Math.max(0, forecastedTotal),
        confidenceUpper: Math.max(0, forecastedTotal + confidenceInterval),
        confidenceLower: Math.max(0, forecastedTotal - confidenceInterval),
        breakdown: {
          aws: Math.max(0, regressionAws.slope * x + regressionAws.intercept),
          azure: Math.max(0, regressionAzure.slope * x + regressionAzure.intercept),
          gcp: Math.max(0, regressionGcp.slope * x + regressionGcp.intercept),
        },
      });
    }

    return NextResponse.json({
      success: true,
      forecastDays,
      historicalDays,
      historical: historicalData,
      forecast,
      trend: regressionTotal.slope > 0 ? "increasing" : "decreasing",
      monthlyGrowthRate:
        historicalData.length > 0
          ? (regressionTotal.slope / (yDataTotal.reduce((a, b) => a + b, 0) / yDataTotal.length)) *
            30 *
            100
          : 0,
    });
  } catch (error) {
    console.error("Error generating forecast:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate forecast",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function fetchDailyCost(
  startDateIso: string,
  endDateIso: string,
  gcpCredentials?: any,
  connectedProviders: string[] = []
): Promise<{ aws: number; azure: number; gcp: number }> {
  const costs = { aws: 0, azure: 0, gcp: 0 };

  try {
    // Fetch Azure cost - only if connected
    if (connectedProviders.includes('azure')) {
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
        console.error("Azure cost fetch failed:", err);
      }
    }

    // Fetch AWS cost - only if connected
    if (connectedProviders.includes('aws')) {
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
        console.error("AWS cost fetch failed:", err);
      }
    }

    // Fetch GCP cost - only if connected and credentials provided
    if (connectedProviders.includes('gcp') && gcpCredentials?.projectId) {
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
              costs.gcp = (runningInstances * 50) / 30; // Daily estimate
            }
          }
        }
      } catch (err) {
        console.error("GCP cost fetch failed:", err);
      }
    }
  } catch (error) {
    console.error("Error fetching daily cost:", error);
  }

  return costs;
}
