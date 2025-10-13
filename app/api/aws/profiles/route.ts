// app/api/aws/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";

function listProfiles() {
  const env = process.env.AWS_PROFILES?.trim();
  const profiles = env && env.length > 0 ? env.split(",").map(s => s.trim()) : ["default"];
  return Array.from(new Set(profiles)).filter(Boolean);
}

/**
 * GET /api/aws/profiles
 * Returns profiles from env (AWS_PROFILES), defaults to ["default"].
 */
export async function GET() {
  return NextResponse.json({ profiles: listProfiles() });
}

/**
 * POST /api/aws/profiles
 * (Optional) accept a body { profiles?: string[] } to override in-memory (no persistence).
 * If you don’t need this, you can 405 it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) ?? {};
    const profiles = Array.isArray(body.profiles) ? body.profiles.map((p: any) => String(p).trim()).filter(Boolean) : null;

    // We don't persist changes here; just echo back
    return NextResponse.json({
      saved: false,
      reason: "Profiles are sourced from env AWS_PROFILES; update .env.local to persist.",
      profiles: profiles ?? listProfiles(),
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}
