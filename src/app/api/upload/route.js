import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

// Increase timeout to 5 minutes for large video uploads
export const maxDuration = 300;

// Disable body size limit for this route
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`Uploading file: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Convert to blob for fal upload
    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type });

    // Upload to fal storage
    const uploadedUrl = await fal.storage.upload(blob);

    console.log("Upload successful:", uploadedUrl);

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
