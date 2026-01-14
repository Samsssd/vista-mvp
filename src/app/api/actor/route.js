import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

// Actor image templates
const ACTOR_IMAGES = {
  1: "https://vista-ia.s3.eu-north-1.amazonaws.com/manupromax.jpg", // Le M
  2: "https://vista-ia.s3.eu-north-1.amazonaws.com/catfish-promax.jpg", // Emma
};

// Convert base64 data URI to Blob
function dataUriToBlob(dataUri) {
  const arr = dataUri.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, requestId, videoData, actorId, videoUrl } = body;

    // Action: Check status
    if (action === "status") {
      const status = await fal.queue.status("fal-ai/kling-video/v2.6/standard/motion-control", {
        requestId,
        logs: true,
      });
      
      return NextResponse.json({
        status: status.status,
        logs: status.logs || [],
        queuePosition: status.queue_position,
      });
    }

    // Action: Get result
    if (action === "result") {
      const result = await fal.queue.result("fal-ai/kling-video/v2.6/standard/motion-control", {
        requestId,
      });

      return NextResponse.json({
        success: true,
        video: result.data.video,
        requestId: result.requestId,
      });
    }

    // Action: Upload video to fal storage
    if (action === "upload") {
      if (!videoData) {
        return NextResponse.json(
          { error: "Missing videoData" },
          { status: 400 }
        );
      }

      const blob = dataUriToBlob(videoData);
      const uploadedUrl = await fal.storage.upload(blob);

      return NextResponse.json({
        success: true,
        videoUrl: uploadedUrl,
      });
    }

    // Action: Submit generation (default)
    if (!videoUrl || !actorId) {
      return NextResponse.json(
        { error: "Missing videoUrl or actorId" },
        { status: 400 }
      );
    }

    const imageUrl = ACTOR_IMAGES[actorId];
    if (!imageUrl) {
      return NextResponse.json(
        { error: "Invalid actor ID" },
        { status: 400 }
      );
    }

    // Submit the generation request
    // Note: For actor, image_url is the actor, video_url is the user's video
    const { request_id } = await fal.queue.submit("fal-ai/kling-video/v2.6/standard/motion-control", {
      input: {
        image_url: imageUrl,
        video_url: videoUrl,
        character_orientation: "video",
        keep_original_sound: true,
      },
    });

    return NextResponse.json({
      success: true,
      requestId: request_id,
      message: "Génération démarrée",
    });

  } catch (error) {
    console.error("Fal AI Actor Error:", error);
    console.error("Error body:", error.body);
    
    // Extract detailed error message
    let errorMessage = error.message || "Erreur lors de la génération";
    if (error.body?.detail) {
      if (Array.isArray(error.body.detail)) {
        errorMessage = error.body.detail.map(d => d.msg || d.message || JSON.stringify(d)).join(", ");
      } else {
        errorMessage = error.body.detail;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Increase timeout for this route
export const maxDuration = 60; // 60 seconds
