"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCcw } from "lucide-react";

type ThumbnailItem = {
  id: number;
  thumbnailUrl: string;
  originalName: string;
  size: number;
  s3Key: string;
};

type ThumbnailRequest = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  thumbnails?: ThumbnailItem[];
  createdAt: string;
  updatedAt: string;
};

const fetchThumbnailRequests = async () => {
  const response = await fetch("/api/thumbnails");
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch thumbnails");
  }

  return result.data;
};

type Props = {};

function page({}: Props) {
  const {
    data: thumbnailData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["thumbnails"],
    queryFn: fetchThumbnailRequests,
    refetchInterval: 5000, // ← poll every 5 seconds
  });

  const thumbnailRequests = thumbnailData?.requests || [];

  const handleDownload = (thumbnailUrl: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = thumbnailUrl;
    link.download = originalName;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              Loading your thumbnails...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>My Thumbnails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                {error.message || "An error occurred while fetching thumbnails"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (thumbnailRequests.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>My Thumbnails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No thumbnails found. Create your first thumbnail to get started.
              </p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/thumbnail-generator")}
              >
                Create Thumbnail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Thumbnails</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => (window.location.href = "/thumbnail-generator")}
          >
            Create New Thumbnail
          </Button>
        </div>
      </div>

      {thumbnailRequests.map((request: ThumbnailRequest) => (
        <Card key={request.id} className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg">{request.title}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({request.status})
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {request.description}
            </p>
          </CardHeader>
          <CardContent>
            {request.status === "COMPLETED" &&
            request.thumbnails &&
            request.thumbnails.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated {request.thumbnails.length} thumbnail variations
                </div>

                <Carousel className="w-full max-w-3xl mx-auto">
                  <CarouselContent>
                    {request.thumbnails.map((thumbnail: ThumbnailItem) => (
                      <CarouselItem
                        key={thumbnail.id}
                        className="md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-video items-center justify-center p-6">
                              <img
                                src={thumbnail.thumbnailUrl}
                                alt={`Thumbnail ${thumbnail.id}`}
                                className="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                              />
                            </CardContent>
                          </Card>
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium">
                              Variation {thumbnail.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(thumbnail.size / 1024).toFixed(1)} KB
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                handleDownload(
                                  thumbnail.thumbnailUrl,
                                  thumbnail.originalName
                                )
                              }
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            ) : request.status === "FAILED" ? (
              <div className="text-center py-8">
                <p className="text-red-600">
                  Thumbnail generation failed. Please try again.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Generating thumbnails... This may take a few minutes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default page;
