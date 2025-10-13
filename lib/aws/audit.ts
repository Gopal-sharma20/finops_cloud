import {
  EC2Client,
  DescribeInstancesCommand,
  DescribeVolumesCommand,
  DescribeAddressesCommand,
} from "@aws-sdk/client-ec2";
import { BudgetsClient, DescribeBudgetsCommand } from "@aws-sdk/client-budgets";
import { getAWSCredentials, getAWSRegion } from "./config";

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

/**
 * Get stopped EC2 instances
 */
async function getStoppedEC2Instances(
  profileName: string,
  regions: string[]
): Promise<{ instances: StoppedEC2Instance[]; errors: string[] }> {
  const instances: StoppedEC2Instance[] = [];
  const errors: string[] = [];

  for (const region of regions) {
    try {
      const credentials = await getAWSCredentials(profileName);
      const ec2Client = new EC2Client({ credentials, region });

      const response = await ec2Client.send(
        new DescribeInstancesCommand({
          Filters: [
            {
              Name: "instance-state-name",
              Values: ["stopped"],
            },
          ],
        })
      );

      if (response.Reservations) {
        for (const reservation of response.Reservations) {
          if (reservation.Instances) {
            for (const instance of reservation.Instances) {
              instances.push({
                instanceId: instance.InstanceId || "unknown",
                instanceType: instance.InstanceType || "unknown",
                state: instance.State?.Name || "stopped",
                launchTime: instance.LaunchTime,
                region,
              });
            }
          }
        }
      }
    } catch (error) {
      errors.push(
        `${region}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return { instances, errors };
}

/**
 * Get unattached EBS volumes
 */
async function getUnattachedEBSVolumes(
  profileName: string,
  regions: string[]
): Promise<{ volumes: UnattachedEBSVolume[]; errors: string[] }> {
  const volumes: UnattachedEBSVolume[] = [];
  const errors: string[] = [];

  for (const region of regions) {
    try {
      const credentials = await getAWSCredentials(profileName);
      const ec2Client = new EC2Client({ credentials, region });

      const response = await ec2Client.send(
        new DescribeVolumesCommand({
          Filters: [
            {
              Name: "status",
              Values: ["available"],
            },
          ],
        })
      );

      if (response.Volumes) {
        for (const volume of response.Volumes) {
          volumes.push({
            volumeId: volume.VolumeId || "unknown",
            size: volume.Size || 0,
            volumeType: volume.VolumeType || "unknown",
            state: volume.State || "available",
            region,
            createTime: volume.CreateTime,
          });
        }
      }
    } catch (error) {
      errors.push(
        `${region}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return { volumes, errors };
}

/**
 * Get unassociated Elastic IPs
 */
async function getUnassociatedEIPs(
  profileName: string,
  regions: string[]
): Promise<{ eips: UnassociatedEIP[]; errors: string[] }> {
  const eips: UnassociatedEIP[] = [];
  const errors: string[] = [];

  for (const region of regions) {
    try {
      const credentials = await getAWSCredentials(profileName);
      const ec2Client = new EC2Client({ credentials, region });

      const response = await ec2Client.send(new DescribeAddressesCommand({}));

      if (response.Addresses) {
        for (const address of response.Addresses) {
          // Unassociated EIPs don't have AssociationId
          if (!address.AssociationId) {
            eips.push({
              publicIp: address.PublicIp || "unknown",
              allocationId: address.AllocationId || "unknown",
              region,
            });
          }
        }
      }
    } catch (error) {
      errors.push(
        `${region}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  return { eips, errors };
}

/**
 * Get budget status
 */
async function getBudgetStatus(
  profileName: string,
  accountId: string
): Promise<{ budgets: BudgetStatus[]; error?: string }> {
  try {
    const credentials = getAWSCredentials(profileName);
    const budgetsClient = new BudgetsClient({
      credentials,
      region: "us-east-1", // Budgets is global but requires us-east-1
    });

    const response = await budgetsClient.send(
      new DescribeBudgetsCommand({
        AccountId: accountId,
      })
    );

    const budgets: BudgetStatus[] = [];

    if (response.Budgets) {
      for (const budget of response.Budgets) {
        const limit = parseFloat(budget.BudgetLimit?.Amount || "0");
        const actual = parseFloat(
          budget.CalculatedSpend?.ActualSpend?.Amount || "0"
        );
        const forecasted = parseFloat(
          budget.CalculatedSpend?.ForecastedSpend?.Amount || "0"
        );
        const percentUsed = limit > 0 ? (actual / limit) * 100 : 0;

        let status: "OK" | "WARNING" | "EXCEEDED" = "OK";
        if (percentUsed >= 100) {
          status = "EXCEEDED";
        } else if (percentUsed >= 80) {
          status = "WARNING";
        }

        budgets.push({
          budgetName: budget.BudgetName || "Unknown",
          budgetLimit: limit,
          actualSpend: actual,
          forecastedSpend: forecasted,
          percentUsed: Math.round(percentUsed * 100) / 100,
          status,
        });
      }
    }

    return { budgets };
  } catch (error) {
    return {
      budgets: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run complete FinOps audit
 */
export async function runFinOpsAudit(
  profileName: string,
  accountId: string,
  regions: string[]
): Promise<AuditReport> {
  const [ec2Result, ebsResult, eipResult, budgetResult] = await Promise.all([
    getStoppedEC2Instances(profileName, regions),
    getUnattachedEBSVolumes(profileName, regions),
    getUnassociatedEIPs(profileName, regions),
    getBudgetStatus(profileName, accountId),
  ]);

  return {
    profileName,
    accountId,
    stoppedEC2Instances: ec2Result.instances,
    unattachedEBSVolumes: ebsResult.volumes,
    unassociatedEIPs: eipResult.eips,
    budgetStatus: budgetResult.budgets,
    errors: {
      ec2: ec2Result.errors.length > 0 ? ec2Result.errors.join("; ") : undefined,
      ebs: ebsResult.errors.length > 0 ? ebsResult.errors.join("; ") : undefined,
      eip: eipResult.errors.length > 0 ? eipResult.errors.join("; ") : undefined,
      budget: budgetResult.error,
    },
  };
}
