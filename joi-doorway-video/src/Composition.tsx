import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const colors = {
  cream: "#fff7ea",
  paper: "#fffdf7",
  ink: "#26312e",
  muted: "#6e746e",
  coral: "#ef7464",
  blue: "#7ab9d6",
  green: "#758f6b",
  amber: "#d89932",
  wood: "#9b6846",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const fitCover = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

const seconds = (value: number, fps: number) => value * fps;

type TextProps = {
  children: React.ReactNode;
};

type RoadProps = {
  top: string;
  left: string;
  width: string;
  rotate: number;
};

const Road: React.FC<RoadProps> = ({ top, left, width, rotate }) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      width,
      height: 12,
      borderRadius: 10,
      background: "rgba(155,104,70,0.18)",
      transform: `rotate(${rotate}deg)`,
    }}
  />
);

type PinProps = {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  color: string;
};

const Pin: React.FC<PinProps> = ({ left, right, top, bottom, color }) => (
  <div
    style={{
      position: "absolute",
      left,
      right,
      top,
      bottom,
      width: 24,
      height: 24,
      border: "5px solid #fffdf7",
      borderRadius: "50%",
      background: color,
      boxShadow: "0 12px 24px rgba(73,45,28,0.2)",
    }}
  />
);

const MapPhone: React.FC<{ progress: number; fullBleed?: boolean }> = ({
  progress,
  fullBleed = false,
}) => {
  const routePulse = Math.sin(progress * Math.PI * 8) * 0.5 + 0.5;
  const pinHop = Math.sin(progress * Math.PI * 6) * 10;

  return (
    <div
      style={{
        position: "absolute",
        inset: fullBleed ? 0 : 18,
        overflow: "hidden",
        borderRadius: fullBleed ? 0 : 30,
        background:
          "linear-gradient(90deg, rgba(122,185,214,0.18) 1px, transparent 1px), linear-gradient(0deg, rgba(117,143,107,0.14) 1px, transparent 1px), #f7f1e4",
        backgroundSize: "62px 62px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${interpolate(progress, [0, 1], [18, -18])}px)`,
        }}
      >
        <Road top="35%" left="-14%" width="128%" rotate={-24} />
        <Road top="55%" left="-18%" width="124%" rotate={17} />
        <Road top="28%" left="16%" width="78%" rotate={78} />
        <div
          style={{
            position: "absolute",
            left: "35%",
            top: "18%",
            width: 8,
            height: "58%",
            borderRadius: 12,
            background: `linear-gradient(${colors.blue}, ${colors.coral}, ${colors.amber})`,
            transform: "rotate(34deg)",
            boxShadow: `0 0 0 6px rgba(255,253,247,0.68), 0 0 ${
              12 + routePulse * 24
            }px rgba(216,153,50,0.48)`,
          }}
        />
        <Pin left="32%" top="22%" color={colors.blue} />
        <Pin right="24%" bottom={`calc(28% + ${pinHop}px)`} color={colors.coral} />
      </div>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: 36,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderRadius: 8,
          background: "rgba(255,253,247,0.9)",
          border: "1px solid rgba(90,56,39,0.12)",
          fontSize: 20,
          color: colors.ink,
          fontWeight: 760,
        }}
      >
        <span>Joi Map</span>
        <span style={{ color: colors.muted }}>12:09</span>
      </div>

      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: 86,
          display: "grid",
          gridTemplateColumns: "64px 1fr",
          gap: 14,
          alignItems: "center",
          width: 250,
          padding: 12,
          borderRadius: 8,
          background: "rgba(255,253,247,0.94)",
          border: "1px solid rgba(90,56,39,0.12)",
          boxShadow: "0 18px 36px rgba(77,48,29,0.15)",
          opacity: interpolate(progress, [0.18, 0.42], [0, 1], {
            ...clamp,
            easing: ease,
          }),
          transform: `translateY(${interpolate(progress, [0.18, 0.42], [26, 0], {
            ...clamp,
            easing: ease,
          })}px)`,
        }}
      >
        <Img
          src={staticFile("joi-map-v3.png")}
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            objectFit: "cover",
            objectPosition: "50% 20%",
          }}
        />
        <div>
          <div style={{ fontSize: 22, fontWeight: 850, color: colors.ink }}>
            Joi
          </div>
          <div style={{ marginTop: 2, fontSize: 17, color: colors.muted }}>
            在门外等你
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderRadius: 8,
          background: "rgba(255,253,247,0.9)",
          border: "1px solid rgba(90,56,39,0.12)",
          fontSize: 19,
          color: colors.ink,
          fontWeight: 740,
        }}
      >
        <span style={{ color: colors.coral }}>3 min</span>
        <span>门口路线</span>
      </div>
    </div>
  );
};

export const IntroPhoneVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = frame / seconds(4, fps);

  return (
    <AbsoluteFill
      style={{
        background: "#f7f1e4",
        overflow: "hidden",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      }}
    >
      <MapPhone progress={progress} fullBleed />
    </AbsoluteFill>
  );
};

const PhoneStageScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = frame / seconds(4, fps);
  const intro = interpolate(frame, [0, seconds(0.9, fps)], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const phoneScale = interpolate(frame, [0, seconds(4, fps)], [0.88, 1.04], clamp);
  const phoneY = interpolate(frame, [0, seconds(4, fps)], [34, -18], {
    ...clamp,
    easing: ease,
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, rgba(117,143,107,0.22), transparent 42%), linear-gradient(28deg, rgba(239,116,100,0.18), transparent 36%), #f4e4cf",
        overflow: "hidden",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 18%, rgba(255,253,247,0.86), transparent 34%), radial-gradient(circle at 82% 76%, rgba(122,185,214,0.28), transparent 32%)",
          opacity: 0.86,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 430,
          height: 840,
          transform: `translate(-50%, -50%) translateY(${phoneY}px) scale(${phoneScale}) rotateX(3deg) rotateZ(-2deg)`,
          opacity: intro,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "12%",
            right: "12%",
            bottom: -44,
            height: 82,
            borderRadius: "50%",
            background: "rgba(92,54,31,0.2)",
            filter: "blur(24px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 48,
            background: "#2f2925",
            boxShadow:
              "0 34px 90px rgba(46,29,18,0.28), inset 0 0 0 2px rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              width: 96,
              height: 22,
              borderRadius: 22,
              background: "#211d1a",
              transform: "translateX(-50%)",
              zIndex: 4,
            }}
          />
          <MapPhone progress={progress} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PeepholeJoiVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const approach = interpolate(frame, [seconds(0.2, fps), seconds(3.7, fps)], [0, 1], {
    ...clamp,
    easing: ease,
  });
  const blink = interpolate(
    frame,
    [seconds(3.34, fps), seconds(3.42, fps), seconds(3.55, fps)],
    [0, 1, 0],
    clamp,
  );
  const glint = interpolate(
    frame,
    [seconds(3.05, fps), seconds(3.55, fps), seconds(4.25, fps)],
    [0, 1, 0.4],
    clamp,
  );
  const scale = interpolate(approach, [0, 1], [1.02, 1.14], clamp);
  const y = interpolate(approach, [0, 1], [18, -8], clamp);
  const x = Math.sin(frame / 20) * 5;

  return (
    <AbsoluteFill
      style={{
        background: "#1b120d",
        overflow: "hidden",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      }}
    >
      <Img
        src={staticFile("joi-peephole-closeup.png")}
        style={{
          ...fitCover,
          position: "absolute",
          inset: 0,
          filter: "saturate(1.05) contrast(1.02)",
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at center, transparent 0 44%, rgba(9,6,4,0.18) 58%, rgba(8,5,4,0.78) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "42.5%",
          top: "50.5%",
          width: 86,
          height: 86,
          borderRadius: "50%",
          background: "rgba(216,153,50,0.22)",
          boxShadow: "0 0 52px rgba(216,153,50,0.62)",
          opacity: glint,
          transform: `scaleY(${1 - blink * 0.86})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "53.5%",
          top: "47.7%",
          width: 86,
          height: 86,
          borderRadius: "50%",
          background: "rgba(216,153,50,0.22)",
          boxShadow: "0 0 52px rgba(216,153,50,0.62)",
          opacity: glint,
          transform: `scaleY(${1 - blink * 0.86})`,
        }}
      />
    </AbsoluteFill>
  );
};

const DoorKnockScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, seconds(3, fps)], [1, 1.18], {
    ...clamp,
    easing: ease,
  });
  const knockOne = interpolate(
    frame,
    [seconds(0.5, fps), seconds(0.75, fps), seconds(1.05, fps)],
    [0, 1, 0],
    clamp,
  );
  const knockTwo = interpolate(
    frame,
    [seconds(1.05, fps), seconds(1.3, fps), seconds(1.6, fps)],
    [0, 1, 0],
    clamp,
  );

  return (
    <AbsoluteFill
      style={{
        background: "#1f1914",
        overflow: "hidden",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      }}
    >
      <Img
        src={staticFile("doorway-bg.png")}
        style={{
          ...fitCover,
          transform: `scale(${zoom})`,
          filter: "brightness(0.76)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(21,15,12,0.52), transparent 24%, transparent 76%, rgba(21,15,12,0.45)), linear-gradient(180deg, rgba(21,15,12,0.3), transparent 42%, rgba(21,15,12,0.48))",
        }}
      />
      <KnockText x={-72} opacity={knockOne}>
        咚
      </KnockText>
      <KnockText x={72} opacity={knockTwo}>
        咚
      </KnockText>
    </AbsoluteFill>
  );
};

const KnockText: React.FC<TextProps & { x: number; opacity: number }> = ({
  children,
  x,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "44%",
      color: "#fff8ec",
      fontSize: 72,
      fontWeight: 900,
      textShadow: "0 14px 28px rgba(24,15,10,0.42)",
      opacity,
      transform: `translate(-50%, -50%) translateX(${x}px) scale(${0.72 + opacity * 0.36})`,
    }}
  >
    {children}
  </div>
);

const DoorOpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const swing = interpolate(frame, [0, seconds(1.25, fps)], [0, 1], {
    ...clamp,
    easing: ease,
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: colors.cream,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,252,242,0.96), rgba(255,232,189,0.7) 42%, rgba(122,185,214,0.22))",
        }}
      />
      <Img
        src={staticFile("doorway-bg.png")}
        style={{
          ...fitCover,
          opacity: 1 - swing * 0.76,
          filter: `brightness(${0.82 + swing * 0.22})`,
          transform: `perspective(1000px) rotateY(${-18 * swing}deg) translateX(${
            -150 * swing
          }px) scale(${1.08 + swing * 0.1})`,
          transformOrigin: "left center",
        }}
      />
    </AbsoluteFill>
  );
};

export const DoorwayPreviewVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: colors.cream }}>
      <Sequence durationInFrames={seconds(4, fps)}>
        <PhoneStageScene />
      </Sequence>
      <Sequence from={seconds(4, fps)} durationInFrames={seconds(3, fps)}>
        <DoorKnockScene />
      </Sequence>
      <Sequence from={seconds(7, fps)} durationInFrames={seconds(5, fps)}>
        <PeepholeJoiVideo />
      </Sequence>
      <Sequence from={seconds(12, fps)} durationInFrames={seconds(2, fps)}>
        <DoorOpenScene />
      </Sequence>
    </AbsoluteFill>
  );
};
