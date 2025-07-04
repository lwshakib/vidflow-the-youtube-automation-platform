import { inngest } from "@/lib/inngest/client";
import {
  generateVideoData,
  helloWorld,
  uploadVideoOnYoutube,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
    generateVideoData,
    uploadVideoOnYoutube,
  ],
});
