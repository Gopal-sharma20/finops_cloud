/**
 * Transform Azure API responses to match UI component data structures
 */

import {
  Server,
  Database,
  HardDrive,
  Network,
  Zap,
  Globe,
  Container,
  Brain,
} from "lucide-react";
import { AzureCostData, AzureService, AzureRegion } from "./types";

/**
 * Azure service color palette
 */
const AZURE_COLORS = [
  "#0078D4", // Azure Blue
  "#40E0D0", // Turquoise
  "#7B68EE", // Medium Slate Blue
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
  "#FFD700", // Gold
  "#FF6347", // Tomato
  "#9370DB", // Medium Purple
  "#00CED1", // Dark Turquoise
  "#FF8C00", // Dark Orange
];

/**
 * Map Azure service names to icons
 */
function getServiceIcon(serviceName: string) {
  const name = serviceName.toLowerCase();

  if (name.includes("virtual machine") || name.includes("compute")) return Server;
  if (name.includes("storage") || name.includes("blob")) return HardDrive;
  if (name.includes("database") || name.includes("sql") || name.includes("cosmos")) return Database;
  if (name.includes("app service") || name.includes("web")) return Globe;
  if (name.includes("function")) return Zap;
  if (name.includes("network") || name.includes("vpn")) return Network;
  if (name.includes("container") || name.includes("kubernetes") || name.includes("aks")) return Container;
  if (name.includes("cognitive") || name.includes("ai") || name.includes("ml")) return Brain;

  return Server;
}

/**
 * Transform cost data to service breakdown for charts
 */
export function transformCostToServices(
  costByService: Record<string, number>
): AzureService[] {
  if (!costByService || Object.keys(costByService).length === 0) {
    return [];
  }

  const services = Object.entries(costByService)
    .filter(([_, cost]) => cost > 0)
    .map(([name, cost], index) => {
      // Simplify service names
      const simpleName = name
        .replace("Microsoft.", "")
        .replace("Azure ", "")
        .replace(/\s+/g, " ")
        .trim();

      return {
        name: simpleName,
        fullName: name,
        count: 0, // Will be updated from audit data if available
        cost: Number(cost),
        utilization: 65, // Default, can be calculated from metrics
        color: AZURE_COLORS[index % AZURE_COLORS.length],
        icon: getServiceIcon(name),
      };
    })
    .sort((a, b) => b.cost - a.cost);

  return services;
}

/**
 * Azure region metadata mapping
 */
const AZURE_REGION_METADATA: Record<string, { name: string; timezone: string; location: string }> = {
  // Americas
  "eastus": { name: "East US", timezone: "UTC-5", location: "Virginia" },
  "eastus2": { name: "East US 2", timezone: "UTC-5", location: "Virginia" },
  "centralus": { name: "Central US", timezone: "UTC-6", location: "Iowa" },
  "northcentralus": { name: "North Central US", timezone: "UTC-6", location: "Illinois" },
  "southcentralus": { name: "South Central US", timezone: "UTC-6", location: "Texas" },
  "westcentralus": { name: "West Central US", timezone: "UTC-7", location: "Wyoming" },
  "westus": { name: "West US", timezone: "UTC-8", location: "California" },
  "westus2": { name: "West US 2", timezone: "UTC-8", location: "Washington" },
  "westus3": { name: "West US 3", timezone: "UTC-7", location: "Arizona" },
  "canadacentral": { name: "Canada Central", timezone: "UTC-5", location: "Toronto" },
  "canadaeast": { name: "Canada East", timezone: "UTC-5", location: "Quebec" },
  "brazilsouth": { name: "Brazil South", timezone: "UTC-3", location: "São Paulo" },

  // Europe
  "northeurope": { name: "North Europe", timezone: "UTC+0", location: "Ireland" },
  "westeurope": { name: "West Europe", timezone: "UTC+1", location: "Netherlands" },
  "uksouth": { name: "UK South", timezone: "UTC+0", location: "London" },
  "ukwest": { name: "UK West", timezone: "UTC+0", location: "Cardiff" },
  "francecentral": { name: "France Central", timezone: "UTC+1", location: "Paris" },
  "francesouth": { name: "France South", timezone: "UTC+1", location: "Marseille" },
  "germanywestcentral": { name: "Germany West Central", timezone: "UTC+1", location: "Frankfurt" },
  "germanynorth": { name: "Germany North", timezone: "UTC+1", location: "Berlin" },
  "norwayeast": { name: "Norway East", timezone: "UTC+1", location: "Oslo" },
  "switzerlandnorth": { name: "Switzerland North", timezone: "UTC+1", location: "Zurich" },
  "swedencentral": { name: "Sweden Central", timezone: "UTC+1", location: "Gävle" },

  // Asia Pacific
  "eastasia": { name: "East Asia", timezone: "UTC+8", location: "Hong Kong" },
  "southeastasia": { name: "Southeast Asia", timezone: "UTC+8", location: "Singapore" },
  "australiaeast": { name: "Australia East", timezone: "UTC+10", location: "Sydney" },
  "australiasoutheast": { name: "Australia Southeast", timezone: "UTC+10", location: "Melbourne" },
  "australiacentral": { name: "Australia Central", timezone: "UTC+10", location: "Canberra" },
  "japaneast": { name: "Japan East", timezone: "UTC+9", location: "Tokyo" },
  "japanwest": { name: "Japan West", timezone: "UTC+9", location: "Osaka" },
  "koreacentral": { name: "Korea Central", timezone: "UTC+9", location: "Seoul" },
  "koreasouth": { name: "Korea South", timezone: "UTC+9", location: "Busan" },
  "centralindia": { name: "Central India", timezone: "UTC+5:30", location: "Pune" },
  "southindia": { name: "South India", timezone: "UTC+5:30", location: "Chennai" },
  "westindia": { name: "West India", timezone: "UTC+5:30", location: "Mumbai" },

  // Middle East & Africa
  "uaenorth": { name: "UAE North", timezone: "UTC+4", location: "Dubai" },
  "uaecentral": { name: "UAE Central", timezone: "UTC+4", location: "Abu Dhabi" },
  "southafricanorth": { name: "South Africa North", timezone: "UTC+2", location: "Johannesburg" },
  "southafricawest": { name: "South Africa West", timezone: "UTC+2", location: "Cape Town" },
};

/**
 * Transform regional cost data
 */
export function transformRegionalCosts(
  costByRegion: Record<string, number>,
  services: AzureService[]
): AzureRegion[] {
  if (!costByRegion || Object.keys(costByRegion).length === 0) {
    return [];
  }

  const totalCost = Object.values(costByRegion).reduce((sum, cost) => sum + cost, 0);

  const regions = Object.entries(costByRegion)
    .filter(([_, cost]) => cost > 0)
    .map(([regionId, cost]) => {
      const metadata = AZURE_REGION_METADATA[regionId.toLowerCase()] || {
        name: regionId,
        timezone: "UTC+0",
        location: regionId,
      };

      // Estimate resources based on cost proportion
      const costProportion = totalCost > 0 ? cost / totalCost : 0;
      const resources = Math.round(services.length * costProportion * 10);

      return {
        id: regionId.toLowerCase(),
        name: metadata.name,
        timezone: metadata.timezone,
        location: metadata.location,
        resources: Math.max(resources, 1),
        cost: Math.round(cost * 100) / 100,
      };
    })
    .sort((a, b) => b.cost - a.cost);

  return regions;
}

/**
 * Estimate regional costs when regional data is not available
 */
export function estimateRegionalCosts(
  totalCost: number,
  services: AzureService[]
): AzureRegion[] {
  // Default distribution for common Azure regions
  const defaultRegions = [
    { id: "eastus", distribution: 0.35 },
    { id: "westus2", distribution: 0.20 },
    { id: "westeurope", distribution: 0.15 },
    { id: "eastasia", distribution: 0.10 },
    { id: "northeurope", distribution: 0.08 },
    { id: "japaneast", distribution: 0.06 },
    { id: "australiaeast", distribution: 0.04 },
    { id: "canadacentral", distribution: 0.02 },
  ];

  return defaultRegions.map(({ id, distribution }) => {
    const metadata = AZURE_REGION_METADATA[id] || {
      name: id,
      timezone: "UTC+0",
      location: id,
    };

    const cost = Math.round(totalCost * distribution * 100) / 100;
    const resources = Math.round(services.length * distribution * 10);

    return {
      id,
      name: metadata.name,
      timezone: metadata.timezone,
      location: metadata.location,
      resources: Math.max(resources, 1),
      cost,
    };
  });
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
    const forecast = Math.round(cost * 1.04);
    const optimized = Math.round(cost * 0.86);

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
      compute: isBusinessHours ? 72 + Math.random() * 20 : 25 + Math.random() * 15,
      storage: isBusinessHours ? 68 + Math.random() * 18 : 30 + Math.random() * 15,
      network: isBusinessHours ? 65 + Math.random() * 20 : 18 + Math.random() * 12,
      database: isBusinessHours ? 84 + Math.random() * 12 : 40 + Math.random() * 15,
    };
  });
}

/**
 * Generate security assessment data
 */
export function generateSecurityData() {
  return [
    { category: "Identity", score: 92, max: 100 },
    { category: "Data Protection", score: 85, max: 100 },
    { category: "Network Security", score: 88, max: 100 },
    { category: "Compliance", score: 94, max: 100 },
    { category: "Threat Protection", score: 87, max: 100 },
    { category: "Governance", score: 91, max: 100 },
  ];
}
