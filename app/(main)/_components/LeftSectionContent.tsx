import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  captionStyles,
  suggestions,
  videoStyles,
  videoVoices,
} from "@/constants/data";
import { Sparkles, Video } from "lucide-react";

// Define the prop types for all state and handlers used in the component
interface LeftSectionContentProps {
  projectTitle: string;
  setProjectTitle: (v: string) => void;
  selectedTab: string;
  setSelectedTab: (v: string) => void;
  selectedSuggestion: string | null;
  setSelectedSuggestion: (v: string | null) => void;
  customTopic: string;
  setCustomTopic: (v: string) => void;
  selectedStyle: string | null;
  setSelectedStyle: (v: string) => void;
  selectedVoice: string | null;
  setSelectedVoice: (v: string) => void;
  selectedCaptionStyle: { label: string; className: string } | null;
  setSelectedCaptionStyle: (v: { label: string; className: string }) => void;
  generatedScripts: any[];
  scriptLoading: boolean;
  handleGenerateScript: () => void;
  selectedTopic: string | null;
  selectedScriptIdx: number | null;
  setSelectedScriptIdx: (v: number) => void;
  handleGenerateVideo: () => void;
}

function LeftSectionContent({
  projectTitle,
  setProjectTitle,
  selectedTab,
  setSelectedTab,
  selectedSuggestion,
  setSelectedSuggestion,
  customTopic,
  setCustomTopic,
  selectedStyle,
  setSelectedStyle,
  selectedVoice,
  setSelectedVoice,
  selectedCaptionStyle,
  setSelectedCaptionStyle,
  generatedScripts,
  scriptLoading,
  handleGenerateScript,
  selectedTopic,
  selectedScriptIdx,
  setSelectedScriptIdx,
  handleGenerateVideo,
}: LeftSectionContentProps) {
  return (
    <>
      <label htmlFor="project-title" className="block mb-1">
        Project Title
      </label>
      <Input
        id="project-title"
        placeholder="Enter project title"
        width={300}
        value={projectTitle}
        onChange={(e) => {
          e.preventDefault();
          setProjectTitle(e.target.value);
        }}
      />
      <h2 className="text-2xl font-semibold mb-1 mt-4">Video Topic</h2>
      <p className="mb-4 text-muted-foreground text-sm">
        Choose a topic for your video. You can select from suggestions or enter
        your own custom topic to guide the script generation.
      </p>
      <Tabs
        defaultValue="suggestions"
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="mb-6 w-full max-w-xl"
      >
        <TabsList>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="your-topic">Your Topic</TabsTrigger>
        </TabsList>
        <TabsContent value="suggestions">
          <div className="flex gap-2 flex-wrap mt-4">
            {suggestions.map((s) => (
              <Button
                key={s}
                variant={selectedSuggestion === s ? "default" : "outline"}
                onClick={() => {
                  setSelectedSuggestion(s);
                  setCustomTopic("");
                }}
              >
                {s}
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="your-topic">
          <div className="mt-4">
            <Input
              placeholder="Enter your topic"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                setSelectedSuggestion(null);
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
      <Button
        className="mt-4"
        size="lg"
        onClick={handleGenerateScript}
        disabled={!selectedTopic || scriptLoading}
      >
        <Sparkles className="mr-2 h-5 w-5" />
        {scriptLoading ? "Generating..." : "Generate Script"}
      </Button>
      {/* Scripts Output Section */}
      <div className="mt-6 min-h-[60px]">
        {scriptLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-5/6 mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : generatedScripts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {generatedScripts.map((script, idx) => (
              <Card
                key={idx}
                className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedScriptIdx === idx
                    ? "border-primary ring-2 ring-primary"
                    : "border-transparent hover:border-primary/40"
                }`}
                onClick={() => setSelectedScriptIdx(idx)}
              >
                <div className="whitespace-pre-line text-xs">
                  {script.content}
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-1">Video Styles</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Pick a visual style for your video. This will influence the look and
          feel of the generated content. Scroll to see all available styles.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {videoStyles.map((style) => (
            <div
              key={style.label}
              className={`cursor-pointer rounded-lg border-2 p-2 flex flex-col items-center transition-all duration-150 ${
                selectedStyle === style.label
                  ? "border-primary ring-2 ring-primary"
                  : "border-transparent hover:border-primary/40"
              } cursor-pointer`}
              onClick={() => setSelectedStyle(style.label)}
            >
              <img
                src={style.src}
                alt={style.label}
                className="w-28 h-28 object-cover rounded-md mb-2"
                style={{
                  boxShadow:
                    selectedStyle === style.label
                      ? "0 0 0 2px var(--tw-ring-color)"
                      : undefined,
                }}
              />
              <span className="font-medium text-center">{style.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Video Voice Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-1">Video Voice</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Select a voice style for your video narration.
        </p>
        <div className="flex flex-wrap gap-3">
          {videoVoices.map((voice) => (
            <button
              key={voice.Id}
              type="button"
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-150 bg-background border-2 focus:outline-none ${
                selectedVoice === voice.Id
                  ? "border-primary ring-2 ring-primary"
                  : "border-muted hover:border-primary/40"
              } cursor-pointer`}
              onClick={() => setSelectedVoice(voice.Id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{voice.Name}</span>
                <span className="text-xs text-muted-foreground">
                  {voice.Gender} • {voice.LanguageName}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Caption Style Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-1">Caption Style</h3>
        <p className="mb-4 text-muted-foreground text-sm">
          Select Caption Style
        </p>
        <div className="flex flex-wrap gap-4">
          {captionStyles.map((style) => (
            <button
              key={style.label}
              type="button"
              className={`px-7 py-4 rounded-lg text-2xl transition-all duration-150 font-sans bg-[#151A23] focus:outline-none ${
                style.className
              } ${
                selectedCaptionStyle?.label === style.label
                  ? "ring-2 ring-primary border-primary border-2"
                  : "border-2 border-transparent hover:border-primary/40"
              } cursor-pointer`}
              onClick={() => setSelectedCaptionStyle(style)}
              style={{ minWidth: 120 }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      {/* Generate Video Button */}
      <Button
        className="mt-8 w-full"
        size="lg"
        variant="default"
        onClick={handleGenerateVideo}
      >
        <Video className="mr-2 h-5 w-5" />
        Generate Video
      </Button>
    </>
  );
}

export default LeftSectionContent;
