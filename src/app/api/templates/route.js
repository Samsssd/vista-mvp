import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");

    const { db } = await connectToDatabase();

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (active !== null) {
      query.isActive = active === "true";
    }

    // Fetch templates
    const templates = await db
      .collection("memeTemplates")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Transform _id to id for frontend
    const result = templates.map((t) => ({
      ...t,
      id: t._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Templates API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
