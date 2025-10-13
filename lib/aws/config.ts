import { fromIni } from "@aws-sdk/credential-providers";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

/**
 * Get AWS credentials from saved profile (file-based) or environment
 */
export async function getAWSCredentials(profileName: string = "default") {
  try {
    // First try to load from saved profiles
    const { getProfileCredentials } = await import("@/app/api/aws/profiles/route");
    const savedProfile = await getProfileCredentials(profileName);

    if (savedProfile) {
      return {
        accessKeyId: savedProfile.accessKeyId,
        secretAccessKey: savedProfile.secretAccessKey,
      };
    }
  } catch (error) {
    console.log(`No saved profile found for ${profileName}, trying AWS CLI config`);
  }

  // Fallback to AWS CLI config
  return fromIni({ profile: profileName });
}

/**
 * Get AWS region for a profile
 */
export async function getAWSRegion(profileName: string = "default"): Promise<string> {
  try {
    const { getProfileCredentials } = await import("@/app/api/aws/profiles/route");
    const savedProfile = await getProfileCredentials(profileName);

    if (savedProfile?.region) {
      return savedProfile.region;
    }
  } catch (error) {
    // Ignore error
  }

  return process.env.AWS_DEFAULT_REGION || "us-east-1";
}

/**
 * Get list of all available AWS profiles from environment
 */
export function getAvailableProfiles(): string[] {
  // This will be populated from AWS CLI config
  // For now, we'll use profiles from environment variables
  const profiles = process.env.AWS_PROFILES?.split(",") || ["default"];
  return profiles;
}

/**
 * Verify profile credentials and get account ID
 */
export async function verifyProfile(profileName: string) {
  try {
    const credentials = await getAWSCredentials(profileName);
    const region = await getAWSRegion(profileName);

    const stsClient = new STSClient({
      credentials,
      region
    });

    const identity = await stsClient.send(new GetCallerIdentityCommand({}));

    return {
      valid: true,
      accountId: identity.Account,
      arn: identity.Arn,
      userId: identity.UserId,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get configuration for multiple profiles
 */
export async function getProfilesConfig(
  profiles?: string[],
  allProfiles: boolean = false
) {
  const targetProfiles = allProfiles
    ? getAvailableProfiles()
    : profiles || ["default"];

  const validProfiles: Record<string, { accountId: string }> = {};
  const errors: Record<string, string> = {};

  for (const profile of targetProfiles) {
    const verification = await verifyProfile(profile);
    if (verification.valid && verification.accountId) {
      validProfiles[verification.accountId] = { accountId: verification.accountId };
    } else {
      errors[profile] = verification.error || "Failed to verify profile";
    }
  }

  return { validProfiles, errors };
}
