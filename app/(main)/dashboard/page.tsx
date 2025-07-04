"use client";

type Props = {};

function page({}: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-background">
      <div className="max-w-xl w-full">
        <div className="text-2xl font-bold mb-6">
          Welcome to your Dashboard!
        </div>
        <div className="mb-4 text-base">
          Ready to start your faceless YouTube journey? Follow these simple
          steps to automate your channel and content creation process. Whether
          you’re a beginner or an experienced creator, this guide will help you
          get up and running in no time!
        </div>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="text-lg font-semibold mb-4">
            Step-by-Step Guide for YouTube Automation
          </div>
          <ol className="list-decimal list-inside space-y-3 text-base">
            <li>
              <span className="font-medium">Create your channel guide:</span>{" "}
              <a
                href="/youtube-channel-guide"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Channel Guide
              </a>
              <div className="ml-5 text-sm text-muted-foreground">
                Get personalized recommendations and a step-by-step plan for
                your new YouTube channel. This guide will help you define your
                niche, branding, and content strategy.
              </div>
            </li>
            <li>
              <span className="font-medium">Connect your YouTube account:</span>{" "}
              <a
                href="/youtube"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect Account
              </a>
              <div className="ml-5 text-sm text-muted-foreground">
                Securely link your YouTube account to enable automated uploads
                and channel management. This is a one-time process and your data
                is kept private.
              </div>
            </li>
            <li>
              <span className="font-medium">Create a video:</span>{" "}
              <a
                href="/create-video"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create Video
              </a>
              <div className="ml-5 text-sm text-muted-foreground">
                Use our AI-powered tools to generate scripts, visuals, and
                voiceovers. Customize your video style and content with just a
                few clicks.
              </div>
            </li>
            <li>
              <span className="font-medium">Manage and upload videos:</span>{" "}
              <a
                href="/my-videos"
                className="underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                My Videos
              </a>{" "}
              — Click a video, then click{" "}
              <span className="font-semibold">Upload to YouTube</span>. Your
              video will be uploaded automatically and you will receive an email
              notification.
              <div className="ml-5 text-sm text-muted-foreground">
                Easily keep track of all your generated videos. Uploading is
                fully automated—just review your video, hit upload, and we’ll
                handle the rest, including sending you a confirmation email.
              </div>
            </li>
          </ol>
          <div className="mt-6 text-base">
            Here you can start your faceless YouTube channel! Our platform is
            designed to make content creation and channel management as easy and
            efficient as possible. If you have any questions, check out our help
            resources or reach out for support.
          </div>
        </div>
        <div className="mt-6 text-center text-sm">
          If this was helpful, follow me on{" "}
          <a
            href="https://github.com/lwshakib"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600"
          >
            GitHub
          </a>
          .
        </div>
      </div>
    </div>
  );
}

export default page;
