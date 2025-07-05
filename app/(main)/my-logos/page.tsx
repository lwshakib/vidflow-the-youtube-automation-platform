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

type LogoItem = {
  id: number;
  logoUrl: string;
  originalName: string;
  size: number;
  s3Key: string;
};

type LogoRequest = {
  id: string;
  logoName: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  logos?: LogoItem[];
  createdAt: string;
  updatedAt: string;
};

const fetchLogoRequests = async () => {
  const response = await fetch("/api/logos");
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch logos");
  }

  return result.data;
};

type Props = {};

function page({}: Props) {
  const {
    data: logoData,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["logos"],
    queryFn: fetchLogoRequests,
    refetchInterval: 5000, // ← poll every 5 seconds
  });

  const logoRequests = logoData?.requests || [];

  const handleDownload = (logoUrl: string, originalName: string) => {
    const link = document.createElement("a");
    link.href = logoUrl;
    link.download = originalName;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading your logos...</p>
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
            <CardTitle>My Logos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">
                {error.message || "An error occurred while fetching logos"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (logoRequests.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>My Logos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No logos found. Create your first logo to get started.
              </p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/logo-generator")}
              >
                Create Logo
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
        <h1 className="text-2xl font-bold">My Logos</h1>
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
          <Button onClick={() => (window.location.href = "/logo-generator")}>
            Create New Logo
          </Button>
        </div>
      </div>

      {logoRequests.map((request: LogoRequest) => (
        <Card key={request.id} className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg">{request.logoName}</span>
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
            request.logos &&
            request.logos.length > 0 ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated {request.logos.length} logo variations
                </div>

                <Carousel className="w-full max-w-3xl mx-auto">
                  <CarouselContent>
                    {request.logos.map((logo: LogoItem) => (
                      <CarouselItem
                        key={logo.id}
                        className="md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <img
                                src={logo.logoUrl}
                                alt={`Logo ${logo.id}`}
                                className="w-full h-full object-contain rounded-lg"
                                loading="lazy"
                              />
                            </CardContent>
                          </Card>
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium">
                              Variation {logo.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(logo.size / 1024).toFixed(1)} KB
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() =>
                                handleDownload(logo.logoUrl, logo.originalName)
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
                  Logo generation failed. Please try again.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Generating logos... This may take a few minutes.
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
