import { EmailTemplate } from "@/components/templates/video-uploaded-email-template";
import {
  IMAGE_PROMPT_SCRIPT,
  YOUTUBE_METADATA_GENERATE_SCRIPT,
} from "@/constants/prompt";
import { aws_config } from "@/lib/aws/client";
import { googleClientId, googleClientSecret } from "@/lib/env/config";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Modality } from "@google/genai";
import {
  getFunctions,
  getRenderProgress,
  renderMediaOnLambda,
} from "@remotion/lambda/client";
import axios from "axios";
import { google } from "googleapis";
import https from "https";
import { Resend } from "resend";
import { resendApiKey } from "../env/config";
import { ai } from "../gemini/client";
import { openAIClient } from "../openai/client";
import { prisma } from "../prisma";
import { inngest } from "./client";

const { createClient } = require("@deepgram/sdk");
const resend = new Resend(resendApiKey);

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  }
);

async function streamToBuffer(stream: any) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// 🎯 S3 upload target
const BUCKET_NAME = "vidflow2025"; // Replace with your bucket name

const pollyClient = new PollyClient(aws_config as any);
const s3Client = new S3Client(aws_config as any);

export const generateVideoData = inngest.createFunction(
  { id: "generate-video-data" },
  { event: "generate-video-data" },
  async ({ event, step }) => {
    const { script, topic, title, caption, videoStyle, voice, userId } =
      event?.data;

    if (!script || !voice) {
      return "All fields required and user must be authenticated";
    }

    const createDBInstance = await step.run(
      "Create New Video Data",
      async () => {
        const newVideo = await prisma.videoData.create({
          data: {
            title,
            script,
            captionStyle: caption,
            videoStyle,
            voice,
            clerkId: userId,
          },
        });
        return newVideo?.id;
      }
    );

    const generateAudioFile = await step.run("GenerateAudioFile", async () => {
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-"); // Replace invalid characters
      const OBJECT_KEY = `audio/${timestamp}.mp3`; // Safe path inside the bucket

      const input = {
        Engine: "neural",
        LanguageCode: "en-US",
        OutputFormat: "mp3",
        Text: script + "   ",
        TextType: "text",
        VoiceId: voice.toString(),
      };

      const command = new SynthesizeSpeechCommand(input as any);
      const response = await pollyClient.send(command);
      if (!response.AudioStream) {
        throw new Error("No AudioStream received from Polly.");
      }

      const audioBuffer = await streamToBuffer(response.AudioStream);
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: OBJECT_KEY,
        Body: audioBuffer,
        ContentType: "audio/mpeg",
      });

      await s3Client.send(putCommand);

      const cmd = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: OBJECT_KEY,
      });

      const url = await getSignedUrl(s3Client, cmd);
      return url.split("?")[0];
    });

    const generateCaptions = await step.run("GenerateCaptions", async () => {
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

      // STEP 2: Call the transcribeUrl method with the audio payload and options
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
        {
          url: generateAudioFile,
        },
        // STEP 3: Configure Deepgram options for audio analysis
        {
          model: "nova-3",
          smart_format: true,
        }
      );
      if (error) throw error;
      return result.results.channels[0]?.alternatives[0].words;
    });

    const generateImagePrompts = await step.run(
      "GenerateImagePrompts",
      async () => {
        const prompt = IMAGE_PROMPT_SCRIPT.replace(
          "{{STYLE}}",
          videoStyle
        ).replace("{{SCRIPT}}", script);
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        return JSON.parse(response.text as string);
      }
    );

    const generateImages = await step.run("GenerateImages", async () => {
      let images = [];
      images = await Promise.all(
        generateImagePrompts.map(async (el: any, index: number) => {
          const response = await openAIClient.images.generate({
            model: "black-forest-labs/flux-schnell",
            response_format: "url",
            // @ts-expect-error
            response_extension: "png",
            width: 720,
            height: 1080,
            num_inference_steps: 4,
            negative_prompt: "",
            seed: -1,
            prompt: el?.imagePrompt,
          });
          if (response?.data?.[0]?.url) {
            return response?.data[0]?.url;
          }
        })
      );
      return images;
    });

    const renderVideo = await step.run("renderVideo", async () => {
      const functions = await getFunctions({
        region: "ap-south-1",
        compatibleOnly: true,
      });

      const functionName = functions[0].functionName;

      const { renderId, bucketName } = await renderMediaOnLambda({
        region: "ap-south-1",
        functionName,
        serveUrl: process.env.AWS_REMOTION_SERVE_URL as string,
        composition: "vidflow",
        inputProps: {
          videoData: {
            images: generateImages,
            audioUrl: generateAudioFile,
            captions: generateCaptions,
          },
        },
        codec: "h264",
        imageFormat: "png",
        maxRetries: 1,
        framesPerLambda: 20,
        privacy: "public",
      });

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const progress = await getRenderProgress({
          renderId,
          bucketName,
          functionName,
          region: "ap-south-1",
        });
        if (progress.done) {
          console.log("Render finished!", progress.outputFile);
          return progress.outputFile;
          process.exit(0);
        }
        if (progress.fatalErrorEncountered) {
          console.error("Error enountered", progress.errors);
          return { message: "Error", data: progress.errors };
          process.exit(1);
        }
      }
    });

    const updateDBInstance = await step.run("Update Video Data", async () => {
      const updatedVideoData = await prisma.videoData.update({
        where: {
          id: createDBInstance,
        },
        data: {
          videoProgress: "COMPLETED",
          images: generateImages,
          captions: generateCaptions,
          audioUrl: generateAudioFile,
          videoUrl: renderVideo?.toString(),
        },
      });
      return updatedVideoData;
    });

    return updateDBInstance;
  }
);

export const generateThumbnails = inngest.createFunction(
  { id: "generate-thumbnails" },
  { event: "generate-thumbnails" },
  async ({ event, step }) => {
    const { title, description, imageUrls, userId, fileNames } = event?.data;

    if (!title || !description || !imageUrls || !userId) {
      return "All fields required for thumbnail generation";
    }

    const createThumbnailRequest = await step.run(
      "Create Thumbnail Request Record",
      async () => {
        const thumbnailRequest = await prisma.thumbnailRequest.create({
          data: {
            title,
            description,
            clerkId: userId,
            status: "PROCESSING",
          },
        });
        return thumbnailRequest?.id;
      }
    );

    const generateThumbnailVariations = await step.run(
      "Generate Thumbnail Variations",
      async () => {
        const generatedThumbnails = [];

        for (let i = 0; i < 3; i++) {
          try {
            let contents: Array<{
              text?: string;
              inlineData?: { mimeType: string; data: string };
            }> = [
              {
                text: `
You are a world-class YouTube thumbnail designer specializing in creating thumbnails that directly reflect the unique themes and emotional hooks of the provided video title and description${imageUrls && imageUrls.length > 0 ? ", as well as the specific images supplied" : ""}.

Input:

Video Title: "${title}"

Video Description: "${description}"

Instructions:
Identify the core theme and emotional hook strictly from the given title and description. Avoid defaulting to AI or technology themes unless explicitly relevant.
${imageUrls && imageUrls.length > 0 ? "Use the provided images as the primary visual foundation. Incorporate or highlight them creatively to enhance storytelling." : "Create a completely original thumbnail concept based on the title and description."}
Add minimal, bold, and relevant text only if it boosts curiosity or emotional connection, without repeating the title.
Design for high impact on both mobile and desktop, focusing on clarity, vibrancy, and visual storytelling that matches the content.
Do NOT default to AI or tech imagery unless the video topic clearly relates to those subjects.
Return a single, distinct thumbnail concept${imageUrls && imageUrls.length > 0 ? " that integrates the supplied images and visual elements relevant to the video content." : " based solely on the title and description."}
Do NOT Copy any Image Totally I have Provided 

Output the thumbnail image only.
                `,
              },
            ];

            // Add reference images if provided
            if (imageUrls && imageUrls.length > 0) {
              const base64Images = await Promise.all(
                imageUrls.map(async (imageUrl: string) => {
                  const response = await axios.get(imageUrl, {
                    responseType: "arraybuffer",
                  });
                  const buffer = Buffer.from(response.data, "binary");
                  return buffer.toString("base64");
                })
              );

              contents = [
                ...contents,
                ...base64Images.map((base64Image: string) => ({
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                  },
                })),
              ];
            }

            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash-preview-image-generation",
              contents,
              config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
              },
            });

            const part = response?.candidates?.[0]?.content?.parts?.find(
              (p) => p.inlineData?.data
            );

            if (part && part.inlineData?.data) {
              const buffer = Buffer.from(part.inlineData.data, "base64");

              const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
              const objectKey = `thumbnails/${userId}/${timestamp}-thumbnail-${i + 1}.png`;

              const putCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
                Body: buffer,
                ContentType: "image/png",
              });

              await s3Client.send(putCommand);

              const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
              });

              const signedUrl = await getSignedUrl(s3Client, getCommand);
              const publicUrl = signedUrl.split("?")[0];

              generatedThumbnails.push({
                id: i + 1,
                thumbnailUrl: publicUrl,
                originalName: `thumbnail-${i + 1}.png`,
                size: buffer.length,
                s3Key: objectKey,
              });
            }
          } catch (error) {
            console.error(`Error generating thumbnail ${i + 1}:`, error);
          }
        }

        return generatedThumbnails;
      }
    );

    const updateThumbnailRequest = await step.run(
      "Update Thumbnail Request Status",
      async () => {
        const updatedRequest = await prisma.thumbnailRequest.update({
          where: {
            id: createThumbnailRequest,
          },
          data: {
            status: "COMPLETED",
            thumbnails: generateThumbnailVariations,
          },
        });
        return updatedRequest;
      }
    );

    const cleanupReferenceImages = await step.run(
      "Cleanup Reference Images",
      async () => {
        try {
          const objectKeys = imageUrls.map((url: string) => {
            const urlParts = url.split("/");
            return urlParts.slice(3).join("/");
          });

          await Promise.all(
            objectKeys.map(async (key: string) => {
              const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
              });
              await s3Client.send(deleteCommand);
            })
          );

          return "Reference images cleaned up successfully";
        } catch (error) {
          console.error("Error cleaning up reference images:", error);
          return "Cleanup failed but thumbnails were generated successfully";
        }
      }
    );

    return {
      requestId: createThumbnailRequest,
      thumbnails: generateThumbnailVariations,
      status: "COMPLETED",
    };
  }
);

export const uploadVideoOnYoutube = inngest.createFunction(
  { id: "upload-video-on-youtube" },
  { event: "upload-video-on-youtube" },
  async ({ event, step }) => {
    const { accessToken, userId, script, videoUrl } = event?.data;

    if (!accessToken || !videoUrl) return "All fields required";

    const generateDataForYoutubeVideo = await step.run(
      "generateSEOBasedDataForVideo",
      async () => {
        const prompt = YOUTUBE_METADATA_GENERATE_SCRIPT.replace(
          "{{SCRIPT}}",
          script
        );
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        return JSON.parse(response.text as string);
      }
    );

    const uploadVideo = await step.run("uploadVideo", async () => {
      // Create OAuth2 client and set credentials
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Function to get readable stream from HTTPS URL
      const getVideoStream = (url: string): Promise<NodeJS.ReadableStream> => {
        return new Promise((resolve, reject) => {
          https
            .get(url, (res) => {
              if (res.statusCode !== 200) {
                reject(
                  new Error(
                    `Failed to fetch video. Status code: ${res.statusCode}`
                  )
                );
                res.resume(); // Consume response data to free memory
                return;
              }
              resolve(res);
            })
            .on("error", reject);
        });
      };

      try {
        const videoStream = await getVideoStream(videoUrl);

        const uploadResponse = await youtube.videos.insert({
          part: "snippet,status" as any,
          requestBody: {
            snippet: {
              title: generateDataForYoutubeVideo.title,
              description: generateDataForYoutubeVideo.description,
              tags: generateDataForYoutubeVideo.tags,
            },
            status: {
              privacyStatus: "public",
            },
          },
          media: {
            body: videoStream,
          },
        });

        return uploadResponse.data;
      } catch (err: any) {
        console.error("Upload failed:", err);
        return err?.message;
      }
    });

    const sendEmailToUser = await step.run("sendEmailToUser", async () => {
      const user = await prisma.user.findUnique({
        where: {
          clerkId: userId,
        },
      });

      if (!user) return "User not Found";

      const emailObj = {
        name: user.name,
        videoUrl: `https://www.youtube.com/watch?v=${uploadVideo.id}`,
        channelName: uploadVideo.snippet.channelTitle,
        videoTitle: uploadVideo.snippet.title,
        videoDescription: uploadVideo.snippet.description,
        videoTags: uploadVideo.snippet.tags,
        videoThumbnail: uploadVideo.snippet.thumbnails.medium,
      };

      try {
        const { data, error } = await resend.emails.send({
          from: "Acme <onboarding@resend.dev>",
          to: [user?.email],
          subject: "Upload complete: Your video is now on YouTube",
          react: EmailTemplate(emailObj),
        });

        if (error) {
          return { error };
        }

        return { data };
      } catch (error) {
        return { error };
      }
    });

    return { generateDataForYoutubeVideo, uploadVideo, sendEmailToUser };
  }
);

export const generateLogos = inngest.createFunction(
  { id: "generate-logos" },
  { event: "generate-logos" },
  async ({ event, step }) => {
    const { logoName, description, logoUrls, userId, fileNames } = event?.data;

    if (!logoName || !description || !userId) {
      return "Logo name, description, and user ID are required for logo generation";
    }

    const createLogoRequest = await step.run(
      "Create Logo Request Record",
      async () => {
        const logoRequest = await prisma.logoRequest.create({
          data: {
            logoName,
            description,
            clerkId: userId,
            status: "PROCESSING",
          },
        });
        return logoRequest?.id;
      }
    );

    const generateLogoVariations = await step.run(
      "Generate Logo Variations",
      async () => {
        const generatedLogos = [];

        for (let i = 0; i < 3; i++) {
          try {
            let contents: Array<{
              text?: string;
              inlineData?: { mimeType: string; data: string };
            }> = [
              {
                text: `
You are a world-class logo designer tasked with creating a distinct, versatile, and professional logo based on:

- Logo Name: "${logoName}"
- Brand Description: "${description}"

Instructions:
• Extract core brand themes and values from the name and description.
${logoUrls && logoUrls.length > 0 ? "• Use supplied reference logos only as inspiration—do not replicate." : "• Create a completely original logo concept based on the brand name and description."}
• Incorporate design elements like color palette, composition, or abstract forms that align with the brand’s identity.
• Design a bold, memorable, scalable logo with clean, modern, and professional aesthetics.
• Ensure flawless performance across all digital and print platforms.
• Focus exclusively on visual symbolism or abstract elements—do NOT include any text or typography in the logo.
• Deliver one final logo concept as an image only—no text, watermark, or explanation.

The logo must be visually powerful and able to stand alone as the definitive brand mark.
                `,
              },
            ];

            // Add reference logos if provided
            if (logoUrls && logoUrls.length > 0) {
              const base64Logos = await Promise.all(
                logoUrls.map(async (logoUrl: string) => {
                  const response = await axios.get(logoUrl, {
                    responseType: "arraybuffer",
                  });
                  const buffer = Buffer.from(response.data, "binary");
                  return buffer.toString("base64");
                })
              );

              contents = [
                ...contents,
                ...base64Logos.map((base64Logo: string) => ({
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Logo,
                  },
                })),
              ];
            }

            const response = await ai.models.generateContent({
              model: "gemini-2.0-flash-preview-image-generation",
              contents,
              config: {
                responseModalities: [Modality.TEXT, Modality.IMAGE],
              },
            });

            const part = response?.candidates?.[0]?.content?.parts?.find(
              (p) => p.inlineData?.data
            );

            if (part && part.inlineData?.data) {
              const buffer = Buffer.from(part.inlineData.data, "base64");

              const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
              const objectKey = `logos/${userId}/${timestamp}-logo-${i + 1}.png`;

              const putCommand = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
                Body: buffer,
                ContentType: "image/png",
              });

              await s3Client.send(putCommand);

              const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
              });

              const signedUrl = await getSignedUrl(s3Client, getCommand);
              const publicUrl = signedUrl.split("?")[0];

              generatedLogos.push({
                id: i + 1,
                logoUrl: publicUrl,
                originalName: `logo-${i + 1}.png`,
                size: buffer.length,
                s3Key: objectKey,
              });
            }
          } catch (error) {
            console.error(`Error generating logo ${i + 1}:`, error);
          }
        }

        return generatedLogos;
      }
    );

    const updateLogoRequest = await step.run(
      "Update Logo Request Status",
      async () => {
        const updatedRequest = await prisma.logoRequest.update({
          where: {
            id: createLogoRequest,
          },
          data: {
            status: "COMPLETED",
            logos: generateLogoVariations,
          },
        });
        return updatedRequest;
      }
    );

    const cleanupReferenceLogos = await step.run(
      "Cleanup Reference Logos",
      async () => {
        try {
          const objectKeys = logoUrls.map((url: string) => {
            const urlParts = url.split("/");
            return urlParts.slice(3).join("/");
          });

          await Promise.all(
            objectKeys.map(async (key: string) => {
              const deleteCommand = new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
              });
              await s3Client.send(deleteCommand);
            })
          );

          return "Reference logos cleaned up successfully";
        } catch (error) {
          console.error("Error cleaning up reference logos:", error);
          return "Cleanup failed but logos were generated successfully";
        }
      }
    );

    return {
      requestId: createLogoRequest,
      logos: generateLogoVariations,
      status: "COMPLETED",
    };
  }
);

// New function for scheduled upload tasks
export const scheduleUploadTask = inngest.createFunction(
  {
    id: "schedule-upload-task",
    cancelOn: [
      {
        event: "upload/cancelled",
        if: "event.data.scheduledUploadId == async.data.scheduledUploadId",
      },
    ],
  },
  { event: "upload/scheduled" },
  async ({ event, step }) => {
    const {
      scheduledUploadId,
      videoId,
      scheduledDate,
      timezone,
      description,
      userId,
    } = event.data;

    // Wait until the specified time
    await step.sleepUntil("wait-until-scheduled-time", scheduledDate);

    // Step 1: Update status to PROCESSING
    await step.run("update-status-processing", async () => {
      await prisma.scheduledUpload.update({
        where: { id: scheduledUploadId },
        data: { status: "PROCESSING" },
      });
      return "Status updated to PROCESSING";
    });

    // Step 2: Get user and refresh token
    const user = await step.run("get-user-and-token", async () => {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user?.youtubeRefreshToken) {
        throw new Error("No YouTube refresh token found for user");
      }

      return user;
    });

    // Step 3: Generate fresh access token
    const accessToken = await step.run("generate-access-token", async () => {
      const refreshResponse = await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: googleClientId || "",
            client_secret: googleClientSecret || "",
            refresh_token: user.youtubeRefreshToken,
            grant_type: "refresh_token",
          } as Record<string, string>),
        }
      );

      const refreshData = await refreshResponse.json();

      if (!refreshResponse.ok) {
        console.error("Token refresh failed:", refreshData);

        // If refresh token is invalid, remove it from database
        if (refreshResponse.status === 400 || refreshResponse.status === 401) {
          await prisma.user.update({
            where: { clerkId: userId },
            data: { youtubeRefreshToken: null },
          });
        }

        throw new Error("Failed to refresh YouTube access token");
      }

      return refreshData.access_token;
    });

    // Step 4: Get video data
    const video = await step.run("get-video-data", async () => {
      const video = await prisma.videoData.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error("Video not found");
      }

      return video;
    });

    // Step 5: Generate YouTube metadata
    const generateDataForYoutubeVideo = await step.run(
      "generate-youtube-metadata",
      async () => {
        const prompt = YOUTUBE_METADATA_GENERATE_SCRIPT.replace(
          "{{SCRIPT}}",
          video.script
        );
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        return JSON.parse(response.text as string);
      }
    );

    // Step 6: Upload video to YouTube
    const uploadVideo = await step.run("upload-video-to-youtube", async () => {
      // Create OAuth2 client and set credentials
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Function to get readable stream from HTTPS URL
      const getVideoStream = (url: string): Promise<NodeJS.ReadableStream> => {
        return new Promise((resolve, reject) => {
          https
            .get(url, (res) => {
              if (res.statusCode !== 200) {
                reject(
                  new Error(
                    `Failed to fetch video. Status code: ${res.statusCode}`
                  )
                );
                res.resume(); // Consume response data to free memory
                return;
              }
              resolve(res);
            })
            .on("error", reject);
        });
      };

      try {
        const videoStream = await getVideoStream(video.videoUrl!);

        const uploadResponse = await youtube.videos.insert({
          part: "snippet,status" as any,
          requestBody: {
            snippet: {
              title: generateDataForYoutubeVideo.title,
              description: generateDataForYoutubeVideo.description,
              tags: generateDataForYoutubeVideo.tags,
            },
            status: {
              privacyStatus: "public",
            },
          },
          media: {
            body: videoStream,
          },
        });

        return uploadResponse.data;
      } catch (err: any) {
        console.error("Upload failed:", err);
        throw new Error(err?.message || "Failed to upload video to YouTube");
      }
    });

    // Step 7: Send email notification
    const sendEmailToUser = await step.run(
      "send-email-notification",
      async () => {
        const emailObj = {
          name: user.name,
          videoUrl: `https://www.youtube.com/watch?v=${uploadVideo.id}`,
          channelName: uploadVideo.snippet?.channelTitle || "Unknown Channel",
          videoTitle: uploadVideo.snippet?.title || "Untitled Video",
          videoDescription:
            uploadVideo.snippet?.description || "No description available",
          videoTags: uploadVideo.snippet?.tags || [],
          videoThumbnail: {
            url: uploadVideo.snippet?.thumbnails?.medium?.url || "",
            height: uploadVideo.snippet?.thumbnails?.medium?.height || 0,
            width: uploadVideo.snippet?.thumbnails?.medium?.width || 0,
          },
        };

        try {
          const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: [user.email],
            subject: "Scheduled upload complete: Your video is now on YouTube",
            react: EmailTemplate(emailObj as any),
          });

          if (error) {
            console.error("Email send error:", error);
            return { error };
          }

          return { data };
        } catch (error) {
          console.error("Email send error:", error);
          return { error };
        }
      }
    );

    // Step 8: Update status to COMPLETED
    await step.run("update-status-completed", async () => {
      await prisma.scheduledUpload.update({
        where: { id: scheduledUploadId },
        data: { status: "COMPLETED" },
      });
      return "Status updated to COMPLETED";
    });

    return {
      generateDataForYoutubeVideo,
      uploadVideo,
      sendEmailToUser,
      message: "Scheduled upload completed successfully",
    };
  }
);
