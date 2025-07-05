"use client";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";

type Props = {};

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URI ||
  "http://localhost:3000/auth/google/callback";
const SCOPE = [
  "https://www.googleapis.com/auth/youtube.readonly", // For reading channel & video info
  "https://www.googleapis.com/auth/youtube.upload", // For uploading videos
].join(" ");

function ConnectYoutubeButton({}: Props) {
  const handleConnectWithYoutube = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <Button className="mt-6 cursor-pointer " onClick={handleConnectWithYoutube}>
      <Youtube className="w-5 h-5 mr-2" />
      Connect with YouTube
    </Button>
  );
}

export default ConnectYoutubeButton;
