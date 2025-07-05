"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  PauseCircle,
  PlayCircle,
  Upload,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Video {
  id: string;
  title: string;
  videoUrl?: string;
  videoProgress: "PENDING" | "COMPLETED";
  createdAt: string;
}

interface ScheduledUpload {
  id: string;
  videoId: string;
  scheduledDate: string;
  timezone: string;
  description?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  video: {
    id: string;
    title: string;
  };
}

// Fetch functions for TanStack Query
const fetchVideos = async () => {
  const response = await fetch("/api/videos");
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message);
  return data.data;
};

const fetchScheduledUploads = async () => {
  const response = await fetch("/api/smart-upload-scheduler");
  const data = await response.json();
  if (!response.ok || !data.success) throw new Error(data.message);
  return data.data;
};

export default function SmartUploadSchedulerPage() {
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isEnabled, setIsEnabled] = useState(false);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  // TanStack Query for videos
  const {
    data: videosData,
    error: videosError,
    isLoading: isFetchingVideos,
    refetch: refetchVideos,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  // TanStack Query for scheduled uploads
  const {
    data: scheduledUploadsData,
    error: scheduledUploadsError,
    isLoading: isFetchingScheduled,
    refetch: refetchScheduledUploads,
  } = useQuery({
    queryKey: ["scheduled-uploads"],
    queryFn: fetchScheduledUploads,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Filter completed videos that have a video URL
  const videos = videosData
    ? videosData.filter(
        (video: Video) => video.videoProgress === "COMPLETED" && video.videoUrl
      )
    : [];

  const scheduledUploads = scheduledUploadsData || [];

  const handleScheduleUpload = async () => {
    if (!selectedVideo || !scheduledDate || !scheduledTime) {
      toast.error("Please select a video and set the date and time");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/smart-upload-scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId: selectedVideo,
          scheduledDate,
          scheduledTime,
          timezone,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Upload scheduled successfully!");
        // Reset form
        setSelectedVideo("");
        setScheduledDate("");
        setScheduledTime("");
        setDescription("");
        setIsEnabled(false);
        // Refresh scheduled uploads
        refetchScheduledUploads();
      } else {
        toast.error(data.message || "Failed to schedule upload");
      }
    } catch (error) {
      console.error("Error scheduling upload:", error);
      toast.error("Failed to schedule upload");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUpload = async (scheduledId: string) => {
    setCancellingIds((prev) => new Set(prev).add(scheduledId));

    try {
      const response = await fetch(
        `/api/smart-upload-scheduler?id=${scheduledId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Upload cancelled successfully!");
        // Refresh scheduled uploads
        refetchScheduledUploads();
      } else {
        toast.error(data.message || "Failed to cancel upload");
      }
    } catch (error) {
      console.error("Error cancelling upload:", error);
      toast.error("Failed to cancel upload");
    } finally {
      setCancellingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scheduledId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "PROCESSING":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-50";
      case "FAILED":
        return "text-red-600 bg-red-50";
      case "CANCELLED":
        return "text-gray-600 bg-gray-50";
      case "PROCESSING":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const formatDateTime = (dateString: string, timezone: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Smart Upload Scheduler</h1>
          <p className="text-muted-foreground">
            Schedule your videos to upload at optimal times for maximum
            engagement
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Scheduling Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Upload
            </CardTitle>
            <CardDescription>
              Select a video and set the date and time for upload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduler-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
              <Label htmlFor="scheduler-enabled">Enable Smart Scheduling</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-select">Select Video</Label>
              <Select
                value={selectedVideo}
                onValueChange={setSelectedVideo}
                disabled={!isEnabled || isFetchingVideos}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isFetchingVideos ? "Loading videos..." : "Select a video"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {videos.map((video: Video) => (
                    <SelectItem key={video.id} value={video.id}>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        {video.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {videos.length === 0 && !isFetchingVideos && (
                <p className="text-sm text-muted-foreground">
                  No completed videos available for scheduling
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upload-date">Upload Date</Label>
                <Input
                  id="upload-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={!isEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-time">Upload Time</Label>
                <Input
                  id="upload-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  disabled={!isEnabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={timezone}
                onValueChange={setTimezone}
                disabled={!isEnabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                  <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  <SelectItem value="CST">Central Time (CST)</SelectItem>
                  <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                  <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a note about this scheduled upload..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isEnabled}
              />
            </div>

            <Button
              onClick={handleScheduleUpload}
              disabled={
                !isEnabled ||
                !selectedVideo ||
                !scheduledDate ||
                !scheduledTime ||
                isLoading
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Schedule Upload
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Settings and Info Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Tips for Better Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Upload when your audience is most active online</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Consider timezone differences for global audiences
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Schedule uploads during peak viewing hours (6-9 PM)
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Avoid major holidays and events that might reduce engagement
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scheduled Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Tasks
          </CardTitle>
          <CardDescription>
            Your upcoming and completed scheduled uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetchingScheduled ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Loading scheduled tasks...
              </span>
            </div>
          ) : scheduledUploads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled uploads found</p>
              <p className="text-sm">
                Schedule your first upload above to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledUploads.map((scheduled: ScheduledUpload) => (
                <div
                  key={scheduled.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(scheduled.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{scheduled.video.title}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            scheduled.status
                          )}`}
                        >
                          {scheduled.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Scheduled for:{" "}
                          {formatDateTime(
                            scheduled.scheduledDate,
                            scheduled.timezone
                          )}
                        </p>
                        {scheduled.description && (
                          <p className="text-xs">
                            Note: {scheduled.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(scheduled.createdAt).toLocaleDateString()}
                    </div>
                    {scheduled.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelUpload(scheduled.id)}
                        disabled={cancellingIds.has(scheduled.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {cancellingIds.has(scheduled.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
