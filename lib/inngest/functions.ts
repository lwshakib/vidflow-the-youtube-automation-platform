import { EmailTemplate } from "@/components/templates/video-uploaded-email-template";
import {
  IMAGE_PROMPT_SCRIPT,
  YOUTUBE_METADATA_GENERATE_SCRIPT,
} from "@/constants/prompt";
import { aws_config } from "@/lib/aws/client";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  getFunctions,
  getRenderProgress,
  renderMediaOnLambda,
} from "@remotion/lambda/client";
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
    return { message: `Hello ${event.data.email}!` };
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
