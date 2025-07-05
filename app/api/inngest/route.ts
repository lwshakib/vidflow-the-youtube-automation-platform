import { inngest } from "@/lib/inngest/client";
import {
  generateLogos,
  generateThumbnails,
  generateVideoData,
  helloWorld,
  scheduleUploadTask,
  uploadVideoOnYoutube,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
    generateVideoData,
    uploadVideoOnYoutube,
    generateThumbnails,
    generateLogos,
    scheduleUploadTask,
  ],
});
