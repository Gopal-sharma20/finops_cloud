import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
} from "@aws-sdk/client-cost-explorer";
import { getAWSCredentials, getAWSRegion } from "./config";

interface CostFilter {
  tags?: string[];
  dimensions?: string[];
}

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Parse filters from string array format (e.g., ["Key=Value"])
 */
function parseCostFilters(filters?: CostFilter) {
  const costFilters: any = {};

  if (filters?.tags && filters.tags.length > 0) {
    costFilters.Tags = {
      Key: "Tags",
      Values: filters.tags.map((tag) => {
        const [key, value] = tag.split("=");
        return `${key}$${value}`;
      }),
    };
  }

  if (filters?.dimensions && filters.dimensions.length > 0) {
    const dimensionFilters = filters.dimensions.map((dim) => {
      const [key, value] = dim.split("=");
      return {
        Dimensions: {
          Key: key,
          Values: [value],
        },
      };
    });

    if (dimensionFilters.length > 0) {
      costFilters.And = dimensionFilters;
    }
  }

  return Object.keys(costFilters).length > 0 ? { Filter: costFilters } : {};
}

/**
 * Calculate date range based on parameters
 */
function calculateDateRange(
  timeRangeDays?: number,
  startDateIso?: string,
  endDateIso?: string
): DateRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;

  if (startDateIso && endDateIso) {
    startDate = new Date(startDateIso);
    endDate = new Date(endDateIso);
  } else if (timeRangeDays) {
    endDate = today;
    startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (timeRangeDays - 1));
  } else {
    // Default to current month
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = today;
  }

  // API end date needs to be exclusive (next day)
  const apiEndDate = new Date(endDate);
  apiEndDate.setDate(apiEndDate.getDate() + 1);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: apiEndDate.toISOString().split("T")[0],
  };
}

export interface GetCostParams {
  profileName?: string;
  timeRangeDays?: number;
  startDateIso?: string;
  endDateIso?: string;
  tags?: string[];
  dimensions?: string[];
  groupBy?: string;
  region?: string;
}

export interface CostData {
  profileName: string;
  accountId: string;
  periodStartDate: string;
  periodEndDate: string;
  totalCost: number;
  costByService: Record<string, number>;
  status: "success" | "error";
  message?: string;
}

/**
 * Get cost data for a specific AWS profile
 */
export async function getCostData(params: GetCostParams): Promise<CostData> {
  const {
    profileName = "default",
    timeRangeDays,
    startDateIso,
    endDateIso,
    tags,
    dimensions,
    groupBy = "SERVICE",
    region = process.env.AWS_DEFAULT_REGION || "us-east-1",
  } = params;

  try {
    const credentials = await getAWSCredentials(profileName);
    const profileRegion = await getAWSRegion(profileName);

    // Cost Explorer API is only available in us-east-1
    const ceClient = new CostExplorerClient({
      credentials,
      region: "us-east-1"
    });

    // Get account ID
    const { STSClient, GetCallerIdentityCommand } = await import("@aws-sdk/client-sts");
    const stsClient = new STSClient({ credentials, region: profileRegion });
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    const accountId = identity.Account || "unknown";

    const dateRange = calculateDateRange(timeRangeDays, startDateIso, endDateIso);
    const filters = parseCostFilters({ tags, dimensions });

    // Get total cost
    const totalCostParams: GetCostAndUsageCommandInput = {
      TimePeriod: {
        Start: dateRange.startDate,
        End: dateRange.endDate,
      },
      Granularity: timeRangeDays || (startDateIso && endDateIso) ? "DAILY" : "MONTHLY",
      Metrics: ["UnblendedCost"],
      ...filters,
    };

    const totalCostResponse = await ceClient.send(
      new GetCostAndUsageCommand(totalCostParams)
    );

    let totalCost = 0;
    if (totalCostResponse.ResultsByTime) {
      for (const result of totalCostResponse.ResultsByTime) {
        if (result.Total?.UnblendedCost?.Amount) {
          totalCost += parseFloat(result.Total.UnblendedCost.Amount);
        }
      }
    }

    // Get cost by service
    const costByServiceParams: GetCostAndUsageCommandInput = {
      TimePeriod: {
        Start: dateRange.startDate,
        End: dateRange.endDate,
      },
      Granularity: timeRangeDays || (startDateIso && endDateIso) ? "DAILY" : "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: groupBy }],
      ...filters,
    };

    const costByServiceResponse = await ceClient.send(
      new GetCostAndUsageCommand(costByServiceParams)
    );

    const aggregatedCosts: Record<string, number> = {};
    if (costByServiceResponse.ResultsByTime) {
      for (const result of costByServiceResponse.ResultsByTime) {
        if (result.Groups) {
          for (const group of result.Groups) {
            const service = group.Keys?.[0] || "Unknown";
            const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || "0");
            aggregatedCosts[service] = (aggregatedCosts[service] || 0) + amount;
          }
        }
      }
    }

    // Sort and filter
    const sortedCosts = Object.entries(aggregatedCosts)
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [service, cost]) => {
        if (cost > 0.001) {
          acc[service] = Math.round(cost * 100) / 100;
        }
        return acc;
      }, {} as Record<string, number>);

    return {
      profileName,
      accountId,
      periodStartDate: dateRange.startDate,
      periodEndDate: dateRange.endDate,
      totalCost: Math.round(totalCost * 100) / 100,
      costByService: sortedCosts,
      status: "success",
    };
  } catch (error) {
    return {
      profileName,
      accountId: "",
      periodStartDate: "",
      periodEndDate: "",
      totalCost: 0,
      costByService: {},
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get cost data broken down by region
 */
export async function getCostByRegion(params: GetCostParams): Promise<Record<string, number>> {
  const {
    profileName = "default",
    timeRangeDays,
    startDateIso,
    endDateIso,
    region = process.env.AWS_DEFAULT_REGION || "us-east-1",
  } = params;

  try {
    const credentials = await getAWSCredentials(profileName);
    // Cost Explorer API is only available in us-east-1
    const ceClient = new CostExplorerClient({
      credentials,
      region: "us-east-1"
    });

    const dateRange = calculateDateRange(timeRangeDays, startDateIso, endDateIso);

    // Get cost by region
    const costByRegionParams: GetCostAndUsageCommandInput = {
      TimePeriod: {
        Start: dateRange.startDate,
        End: dateRange.endDate,
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: "REGION" }],
    };

    const response = await ceClient.send(
      new GetCostAndUsageCommand(costByRegionParams)
    );

    const regionalCosts: Record<string, number> = {};
    if (response.ResultsByTime) {
      for (const result of response.ResultsByTime) {
        if (result.Groups) {
          for (const group of result.Groups) {
            const regionKey = group.Keys?.[0] || "Unknown";
            const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || "0");
            regionalCosts[regionKey] = (regionalCosts[regionKey] || 0) + amount;
          }
        }
      }
    }

    return regionalCosts;
  } catch (error) {
    console.error("Error fetching regional costs:", error);
    return {};
  }
}
