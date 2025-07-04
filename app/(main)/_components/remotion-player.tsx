"use client";
import { Player } from "@remotion/player";
import { useState } from "react";
import RemotionComposition from "./remotion-composition";
type Props = {
  videoData: any;
};

function RemotionPlayer({ videoData }: Props) {
  const [durationInFrame, setDurationInFrame] = useState(100);

  return (
    <Player
      component={RemotionComposition}
      durationInFrames={Number(
        (videoData.captions[videoData.captions.length - 1]?.end * 30).toFixed(0)
      )}
      compositionWidth={720}
      compositionHeight={1280}
      fps={30}
      controls
      style={{
        height: "70vh",
      }}
      inputProps={{
        videoData: videoData,
      }}
    />
  );
}

export default RemotionPlayer;
