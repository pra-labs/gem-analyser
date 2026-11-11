import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Bid } from "@/types/bid";

interface StoredBid extends Bid {
  priority_tier?: string;
  ministry?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.toLowerCase();
    const tier = searchParams.get("tier"); // HIGH, MEDIUM, LOW
    const ministry = searchParams.get("ministry")?.toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const dataFilePath = path.join(process.cwd(), "public", "data", "bids.json");

    let fileContent: string;
    try {
      fileContent = await fs.readFile(dataFilePath, "utf-8");
    } catch {
      // Fallback in local monorepo root
      const fallbackPath = path.resolve(process.cwd(), "..", "data", "bids.json");
      fileContent = await fs.readFile(fallbackPath, "utf-8");
    }

    const data = JSON.parse(fileContent);
    let results: StoredBid[] = data.bids || [];

    // Filter by query if provided
    if (query) {
      results = results.filter((b) => {
        const text = `${b.title || ""} ${b.category || ""} ${b.full_categories || ""} ${b.department || ""} ${(b.matched_keywords || []).join(" ")}`.toLowerCase();
        return text.includes(query);
      });
    }

    // Filter by priority tier if provided
    if (tier) {
      results = results.filter((b) => b.priority_tier?.toUpperCase() === tier.toUpperCase());
    }

    // Filter by ministry if provided
    if (ministry) {
      results = results.filter((b) => (b.ministry || "").toLowerCase().includes(ministry));
    }

    return NextResponse.json({
      updated_at: data.updated_at,
      total_matched: results.length,
      total_bids: data.total_bids,
      bids: results.slice(0, limit),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch bids", details: message },
      { status: 500 }
    );
  }
}
