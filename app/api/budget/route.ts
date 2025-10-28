// app/api/budget/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Simple file-based storage for budgets
const BUDGET_FILE = path.join(process.cwd(), ".data", "budgets.json");

interface Budget {
  provider: "aws" | "azure" | "gcp" | "total";
  amount: number;
  period: "monthly" | "quarterly" | "yearly";
  currency: string;
  updatedAt: string;
}

interface BudgetStore {
  budgets: Budget[];
}

// Ensure .data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read budgets from file
function readBudgets(): BudgetStore {
  ensureDataDir();
  if (!fs.existsSync(BUDGET_FILE)) {
    return { budgets: [] };
  }
  try {
    const data = fs.readFileSync(BUDGET_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading budgets:", error);
    return { budgets: [] };
  }
}

// Write budgets to file
function writeBudgets(store: BudgetStore) {
  ensureDataDir();
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(store, null, 2));
}

// GET - Retrieve all budgets
export async function GET(request: NextRequest) {
  try {
    const store = readBudgets();
    return NextResponse.json({ success: true, budgets: store.budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch budgets",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST - Create or update budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, amount, period = "monthly", currency = "USD" } = body;

    if (!provider || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, error: "Provider and amount are required" },
        { status: 400 }
      );
    }

    const store = readBudgets();

    // Remove existing budget for this provider
    store.budgets = store.budgets.filter((b) => b.provider !== provider);

    // Add new budget
    store.budgets.push({
      provider,
      amount,
      period,
      currency,
      updatedAt: new Date().toISOString(),
    });

    writeBudgets(store);

    return NextResponse.json({ success: true, budgets: store.budgets });
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update budget",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove budget
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");

    if (!provider) {
      return NextResponse.json(
        { success: false, error: "Provider is required" },
        { status: 400 }
      );
    }

    const store = readBudgets();
    store.budgets = store.budgets.filter((b) => b.provider !== provider);
    writeBudgets(store);

    return NextResponse.json({ success: true, budgets: store.budgets });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete budget",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
