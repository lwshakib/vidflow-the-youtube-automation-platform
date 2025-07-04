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
  const [ytToken, setYtToken] = useState<null | string>(null);
  const [channel, setChannel] = useState<YoutubeChannel | null>(null);

  const getYTChannelDetails = async (token: string) => {
    if (!token) return;
    const url =
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true";

    const youtubeRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If token is invalid or expired, remove it
    if (youtubeRes.status === 401 || youtubeRes.status === 403) {
      handleRemove();
      toast.error("YouTube session expired. Please reconnect your account.");
      return;
    }

    const data = await youtubeRes.json();
    if (data.items && data.items.length > 0) {
      setChannel(data.items[0]);
    } else {
      setChannel(null);
    }
  };

  useEffect(() => {
    const ytTokenFind = localStorage.getItem("google_token_for_youtube_access");
    if (ytTokenFind) {
      setYtToken(ytTokenFind);
      getYTChannelDetails(ytTokenFind);
    }
  }, []);

  const handleRemove = () => {
    localStorage.removeItem("google_token_for_youtube_access");
    setYtToken(null);
    setChannel(null);
    toast.success("YouTube account disconnected.");
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">YouTube Account</CardTitle>
          <CardDescription>
            {ytToken
              ? "Your YouTube account is connected. You can disconnect it below."
              : "Connect your YouTube account to enable video uploads."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {/* Show channel info if available */}
          {ytToken && channel && (
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
          {ytToken ? (
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
