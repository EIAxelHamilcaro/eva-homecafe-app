import { View, type ViewProps } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

import { cn } from "@/src/libs/utils";

type StickerType =
  | "bubble_tea"
  | "envelope_heart"
  | "coffee_cup"
  | "notebook"
  | "heart_face"
  | "cloud_happy"
  | "cloud_sad"
  | "sparkles"
  | "tape_green"
  | "tape_yellow"
  | "tape_blue";

interface StickerItemProps extends ViewProps {
  type: StickerType;
  size?: number;
  className?: string;
}

function BubbleTeaSticker({ size }: { size: number }) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 80 104">
      {/* Straw */}
      <Rect x="42" y="0" width="6" height="45" fill="#FF6B35" rx="2" />
      {/* Cup */}
      <Path
        d="M15 30 L65 30 L60 95 Q60 100 55 100 L25 100 Q20 100 20 95 Z"
        fill="#4CAF50"
        stroke="#388E3C"
        strokeWidth="2"
      />
      {/* Cup highlight */}
      <Path
        d="M20 35 L25 90"
        stroke="#81C784"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Lid */}
      <Ellipse
        cx="40"
        cy="30"
        rx="27"
        ry="5"
        fill="#E8F5E9"
        stroke="#4CAF50"
        strokeWidth="2"
      />
      {/* Boba pearls */}
      <Circle cx="28" cy="85" r="5" fill="#1B5E20" />
      <Circle cx="40" cy="88" r="5" fill="#1B5E20" />
      <Circle cx="52" cy="85" r="5" fill="#1B5E20" />
      <Circle cx="34" cy="78" r="4" fill="#1B5E20" />
      <Circle cx="46" cy="80" r="4" fill="#1B5E20" />
    </Svg>
  );
}

function EnvelopeHeartSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.3} height={size} viewBox="0 0 104 80">
      {/* Envelope body */}
      <Rect
        x="5"
        y="15"
        width="94"
        height="60"
        rx="4"
        fill="#F5F5F5"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      {/* Envelope flap */}
      <Path
        d="M5 15 L52 45 L99 15"
        fill="none"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      {/* Heart */}
      <Path
        d="M52 30 C52 25 45 20 40 25 C35 30 35 38 52 50 C69 38 69 30 64 25 C59 20 52 25 52 30 Z"
        fill="#E53935"
      />
    </Svg>
  );
}

function CoffeeCupSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.2} height={size} viewBox="0 0 96 80">
      {/* Saucer */}
      <Ellipse cx="48" cy="72" rx="40" ry="8" fill="#1976D2" />
      <Ellipse cx="48" cy="70" rx="36" ry="6" fill="#42A5F5" />
      {/* Cup body */}
      <Path
        d="M20 35 L25 65 Q25 70 30 70 L66 70 Q71 70 71 65 L76 35 Z"
        fill="#1976D2"
      />
      {/* Cup highlight */}
      <Path
        d="M25 40 L28 60"
        stroke="#64B5F6"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Cup rim */}
      <Ellipse
        cx="48"
        cy="35"
        rx="30"
        ry="6"
        fill="#2196F3"
        stroke="#1976D2"
        strokeWidth="2"
      />
      {/* Latte art swirl */}
      <Path
        d="M40 35 Q48 42 56 35 Q52 38 48 36 Q44 38 40 35"
        fill="#FFF8E1"
        opacity="0.9"
      />
      <Circle cx="48" cy="35" r="4" fill="#FFF8E1" opacity="0.8" />
    </Svg>
  );
}

function NotebookSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.2} height={size} viewBox="0 0 96 80">
      {/* Back cover shadow */}
      <Rect
        x="18"
        y="12"
        width="65"
        height="60"
        rx="2"
        fill="#E0E0E0"
        transform="rotate(-5 50 42)"
      />
      {/* Main notebook */}
      <Rect
        x="15"
        y="10"
        width="65"
        height="60"
        rx="2"
        fill="#FAFAFA"
        stroke="#E0E0E0"
        strokeWidth="2"
        transform="rotate(-5 50 40)"
      />
      {/* Lines */}
      <G transform="rotate(-5 50 40)">
        <Path d="M22 25 L73 25" stroke="#E8E8E8" strokeWidth="1" />
        <Path d="M22 35 L73 35" stroke="#E8E8E8" strokeWidth="1" />
        <Path d="M22 45 L73 45" stroke="#E8E8E8" strokeWidth="1" />
        <Path d="M22 55 L73 55" stroke="#E8E8E8" strokeWidth="1" />
      </G>
      {/* Ribbon bookmark */}
      <Path
        d="M70 10 L70 75 L66 70 L62 75 L62 10"
        fill="#9C27B0"
        transform="rotate(-5 66 42)"
      />
    </Svg>
  );
}

function HeartFaceSticker({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Heart shape */}
      <Path
        d="M40 70 C10 45 5 25 20 15 C35 5 40 20 40 20 C40 20 45 5 60 15 C75 25 70 45 40 70 Z"
        fill="#F48FB1"
        stroke="#EC407A"
        strokeWidth="2"
      />
      {/* Left eye (closed) */}
      <Path
        d="M28 32 Q32 28 36 32"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right eye (closed) */}
      <Path
        d="M44 32 Q48 28 52 32"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Smile */}
      <Path
        d="M35 42 Q40 48 45 42"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Blush */}
      <Ellipse cx="25" cy="40" rx="5" ry="3" fill="#F8BBD9" opacity="0.6" />
      <Ellipse cx="55" cy="40" rx="5" ry="3" fill="#F8BBD9" opacity="0.6" />
    </Svg>
  );
}

function CloudHappySticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.3} height={size} viewBox="0 0 104 80">
      {/* Cloud shape */}
      <Path
        d="M25 55 Q10 55 10 42 Q10 30 25 30 Q30 15 50 15 Q70 15 75 30 Q95 30 95 45 Q95 55 80 55 Z"
        fill="#F5F5F5"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      {/* Left eyebrow */}
      <Path
        d="M30 32 L40 30"
        stroke="#757575"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right eyebrow */}
      <Path
        d="M60 30 L70 32"
        stroke="#757575"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left eye (closed) */}
      <Path
        d="M32 40 Q37 36 42 40"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Right eye (closed) */}
      <Path
        d="M58 40 Q63 36 68 40"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CloudSadSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.3} height={size * 1.2} viewBox="0 0 104 96">
      {/* Cloud shape */}
      <Path
        d="M25 50 Q10 50 10 37 Q10 25 25 25 Q30 10 50 10 Q70 10 75 25 Q95 25 95 40 Q95 50 80 50 Z"
        fill="#E0E0E0"
        stroke="#BDBDBD"
        strokeWidth="2"
      />
      {/* Left eye */}
      <Circle cx="37" cy="32" r="3" fill="#424242" />
      {/* Right eye */}
      <Circle cx="63" cy="32" r="3" fill="#424242" />
      {/* Sad mouth */}
      <Path
        d="M45 42 Q50 38 55 42"
        fill="none"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Rain drops */}
      <Path d="M30 58 Q28 65 30 72 Q32 65 30 58" fill="#64B5F6" />
      <Path d="M45 62 Q43 69 45 76 Q47 69 45 62" fill="#64B5F6" />
      <Path d="M60 58 Q58 65 60 72 Q62 65 60 58" fill="#64B5F6" />
      <Path d="M75 62 Q73 69 75 76 Q77 69 75 62" fill="#64B5F6" />
      <Path d="M38 70 Q36 77 38 84 Q40 77 38 70" fill="#64B5F6" />
      <Path d="M52 68 Q50 75 52 82 Q54 75 52 68" fill="#64B5F6" />
      <Path d="M68 70 Q66 77 68 84 Q70 77 68 70" fill="#64B5F6" />
    </Svg>
  );
}

function SparklesSticker({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Main sparkle (orange) */}
      <Path
        d="M40 10 L44 36 L70 40 L44 44 L40 70 L36 44 L10 40 L36 36 Z"
        fill="#FF9800"
      />
      {/* Top right sparkle (pink) */}
      <Path
        d="M58 15 L60 22 L67 24 L60 26 L58 33 L56 26 L49 24 L56 22 Z"
        fill="#EC407A"
      />
      {/* Bottom left sparkle (cyan) */}
      <Path
        d="M22 47 L24 54 L31 56 L24 58 L22 65 L20 58 L13 56 L20 54 Z"
        fill="#00BCD4"
      />
    </Svg>
  );
}

function TapeGreenSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.6} height={size * 0.4} viewBox="0 0 128 32">
      {/* Tape body */}
      <Rect
        x="5"
        y="5"
        width="118"
        height="22"
        fill="#4CAF50"
        rx="2"
        transform="rotate(-3 64 16)"
      />
      {/* Tape texture */}
      <G opacity="0.3" transform="rotate(-3 64 16)">
        <Path d="M10 12 L120 12" stroke="#81C784" strokeWidth="2" />
        <Path d="M10 20 L120 20" stroke="#81C784" strokeWidth="2" />
      </G>
      {/* Torn edges */}
      <Path
        d="M5 5 L8 8 L5 11 L8 14 L5 17 L8 20 L5 23 L8 27"
        stroke="#388E3C"
        strokeWidth="1"
        fill="none"
        transform="rotate(-3 64 16)"
      />
      <Path
        d="M123 5 L120 8 L123 11 L120 14 L123 17 L120 20 L123 23 L120 27"
        stroke="#388E3C"
        strokeWidth="1"
        fill="none"
        transform="rotate(-3 64 16)"
      />
    </Svg>
  );
}

function TapeYellowSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.6} height={size * 0.4} viewBox="0 0 128 32">
      {/* Tape body */}
      <Rect
        x="5"
        y="5"
        width="118"
        height="22"
        fill="#FFD93D"
        rx="2"
        transform="rotate(2 64 16)"
      />
      {/* Tape texture */}
      <G opacity="0.3" transform="rotate(2 64 16)">
        <Path d="M10 12 L120 12" stroke="#FFF176" strokeWidth="2" />
        <Path d="M10 20 L120 20" stroke="#FFF176" strokeWidth="2" />
      </G>
      {/* Torn edges */}
      <Path
        d="M5 5 L8 8 L5 11 L8 14 L5 17 L8 20 L5 23 L8 27"
        stroke="#F9A825"
        strokeWidth="1"
        fill="none"
        transform="rotate(2 64 16)"
      />
      <Path
        d="M123 5 L120 8 L123 11 L120 14 L123 17 L120 20 L123 23 L120 27"
        stroke="#F9A825"
        strokeWidth="1"
        fill="none"
        transform="rotate(2 64 16)"
      />
    </Svg>
  );
}

function TapeBlueSticker({ size }: { size: number }) {
  return (
    <Svg width={size * 1.6} height={size * 0.4} viewBox="0 0 128 32">
      {/* Tape body */}
      <Rect
        x="5"
        y="5"
        width="118"
        height="22"
        fill="#7986CB"
        rx="2"
        transform="rotate(-1 64 16)"
      />
      {/* Tape texture */}
      <G opacity="0.3" transform="rotate(-1 64 16)">
        <Path d="M10 12 L120 12" stroke="#9FA8DA" strokeWidth="2" />
        <Path d="M10 20 L120 20" stroke="#9FA8DA" strokeWidth="2" />
      </G>
      {/* Torn edges */}
      <Path
        d="M5 5 L8 8 L5 11 L8 14 L5 17 L8 20 L5 23 L8 27"
        stroke="#5C6BC0"
        strokeWidth="1"
        fill="none"
        transform="rotate(-1 64 16)"
      />
      <Path
        d="M123 5 L120 8 L123 11 L120 14 L123 17 L120 20 L123 23 L120 27"
        stroke="#5C6BC0"
        strokeWidth="1"
        fill="none"
        transform="rotate(-1 64 16)"
      />
    </Svg>
  );
}

const stickerComponents: Record<StickerType, React.FC<{ size: number }>> = {
  bubble_tea: BubbleTeaSticker,
  envelope_heart: EnvelopeHeartSticker,
  coffee_cup: CoffeeCupSticker,
  notebook: NotebookSticker,
  heart_face: HeartFaceSticker,
  cloud_happy: CloudHappySticker,
  cloud_sad: CloudSadSticker,
  sparkles: SparklesSticker,
  tape_green: TapeGreenSticker,
  tape_yellow: TapeYellowSticker,
  tape_blue: TapeBlueSticker,
};

function StickerItem({
  type,
  size = 80,
  className,
  ...props
}: StickerItemProps) {
  const StickerComponent = stickerComponents[type];

  return (
    <View className={cn("items-center justify-center", className)} {...props}>
      <StickerComponent size={size} />
    </View>
  );
}

export { StickerItem, type StickerItemProps, type StickerType };
