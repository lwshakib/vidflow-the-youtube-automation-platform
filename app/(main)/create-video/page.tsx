"use client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { videoStyles } from "@/constants/data";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import LeftSectionContent from "../_components/LeftSectionContent";

type Props = {};

function CreateVideoPage({}: Props) {
  const [selectedTab, setSelectedTab] = useState("suggestions");
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null
  );
  const [customTopic, setCustomTopic] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [generatedScripts, setGeneratedScripts] = useState<any[]>([]);
  const [selectedScriptIdx, setSelectedScriptIdx] = useState<number | null>(
    null
  );
  const { userId } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [selectedCaptionStyle, setSelectedCaptionStyle] = useState<{
    label: string;
    className: string;
  } | null>(null);
  const selectedTopic = useMemo(() => {
    return selectedTab === "suggestions"
      ? selectedSuggestion
      : customTopic.trim()
        ? customTopic
        : null;
  }, [selectedTab, selectedSuggestion, customTopic]);

  const [scriptLoading, setScriptLoading] = useState(false);
  const router = useRouter();

  async function handleGenerateScript() {
    if (!selectedTopic) return;
    setScriptLoading(true);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });
      const data = await res.json();
      // You can handle the response here (show toast, update UI, etc)
      setGeneratedScripts(data.data.scripts);
    } catch (err) {
      console.error(err);
    } finally {
      setScriptLoading(false);
    }
  }

  const handleGenerateVideo = async () => {
    if (
      !projectTitle ||
      !selectedTopic ||
      !selectedStyle ||
      !selectedVoice ||
      !selectedCaptionStyle ||
      selectedScriptIdx === null
    ) {
      toast.error(
        "Please fill in all fields and select a script before generating the video."
      );
      return;
    }

    const script =
      selectedScriptIdx !== null
        ? generatedScripts[selectedScriptIdx].content
        : null;
    const res = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        script,
        topic: selectedTopic,
        title: projectTitle,
        caption: selectedCaptionStyle,
        videoStyle: selectedStyle,
        voice: selectedVoice,
        userId,
      }),
    });

    const data = await res.json();
    if (data.success && data.data) {
      router.push("/my-videos");
      toast.success("Video added to queue....");
    }
    if (res.status === 429) {
      toast.info(data.message, {
        action: {
          label: "Upgrade plan",
          onClick: () => {
            router.push("/#pricing");
          },
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-2 md:mx-10">
      {/* Left: Form Section */}
      <div className="block md:hidden p-4">
        <LeftSectionContent
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedSuggestion={selectedSuggestion}
          setSelectedSuggestion={setSelectedSuggestion}
          customTopic={customTopic}
          setCustomTopic={setCustomTopic}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedCaptionStyle={selectedCaptionStyle}
          setSelectedCaptionStyle={setSelectedCaptionStyle}
          generatedScripts={generatedScripts}
          scriptLoading={scriptLoading}
          handleGenerateScript={handleGenerateScript}
          selectedTopic={selectedTopic}
          selectedScriptIdx={selectedScriptIdx}
          setSelectedScriptIdx={setSelectedScriptIdx}
          handleGenerateVideo={handleGenerateVideo}
        />
      </div>
      <ScrollArea className="hidden md:block flex-1 h-[90vh] p-4">
        <LeftSectionContent
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedSuggestion={selectedSuggestion}
          setSelectedSuggestion={setSelectedSuggestion}
          customTopic={customTopic}
          setCustomTopic={setCustomTopic}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          selectedCaptionStyle={selectedCaptionStyle}
          setSelectedCaptionStyle={setSelectedCaptionStyle}
          generatedScripts={generatedScripts}
          scriptLoading={scriptLoading}
          handleGenerateScript={handleGenerateScript}
          selectedTopic={selectedTopic}
          selectedScriptIdx={selectedScriptIdx}
          setSelectedScriptIdx={setSelectedScriptIdx}
          handleGenerateVideo={handleGenerateVideo}
        />
      </ScrollArea>
      {/* Right: Preview Section */}
      <div className="flex-1 md:sticky md:top-0 md:self-start md:h-[90vh]">
        <Card className="p-6 flex flex-col items-center gap-4 shadow-lg h-full">
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          <div className="relative aspect-[9/16] max-w-xs w-full mb-2">
            {selectedStyle ? (
              <img
                src={videoStyles.find((s) => s.label === selectedStyle)?.src}
                alt={selectedStyle}
                className="w-full h-full object-cover rounded-lg border"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg border text-muted-foreground">
                No Style Selected
              </div>
            )}
            {selectedCaptionStyle && (
              <div
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded  text-center text-2xl shadow-lg ${selectedCaptionStyle.className}`}
                style={{ maxWidth: "90%" }}
              >
                {selectedCaptionStyle.label}
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="mb-2">
              <span className="font-medium">Project Title:</span>
              <span className="ml-2">
                {projectTitle || (
                  <span className="italic text-muted-foreground">(none)</span>
                )}
              </span>
            </div>
            <div>
              <span className="font-medium">Topic:</span>
              <span className="ml-2">
                {selectedTab === "suggestions" ? (
                  selectedSuggestion || (
                    <span className="italic text-muted-foreground">(none)</span>
                  )
                ) : customTopic.trim() ? (
                  customTopic
                ) : (
                  <span className="italic text-muted-foreground">(none)</span>
                )}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-medium">Video Voice:</span>
              <span className="ml-2">
                {selectedVoice || (
                  <span className="italic text-muted-foreground">(none)</span>
                )}
              </span>
            </div>
            <div className="mt-2">
              <span className="font-medium">Caption Style:</span>
              <span className="ml-2">
                {selectedCaptionStyle ? (
                  <span className={selectedCaptionStyle.className}>
                    {selectedCaptionStyle.label}
                  </span>
                ) : (
                  <span className="italic text-muted-foreground">(none)</span>
                )}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CreateVideoPage;
