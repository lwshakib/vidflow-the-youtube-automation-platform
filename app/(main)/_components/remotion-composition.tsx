"use client";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  videoData: any;
};

function RemotionComposition({ videoData }: Props) {
  const captions = videoData?.captions;
  const imageList = videoData?.images || [];
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const duration =
    captions && captions.length > 0
      ? captions[captions.length - 1]?.end * fps
      : 0;

  const getCurrentCaption = () => {
    const currentTime = frame / 30;
    const currentCaption = captions?.find(
      (item: any) => currentTime >= item?.start && currentTime <= item?.end
    );
    console.log(currentCaption);

    return currentCaption ? currentCaption?.word : "";
  };

  return (
    <div>
      <AbsoluteFill>
        {imageList.map((item: any, index: number) => {
          const startTime = (index * duration) / imageList.length;
          const scale = interpolate(
            frame,
            [startTime, startTime + duration / 2, startTime + duration],
            [1, 2, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <Sequence key={index} from={startTime} durationInFrames={duration}>
              <AbsoluteFill>
                <Img
                  src={item}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: `scale(${scale})`,
                  }}
                />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          color: "white",
          justifyContent: "center",
          bottom: 50,
          height: 250,
          textAlign: "center",
          position: "absolute",
          left: 0,
          right: 0,
          top: undefined,
          fontSize: 40,
        }}
      >
        <h2>{getCurrentCaption()}</h2>
      </AbsoluteFill>
      <Audio src={videoData.audioUrl} />
    </div>
  );
}

export default RemotionComposition;
