/**
 * Seed script for meme templates
 * Run with: node scripts/seed-templates.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

const templates = [
  {
    name: "Bonjour Princesse",
    previewUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__149_0.mp4",
    description: "Faites dire 'Bonjour Princesse' à votre personnage",
    category: "video",
    subcategory: "greeting",
    aiConfig: {
      modelName: "fal-ai/kling-video/v2.6/standard/motion-control",
      modelType: "motion-control",
      inputType: "image",
      inputRecommendation: "Uploadez une photo de visage claire",
      requestPrompt: {
        motionVideoUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/bjr_princesseeee.mp4",
      },
      responseType: "url",
    },
    analytics: {
      views: 0,
      likes: 0,
      shares: 0,
    },
    keywords: ["bonjour", "princesse", "greeting", "funny"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Dance",
    previewUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
    description: "Faites danser votre personnage",
    category: "video",
    subcategory: "dance",
    aiConfig: {
      modelName: "fal-ai/kling-video/v2.6/standard/motion-control",
      modelType: "motion-control",
      inputType: "image",
      inputRecommendation: "Uploadez une photo de visage claire",
      requestPrompt: {
        motionVideoUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/vista_20260113_Motion_Control__314_0.mp4",
      },
      responseType: "url",
    },
    analytics: {
      views: 0,
      likes: 0,
      shares: 0,
    },
    keywords: ["dance", "dancing", "funny", "moves"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Balai Volant",
    previewUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/kling_20260115_Image_to_Video_Subject__C_1349_0.mp4",
    description: "Faites voler votre personnage sur un balai magique",
    category: "video",
    subcategory: "fantasy",
    aiConfig: {
      modelName: "fal-ai/kling-video/v2.6/pro/image-to-video",
      modelType: "image-to-video",
      inputType: "image",
      inputRecommendation: "Uploadez une photo de visage ou corps entier",
      requestPrompt: {
        prompt: "Subject: Cinematic shot of the subject standing on a realistic city street. The Arrival: A vintage wooden broomstick zooms into the frame from the side, hovering perfectly steady at hip-height. The bundle of straw bristles is positioned at the rear end, facing backward like a tailpipe. The Action: The subject naturally hops onto the broomstick, straddling it like a motorcycle. The Departure: Leaning forward like a biker, they accelerate rapidly down the street, weaving slightly through the air. The straw bristles at the back trail behind as they fly away into the distance. Style: Realistic urban fantasy, 8k, heavy depth of field, natural lighting.",
      },
      responseType: "url",
    },
    analytics: {
      views: 0,
      likes: 0,
      shares: 0,
    },
    keywords: ["balai", "volant", "broom", "flying", "magic", "fantasy"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  if (!MONGODB_URI || !MONGODB_DB) {
    console.error("Missing MONGODB_URI or MONGODB_DB environment variables");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(MONGODB_DB);

  console.log("Clearing existing templates...");
  await db.collection("memeTemplates").deleteMany({});

  console.log("Inserting templates...");
  const result = await db.collection("memeTemplates").insertMany(templates);

  console.log(`✅ Seeded ${result.insertedCount} templates`);

  await client.close();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
