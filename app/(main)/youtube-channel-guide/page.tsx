"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import * as React from "react";

type Props = {};

function page({}: Props) {
  const categories = [
    "Education",
    "Entertainment",
    "Technology",
    "Gaming",
    "Lifestyle",
    "Travel",
    "Health",
    "Finance",
    "Food",
    "Fashion",
    "Myth",
    "Science",
    "Sports",
    "Music",
    "AI",
    "Innovation",
    "Jokes",
    "Art",
    "History",
    "News",
    "Motivation",
    "DIY",
    "Animals",
    "Movies",
    "Cars",
    "Parenting",
    "Photography",
    "Books",
    "Business",
    "Comedy",
    "Productivity",
    "Spirituality",
    "Nature",
    "Politics",
    "Languages",
    "Podcasts",
    "Unboxing",
    "Reviews",
    "How-to",
    "Animation",
    "Memes",
    "Vlogs",
    "Documentary",
    "Shorts",
    "ASMR",
    "Magic",
    "Dance",
    "Fitness",
    "Beauty",
    "Crafts",
    "Tech Reviews",
    "Cooking",
    "Gardening",
    "Pets",
    "Wilderness",
    "Luxury",
    "Minimalism",
    "Self-Improvement",
    "Relationships",
    "Events",
    "Hacks",
    "Startup",
    "Case Studies",
    "Experiments",
    "Challenges",
    "Behind the Scenes",
    "Q&A",
    "Interviews",
  ];
  const [selected, setSelected] = React.useState<string[]>([]);
  const [suggestion, setSuggestion] = React.useState<string>("");
  const [generatedLogo, setGeneratedLogo] = React.useState("");
  const [suggestedChannelDetails, setSuggestedChannelDetails] = React.useState(
    []
  );
  const [selectedChannelIdx, setSelectedChannelIdx] = React.useState<
    number | null
  >(null);
  const [logoLoading, setLogoLoading] = React.useState(false);
  const [suggestionLoading, setSuggestionLoading] = React.useState(false);

  function toggleCategory(cat: string) {
    setSelected((prev) => {
      if (prev.includes(cat)) {
        return prev.filter((c) => c !== cat);
      } else if (prev.length < 3) {
        return [...prev, cat];
      } else {
        return prev;
      }
    });
  }

  async function generateNameSuggestion() {
    // Simple random suggestion logic using selected categories
    setSuggestionLoading(true);
    const response = await fetch("/api/youtube-guide/channel-text-content", {
      method: "POST",
      body: JSON.stringify({
        selected,
      }),
    });
    const data = await response.json();
    if (data.success) {
      setSuggestedChannelDetails(data.data);
    }
    setSuggestionLoading(false);
  }

  async function handleGenerateLogo() {
    if (
      selectedChannelIdx === null ||
      !suggestedChannelDetails[selectedChannelIdx]
    )
      return;
    setLogoLoading(true);
    const { channelName, channelDescription } =
      suggestedChannelDetails[selectedChannelIdx];
    try {
      const response = await fetch("/api/youtube-guide/channel-logo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, channelDescription }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedLogo(data.data);
      }
    } finally {
      setLogoLoading(false);
    }
  }

  return (
    <>
      <div className="mt-10 p-6 rounded-lg shadow bg-background max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-primary">
            YouTube Channel Guide
          </h1>
          <p className="text-sm text-muted-foreground">
            Before creating a YouTube channel, choose a path that aligns with
            your interests and expertise. Consider what you are passionate about
            and the type of videos you want to create. This helps you stay
            motivated and attract the right audience.
          </p>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Identify your interests and strengths.</li>
          <li>Research popular fields and niches on YouTube.</li>
          <li>
            Decide on the type of content you want to produce (e.g., tutorials,
            vlogs, reviews, entertainment).
          </li>
          <li>
            Think about your target audience and what value you can provide to
            them.
          </li>
        </ul>
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Recommended Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selected.includes(cat) ? "secondary" : "ghost"}
                className={
                  selected.includes(cat)
                    ? "border border-primary text-primary bg-muted/60 hover:bg-muted"
                    : "border border-muted-foreground/10 text-muted-foreground bg-background hover:bg-muted"
                }
                onClick={() => toggleCategory(cat)}
              >
                <span className="text-xs">{cat}</span>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select up to 3 categories.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            className="w-full"
            onClick={generateNameSuggestion}
            disabled={selected.length === 0 || suggestionLoading}
          >
            {suggestionLoading
              ? "Generating..."
              : "Generate YouTube Name Suggestions"}
          </Button>
          {suggestionLoading && (
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <Skeleton className="h-5 w-32 rounded-md" />
                  <Skeleton className="h-3 w-48 rounded-md" />
                </div>
              ))}
            </div>
          )}
          {suggestedChannelDetails &&
            suggestedChannelDetails.length > 0 &&
            !suggestionLoading && (
              <div className="flex flex-col gap-3">
                <Tabs
                  value={
                    selectedChannelIdx !== null
                      ? String(selectedChannelIdx)
                      : undefined
                  }
                  onValueChange={(v) => setSelectedChannelIdx(Number(v))}
                >
                  <TabsList className="flex flex-wrap gap-2 mb-2 bg-background p-1 rounded-md border border-muted-foreground/10">
                    {suggestedChannelDetails.map((detail: any, idx: number) => (
                      <TabsTrigger
                        key={idx}
                        value={String(idx)}
                        className={`text-xs px-2 py-1 rounded-md border transition-colors ${selectedChannelIdx === idx ? "border-primary bg-muted text-primary" : "border-transparent text-muted-foreground bg-background hover:bg-muted"}`}
                      >
                        {detail.channelName}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {suggestedChannelDetails.map((detail: any, idx: number) => (
                    <div className="">
                      <TabsContent key={idx} value={String(idx)}>
                        <div
                          className={`p-3 border rounded-md bg-muted/40 shadow-sm transition-colors ${selectedChannelIdx === idx ? "border-primary bg-muted/60" : "border-muted-foreground/10"}`}
                        >
                          <div className="text-sm font-medium text-primary">
                            {detail.channelName}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {detail.channelDescription}
                          </div>
                        </div>
                      </TabsContent>
                    </div>
                  ))}
                </Tabs>
                {selectedChannelIdx !== null && (
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    variant="outline"
                    onClick={handleGenerateLogo}
                    disabled={logoLoading}
                  >
                    {logoLoading
                      ? "Generating Logo..."
                      : "Generate Logo for this Channel"}
                  </Button>
                )}
                {logoLoading && (
                  <div className="flex flex-col items-center gap-2 mt-2">
                    <Skeleton className="h-5 w-40 rounded-md mb-1" />
                    <Skeleton className="h-32 w-32 rounded-md" />
                  </div>
                )}
                {generatedLogo && !logoLoading && (
                  <div className="flex flex-col items-center gap-3 mt-2">
                    <img
                      src={generatedLogo}
                      alt="Generated Logo"
                      className="w-32 h-32 object-contain rounded-md border shadow-sm"
                    />
                    <a
                      href={generatedLogo}
                      download="youtube-channel-logo.png"
                      className="inline-block"
                    >
                      <Button size="sm" variant="secondary">
                        Download Logo
                      </Button>
                    </a>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-muted-foreground mb-1">
                        Want to create{" "}
                        <span className="font-semibold text-primary">
                          faceless videos
                        </span>{" "}
                        for your channel? Try{" "}
                        <Link
                          href={"/create-video"}
                          className="font-bold text-primary"
                        >
                          Create Video Section
                        </Link>
                        !
                      </p>
                      <Button
                        size="sm"
                        className="text-base px-6 py-2 mt-1"
                        onClick={() => (window.location.href = "/create-video")}
                      >
                        Create Videos from here
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          {suggestion && (
            <div className="mt-2 text-base font-medium text-primary">
              Suggested Name: {suggestion}
            </div>
          )}
        </div>
      </div>
      <div className="mt-10 flex justify-center"></div>
    </>
  );
}

export default page;
