/**
 * Type definitions for AWS cost and audit data
 * These types match the MCP server response formats
 */

export interface StoppedEC2Instance {
  instanceId: string;
  instanceType: string;
  state: string;
  launchTime?: Date;
  region: string;
}

export interface UnattachedEBSVolume {
  volumeId: string;
  size: number;
  volumeType: string;
  state: string;
  region: string;
  createTime?: Date;
}

export interface UnassociatedEIP {
  publicIp: string;
  allocationId: string;
  region: string;
}

export interface BudgetStatus {
  budgetName: string;
  budgetLimit: number;
  actualSpend: number;
  forecastedSpend: number;
  percentUsed: number;
  status: "OK" | "WARNING" | "EXCEEDED";
}

export interface AuditReport {
  profileName: string;
  accountId: string;
  stoppedEC2Instances: StoppedEC2Instance[];
  unattachedEBSVolumes: UnattachedEBSVolume[];
  unassociatedEIPs: UnassociatedEIP[];
  budgetStatus: BudgetStatus[];
  errors: {
    ec2?: string;
    ebs?: string;
    eip?: string;
    budget?: string;
  };
}

export interface CostData {
  profileName: string;
  accountId: string;
  periodStartDate: string;
  periodEndDate: string;
  totalCost: number;
  costByService: Record<string, number>;
  costByRegion?: Record<string, number>;
  status: "success" | "error";
  message?: string;
}
