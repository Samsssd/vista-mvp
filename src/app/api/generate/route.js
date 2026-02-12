import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

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
    const { action, requestId, imageData, templateId, imageUrl, modelName: providedModelName } = body;

    // Action: Check status
    if (action === "status") {
      // Use provided model name or default to motion-control
      const modelEndpoint = providedModelName || "fal-ai/kling-video/v2.6/standard/motion-control";
      const status = await fal.queue.status(modelEndpoint, {
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
      // Use provided model name or default to motion-control
      const modelEndpoint = providedModelName || "fal-ai/kling-video/v2.6/standard/motion-control";
      const result = await fal.queue.result(modelEndpoint, {
        requestId,
      });

      return NextResponse.json({
        success: true,
        video: result.data.video,
        requestId: result.requestId,
      });
    }

    // Action: Upload image to fal storage
    if (action === "upload") {
      if (!imageData) {
        return NextResponse.json(
          { error: "Missing imageData" },
          { status: 400 }
        );
      }

      const blob = dataUriToBlob(imageData);
      const uploadedUrl = await fal.storage.upload(blob);

      return NextResponse.json({
        success: true,
        imageUrl: uploadedUrl,
      });
    }

    // Action: Submit generation (default)
    if (!imageUrl || !templateId) {
      return NextResponse.json(
        { error: "Missing imageUrl or templateId" },
        { status: 400 }
      );
    }

    // Fetch template from MongoDB
    const { db } = await connectToDatabase();
    const template = await db.collection("memeTemplates").findOne({
      _id: new ObjectId(templateId),
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const modelName = template.aiConfig?.modelName;
    const modelType = template.aiConfig?.modelType;
    const requestPrompt = template.aiConfig?.requestPrompt;

    if (!modelName) {
      return NextResponse.json(
        { error: "Template missing model configuration" },
        { status: 400 }
      );
    }

    let submitInput;

    // Handle different model types
    if (modelType === "image-to-video") {
      // Image-to-video model: uses prompt and start_image_url
      const prompt = requestPrompt?.prompt;
      if (!prompt) {
        return NextResponse.json(
          { error: "Template missing prompt configuration" },
          { status: 400 }
        );
      }

      submitInput = {
        prompt: prompt,
        start_image_url: imageUrl,
      };
    } else {
      // Motion-control model (default): uses video_url and image_url
      const motionVideoUrl = requestPrompt?.motionVideoUrl;
      if (!motionVideoUrl) {
        return NextResponse.json(
          { error: "Template missing motion video configuration" },
          { status: 400 }
        );
      }

      submitInput = {
        image_url: imageUrl,
        video_url: motionVideoUrl,
        character_orientation: "video",
        keep_original_sound: true,
      };
    }

    // Submit the generation request
    const { request_id } = await fal.queue.submit(modelName, {
      input: submitInput,
    });

    return NextResponse.json({
      success: true,
      requestId: request_id,
      modelName: modelName,
      message: "Génération démarrée",
    });

  } catch (error) {
    console.error("Fal AI Error:", error);
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
