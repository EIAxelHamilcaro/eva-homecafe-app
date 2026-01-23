export const colors = {
  // HomeCafe Brand Colors (from Figma)
  homecafe: {
    pink: "#F691C3",
    pinkLight: "#FFE4E8",
    pinkDark: "#E91E63",
    cream: "#FFF8F0",
    beige: "#F5E6D3",
    green: "#4CAF50",
    greenLight: "#C8E6C9",
    orange: "#F46604",
    orangeLight: "#FFE0B2",
    blue: "#0062DD",
    greyDark: "#7A7A7A",
    greyLight: "#DADADA",
    greyMuted: "#6E7191",
  },

  // Mood Colors
  mood: {
    calme: "#7CB9E8",
    enervement: "#E85454",
    excitation: "#FFD93D",
    anxiete: "#9CA3AF",
    tristesse: "#374151",
    bonheur: "#4ADE80",
    ennui: "#FB923C",
    nervosite: "#F472B6",
    productivite: "#A78BFA",
  },

  // Semantic Colors
  background: "#FFFAF5",
  foreground: "#3D2E2E",
  card: "#FFFFFF",
  cardForeground: "#3D2E2E",
  popover: "#FFFFFF",
  popoverForeground: "#3D2E2E",
  primary: "#F691C3",
  primaryForeground: "#FFFFFF",
  secondary: "#F5E6D3",
  secondaryForeground: "#5D4E4E",
  muted: "#F5F0EB",
  mutedForeground: "#8D7E7E",
  accent: "#FF9800",
  accentForeground: "#3D2E2E",
  destructive: "#E53935",
  destructiveForeground: "#FFFFFF",
  success: "#4CAF50",
  successForeground: "#FFFFFF",
  warning: "#FF9800",
  warningForeground: "#3D2E2E",
  border: "#E8DED4",
  input: "#F5F0EB",
  ring: "#FFB6C1",

  // Chart Colors
  chart: {
    1: "#4CAF50",
    2: "#FF7043",
    3: "#FFB6C1",
    4: "#FF9800",
    5: "#9C27B0",
  },

  // Sidebar Colors
  sidebar: {
    base: "#FDF8F3",
    foreground: "#3D2E2E",
    primary: "#FFB6C1",
    primaryForeground: "#FFFFFF",
    accent: "#FFE4E8",
    accentForeground: "#5D4E4E",
    border: "#E8DED4",
    ring: "#FFB6C1",
  },

  // Icon Colors (for JS props like ActivityIndicator, SVG)
  icon: {
    default: "#374151",
    active: "#000000",
    muted: "#9CA3AF",
    white: "#FFFFFF",
    primary: "#F691C3",
  },

  // Status Colors (for toast, badges, etc.)
  status: {
    success: "#10B981",
    error: "#EF4444",
    info: "#3B82F6",
    warning: "#F59E0B",
    offline: "#6B7280",
  },

  // Common utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export type Colors = typeof colors;
