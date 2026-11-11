import { NextResponse } from "next/server";
import { Bid, BidsData } from "@/types/bid";
import bidsDataJson from "@/data/bids.json";

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

    const data = bidsDataJson as unknown as BidsData;
    let results: StoredBid[] = (data.bids as StoredBid[]) || [];

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

    // Slice to limit
    const sliced = results.slice(0, Math.max(1, Math.min(limit, 500)));

    return NextResponse.json({
      status: "success",
      total_matched: results.length,
      count: sliced.length,
      updated_at: data.updated_at,
      bids: sliced,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      }
    });
  } catch (error) {
    console.error("API error in /api/bids:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to query bids dataset" },
      { status: 500 }
    );
  }
}
