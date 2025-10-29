// app/api/savings/route.ts
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
    const text = await res.text().catch(() => "");
    throw new Error(`API call failed: ${res.status} - ${text}`);
  }

  return res.json();
}

interface Recommendation {
  provider: "aws" | "azure" | "gcp";
  category: string;
  description: string;
  monthlySavings: number;
  impact: "high" | "medium" | "low";
  resourceId?: string;
  region?: string;
}

/**
 * GET /api/savings (deprecated)
 * POST /api/savings - with connectedProviders and GCP credentials
 * Aggregates cost savings recommendations from all cloud providers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const connectedProviders: string[] = body.connectedProviders || [];
    const gcpCredentials = body.gcpCredentials;

    const recommendations: Recommendation[] = [];
    let totalPotentialSavings = 0;

    // Fetch Azure advisor recommendations - only if connected
    if (connectedProviders.includes('azure')) {
      try {
        const azureData = await callAPI(AZURE_REST_URL, "/api/advisor", {
          all_profiles: true,
          category: "Cost",
        });

        if (azureData?.recommendations) {
          azureData.recommendations.forEach((rec: any) => {
            const savings = parseFloat(rec.extendedProperties?.savingsAmount || "0");
            recommendations.push({
              provider: "azure",
              category: rec.category || "Cost Optimization",
              description: rec.shortDescription?.problem || rec.name || "Optimize resources",
              monthlySavings: savings,
              impact: savings > 100 ? "high" : savings > 50 ? "medium" : "low",
              resourceId: rec.impactedValue,
              region: rec.location,
            });
            totalPotentialSavings += savings;
          });
        }
      } catch (err) {
        console.error("Azure advisor fetch failed:", err);
      }
    }

    // Fetch AWS Trusted Advisor / Cost Explorer recommendations - only if connected
    if (connectedProviders.includes('aws')) {
      try {
        const awsData = await callAPI(AWS_REST_URL, "/api/recommendations", {
          all_profiles: true,
        });

        if (awsData?.recommendations) {
          awsData.recommendations.forEach((rec: any) => {
            const savings = parseFloat(rec.estimatedMonthlySavings || "0");
            recommendations.push({
              provider: "aws",
              category: rec.category || "Cost Optimization",
              description: rec.description || "Optimize resources",
              monthlySavings: savings,
              impact: savings > 100 ? "high" : savings > 50 ? "medium" : "low",
              resourceId: rec.resourceId,
              region: rec.region,
            });
            totalPotentialSavings += savings;
          });
        }
      } catch (err) {
        console.error("AWS recommendations fetch failed:", err);
      }
    }

    // Fetch GCP recommendations - only if connected and credentials provided
    if (connectedProviders.includes('gcp') && gcpCredentials?.projectId) {
      try {
        const gcpData = await callAPI(GCP_REST_URL, "/api/recommender", {
          projectId: gcpCredentials.projectId,
          serviceAccountJson: gcpCredentials.serviceAccountJson,
          billingAccountId: gcpCredentials.billingAccountId,
        });

        if (gcpData?.success && gcpData?.data) {
          // Parse GCP recommender output
          const recommenderData = gcpData.data?.content?.[0]?.text;
          if (recommenderData) {
            try {
              const recs = JSON.parse(recommenderData);
              if (Array.isArray(recs)) {
                recs.forEach((rec: any) => {
                  const savings = parseFloat(
                    rec.primaryImpact?.costProjection?.cost?.units || "0"
                  );
                  const monthlySavings = Math.abs(savings); // Savings are usually negative

                  recommendations.push({
                    provider: "gcp",
                    category: rec.recommenderSubtype || "Cost Optimization",
                    description: rec.description || rec.name || "Optimize resources",
                    monthlySavings,
                    impact: monthlySavings > 100 ? "high" : monthlySavings > 50 ? "medium" : "low",
                    resourceId: rec.name,
                  });
                  totalPotentialSavings += monthlySavings;
                });
              }
            } catch (parseErr) {
              console.error("Failed to parse GCP recommendations:", parseErr);
            }
          }
        }
      } catch (err) {
        console.error("GCP recommendations fetch failed:", err);
      }
    }

    // Sort by savings (highest first)
    recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);

    return NextResponse.json({
      success: true,
      totalPotentialSavings,
      recommendationCount: recommendations.length,
      recommendations,
      breakdown: {
        aws: recommendations.filter((r) => r.provider === "aws").reduce((sum, r) => sum + r.monthlySavings, 0),
        azure: recommendations.filter((r) => r.provider === "azure").reduce((sum, r) => sum + r.monthlySavings, 0),
        gcp: recommendations.filter((r) => r.provider === "gcp").reduce((sum, r) => sum + r.monthlySavings, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching savings recommendations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch savings recommendations",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
