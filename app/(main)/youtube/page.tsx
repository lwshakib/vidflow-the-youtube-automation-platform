"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConnectYoutubeButton from "../_components/connect-youtube-button";

// Type for YouTube channel data
export type YoutubeChannel = {
  id: string;
  snippet?: {
    title?: string;
    description?: string;
    customUrl?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url: string };
      medium?: { url: string };
      high?: { url: string };
    };
    country?: string;
  };
  statistics?: {
    viewCount?: string;
    subscriberCount?: string;
    hiddenSubscriberCount?: boolean;
    videoCount?: string;
  };
};

type Props = {};

function page({}: Props) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [channel, setChannel] = useState<YoutubeChannel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkYouTubeStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/youtube/status");
      const data = await response.json();

      if (data.success) {
        setIsConnected(data.connected);
        if (data.connected && data.channel) {
          setChannel(data.channel);
        } else {
          setChannel(null);
        }
      } else {
        setIsConnected(false);
        setChannel(null);
        toast.error(data.message || "Failed to check YouTube status");
      }
    } catch (error) {
      console.error("Error checking YouTube status:", error);
      setIsConnected(false);
      setChannel(null);
      toast.error("Failed to check YouTube status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkYouTubeStatus();
  }, []);

  const handleRemove = async () => {
    try {
      const response = await fetch("/api/youtube/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(false);
        setChannel(null);
        toast.success("YouTube account disconnected successfully.");
      } else {
        toast.error(data.message || "Failed to disconnect YouTube account");
      }
    } catch (error) {
      console.error("Error disconnecting YouTube account:", error);
      toast.error("Failed to disconnect YouTube account");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">YouTube Account</CardTitle>
            <CardDescription>Checking connection status...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">YouTube Account</CardTitle>
          <CardDescription>
            {isConnected
              ? "Your YouTube account is connected. You can disconnect it below."
              : "Connect your YouTube account to enable video uploads."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {/* Show channel info if available */}
          {isConnected && channel && (
            <div className="flex flex-col items-center gap-2 mb-6">
              <img
                src={
                  channel.snippet?.thumbnails?.high?.url ||
                  channel.snippet?.thumbnails?.medium?.url ||
                  channel.snippet?.thumbnails?.default?.url ||
                  "/logo.svg"
                }
                alt={channel.snippet?.title || "Channel Thumbnail"}
                className="rounded-full w-24 h-24 object-cover"
              />
              <div className="text-lg font-semibold">
                {channel.snippet?.title || "No Title"}
              </div>
              <div className="text-sm text-muted-foreground">
                {channel.snippet?.description || "No Description"}
              </div>
              <div className="text-xs text-muted-foreground">
                Subscribers: {channel.statistics?.subscriberCount ?? "N/A"}
                {" | "}
                Videos: {channel.statistics?.videoCount ?? "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                Channel ID: {channel.id}
              </div>
              <div className="text-xs text-muted-foreground">
                Custom URL: {channel.snippet?.customUrl ?? "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">
                Channel URL:{" "}
                {channel.snippet?.customUrl ? (
                  <a
                    href={`https://www.youtube.com/${channel.snippet.customUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {`youtube.com/${channel.snippet.customUrl}`}
                  </a>
                ) : (
                  <a
                    href={`https://www.youtube.com/channel/${channel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {`youtube.com/channel/${channel.id}`}
                  </a>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Country: {channel.snippet?.country ?? "N/A"}
              </div>
            </div>
          )}
          {isConnected ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg">
                  Remove YouTube Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect YouTube?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to disconnect your YouTube account?
                    You will need to reconnect to upload videos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove} autoFocus>
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <ConnectYoutubeButton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
