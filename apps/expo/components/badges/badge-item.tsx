import { View, type ViewProps } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import { cn } from "@/src/libs/utils";

type BadgeColor = "orange" | "pink" | "blue" | "purple" | "yellow";
type BadgeType = "7_JOURS" | "14_JOURS" | "1_MOIS";
type StatusDot = "green" | "orange" | "pink" | "gray" | "blue";

interface BadgeItemProps extends ViewProps {
  color: BadgeColor;
  type: BadgeType;
  statusDots?: [StatusDot, StatusDot, StatusDot];
  size?: number;
  className?: string;
}

const colorSchemes: Record<
  BadgeColor,
  {
    primary: string;
    secondary: string;
    stripe: string;
    border: string;
  }
> = {
  orange: {
    primary: "#FF9500",
    secondary: "#FFB347",
    stripe: "#FFCF8B",
    border: "#E88600",
  },
  pink: {
    primary: "#FFB6C1",
    secondary: "#FFC8D2",
    stripe: "#FFE4E8",
    border: "#F691C3",
  },
  blue: {
    primary: "#4A90D9",
    secondary: "#7CB9E8",
    stripe: "#B8D4F0",
    border: "#3A7BC8",
  },
  purple: {
    primary: "#9B59B6",
    secondary: "#BB8FCE",
    stripe: "#D7BDE2",
    border: "#8E44AD",
  },
  yellow: {
    primary: "#FFD93D",
    secondary: "#FFE566",
    stripe: "#FFF2A8",
    border: "#E6C235",
  },
};

const ribbonColors: Record<BadgeType, { bg: string; text: string }> = {
  "7_JOURS": { bg: "#FF9500", text: "#FFFFFF" },
  "14_JOURS": { bg: "#0062DD", text: "#FFFFFF" },
  "1_MOIS": { bg: "#0062DD", text: "#FFFFFF" },
};

const badgeLabels: Record<BadgeType, { number: string; label: string }> = {
  "7_JOURS": { number: "7", label: "JOURS" },
  "14_JOURS": { number: "14", label: "JOURS" },
  "1_MOIS": { number: "1", label: "MOIS" },
};

const dotColors: Record<StatusDot, string> = {
  green: "#4ADE80",
  orange: "#FB923C",
  pink: "#F691C3",
  gray: "#9CA3AF",
  blue: "#60A5FA",
};

function BadgeItem({
  color,
  type,
  statusDots = ["gray", "gray", "gray"],
  size = 100,
  className,
  ...props
}: BadgeItemProps) {
  const scheme = colorSchemes[color];
  const ribbon = ribbonColors[type];
  const label = badgeLabels[type];

  const width = size;
  const height = size * 1.2;

  return (
    <View className={cn("items-center", className)} {...props}>
      <Svg width={width} height={height} viewBox="0 0 100 120">
        <Defs>
          <ClipPath id="shieldClip">
            <Path d="M10 10 L90 10 L90 75 Q90 90 50 105 Q10 90 10 75 Z" />
          </ClipPath>
          <LinearGradient id="shieldGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={scheme.secondary} />
            <Stop offset="100%" stopColor={scheme.primary} />
          </LinearGradient>
        </Defs>

        {/* Shield background */}
        <Path
          d="M10 10 L90 10 L90 75 Q90 90 50 105 Q10 90 10 75 Z"
          fill="url(#shieldGradient)"
          stroke={scheme.border}
          strokeWidth="3"
        />

        {/* Diagonal stripes */}
        <G clipPath="url(#shieldClip)">
          {[-60, -40, -20, 0, 20, 40, 60, 80, 100].map((offset) => (
            <Rect
              key={`stripe-${offset}`}
              x={offset}
              y="0"
              width="12"
              height="150"
              fill={scheme.stripe}
              opacity="0.4"
              transform="rotate(-45 50 60)"
            />
          ))}
        </G>

        {/* Inner shield highlight */}
        <Path
          d="M18 18 L82 18 L82 72 Q82 84 50 96 Q18 84 18 72 Z"
          fill="none"
          stroke={scheme.stripe}
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Number */}
        <SvgText
          x="50"
          y="55"
          textAnchor="middle"
          fontSize={label.number.length > 1 ? "36" : "42"}
          fontWeight="bold"
          fill={ribbon.bg}
        >
          {label.number}
        </SvgText>

        {/* Ribbon */}
        <Path
          d="M5 78 L20 72 L80 72 L95 78 L95 92 L80 86 L20 86 L5 92 Z"
          fill={ribbon.bg}
        />

        {/* Ribbon shadow */}
        <Path
          d="M20 86 L80 86 L80 90 L20 90 Z"
          fill={ribbon.bg}
          opacity="0.7"
        />

        {/* Ribbon ends */}
        <Path d="M5 78 L5 96 L12 90 L12 76 Z" fill={ribbon.bg} opacity="0.8" />
        <Path
          d="M95 78 L95 96 L88 90 L88 76 Z"
          fill={ribbon.bg}
          opacity="0.8"
        />

        {/* Ribbon text */}
        <SvgText
          x="50"
          y="83"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={ribbon.text}
        >
          {label.label}
        </SvgText>
      </Svg>

      {/* Status dots */}
      <View className="mt-2 flex-row gap-1">
        {statusDots.map((dotColor, index) => (
          <View
            key={`dot-${index}-${dotColor}`}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColors[dotColor] }}
          />
        ))}
      </View>
    </View>
  );
}

export {
  BadgeItem,
  type BadgeItemProps,
  type BadgeColor,
  type BadgeType,
  type StatusDot,
};
