"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ThumbnailRequest = {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  thumbnails?: Array<{
    id: number;
    thumbnailUrl: string;
    originalName: string;
    size: number;
    s3Key: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

type Props = {};

function page({}: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
    console.log("Current files:", uploadedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }

    // Reference images are now optional, so we don't need to validate their presence

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/generate-thumbnail", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Thumbnail generation started!");
      } else {
        toast.error(result.message || "Failed to start thumbnail generation");
      }
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      toast.error("An error occurred while generating thumbnails");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Thumbnail Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter your video title..."
                className="w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter your video description..."
                className="w-full min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Images (Optional - Max 3 files)</Label>
              <FileUpload onChange={handleFileUpload} maxFiles={3} />
              {files.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {files.length} file(s) selected
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Upload images for inspiration, or leave empty to generate
                thumbnails based on your title and description.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Generation...
                </>
              ) : (
                "Generate Thumbnails"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
