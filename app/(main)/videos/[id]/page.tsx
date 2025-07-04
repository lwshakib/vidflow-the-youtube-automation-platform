"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Palette,
  PlayCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConnectYoutubeButton from "../../_components/connect-youtube-button";
import RemotionPlayer from "../../_components/remotion-player";

type Props = {};

const fetchVideoDetails = async (params: any) => {
  const response = await fetch(`/api/videos/${params.id}`, {
    method: "GET",
  });
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message);
  return data.data;
};

function page({}: Props) {
  const params = useParams();
  const { userId } = useAuth();

  const {
    data: videoData,
    error,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["videoDetails", params?.id],
    queryFn: () => fetchVideoDetails(params),
  });

  const [hasYoutubeToken, setHasYoutubeToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("google_token_for_youtube_access");
      setHasYoutubeToken(!!token);
    }
  }, []);

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  // Format duration (seconds to mm:ss)
  const formatDuration = (seconds: number) => {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Download handler
  const handleDownload = () => {
    if (videoData?.videoUrl) {
      window.open(videoData.videoUrl, "_blank");
    }
  };

  const handleUploadToYoutube = async () => {
    const response = await fetch("/api/upload/youtube", {
      method: "POST",
      body: JSON.stringify({
        videoUrl: videoData.videoUrl,
        userId: userId,
        script: videoData.script,
        accessToken: localStorage.getItem("google_token_for_youtube_access"),
      }),
    });
    const data = await response.json();
    if (data.success) {
      toast.success(data.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 p-2 sm:p-4 md:p-8 w-full h-full max-w-full overflow-x-hidden">
      {loading ? (
        <>
          <div className="flex flex-col items-center justify-center">
            <Skeleton className="w-full aspect-video rounded-lg mb-4" />
            <div className="flex flex-col items-center mt-4">
              <div className="animate-spin text-zinc-400 mb-2">
                <PlayCircle size={32} />
              </div>
              <div className="text-zinc-400">Loading video details...</div>
            </div>
          </div>
          <div className="flex flex-col gap-6 bg-zinc-900 rounded-xl p-6 justify-between shadow-lg border border-zinc-800 min-h-[400px]">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full mt-6" />
          </div>
        </>
      ) : error ? (
        <div className="col-span-2 flex flex-col items-center justify-center py-20">
          <XCircle className="text-red-500 mb-2" size={48} />
          <div className="text-red-400 font-semibold text-xl mb-2">
            Failed to load video details
          </div>
          <div className="text-zinc-400 mb-4">
            {error.message || "An error occurred."}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
            aria-label="Retry loading video details"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="mt-4 text-zinc-400 hover:text-white underline"
            aria-label="Back to Dashboard"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col justify-center items-center gap-4">
            {videoData ? (
              <div className="w-full aspect-[2/3] flex justify-center">
                <RemotionPlayer videoData={videoData} />
              </div>
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center bg-zinc-800 rounded-lg border border-zinc-700 text-zinc-400">
                No preview available
              </div>
            )}
          </div>
          <div className="w-full h-full">
            <div className="bg-zinc-900 border-zinc-800 w-full h-auto rounded-xl p-4 sm:p-6 md:p-8 m-2 sm:m-4 shadow-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center text-sm text-zinc-400 hover:text-white gap-2 group max-w-full sm:max-w-xs"
                    aria-label="Back to Dashboard"
                  >
                    <ArrowLeft className="transition group-hover:-translate-x-1" />
                    <span className="hidden sm:inline-block">
                      Back to Dashboard
                    </span>
                  </Link>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-zinc-400" size={18} />
                  <div className="font-semibold text-lg text-white">
                    {videoData?.title || "Untitled"}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="text-zinc-400" size={18} />
                  <span className="font-medium text-white">
                    {videoData?.videoStyle || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <Clock className="text-zinc-400" size={16} />
                  <span className="text-zinc-300 text-sm">
                    Duration: {formatDuration(videoData?.duration)}
                  </span>
                  <Calendar className="text-zinc-400" size={16} />
                  <span className="text-zinc-300 text-sm">
                    Created: {formatDate(videoData?.createdAt)}
                  </span>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <div className="text-zinc-200 text-sm whitespace-pre-line">
                    <span className="font-semibold">Script:</span>{" "}
                    {videoData?.script || "No script available."}
                  </div>
                </div>
              </div>
              <Button
                className="w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 text-base sm:text-lg"
                variant="outline"
                onClick={handleDownload}
                aria-label="Export and Download Video"
              >
                <Download />
                Export & Download
              </Button>
            </div>
            <div className="bg-zinc-900 border-zinc-800 w-full h-auto rounded-xl p-4 sm:p-6 md:p-8 m-2 sm:m-4 shadow-xl">
              {hasYoutubeToken ? (
                <Button onClick={handleUploadToYoutube}>
                  Upload To youtube
                </Button>
              ) : (
                <ConnectYoutubeButton />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default page;
