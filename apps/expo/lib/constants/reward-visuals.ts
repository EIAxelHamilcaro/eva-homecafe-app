import type { BadgeColor, BadgeType } from "@/components/badges/badge-item";
import type { StickerType } from "@/components/stickers/sticker-item";

export const STICKER_VISUAL_MAP: Record<string, StickerType> = {
  "first-post": "envelope_heart",
  "first-mood": "heart_face",
  "first-photo": "sparkles",
  "first-moodboard": "notebook",
  "first-friend": "cloud_happy",
  "journal-streak-3": "coffee_cup",
  "journal-streak-7": "bubble_tea",
  "mood-streak-7": "tape_green",
  "mood-streak-30": "tape_yellow",
  "posts-10": "tape_blue",
  "photos-10": "cloud_sad",
};

export interface BadgeVisual {
  color: BadgeColor;
  type: BadgeType;
  displayNumber?: string;
  displayUnit?: string;
}

export const BADGE_VISUAL_MAP: Record<string, BadgeVisual> = {
  "journal-streak-30": { color: "orange", type: "1_MOIS" },
  "mood-streak-60": { color: "pink", type: "1_MOIS" },
  "posts-50": {
    color: "blue",
    type: "14_JOURS",
    displayNumber: "50",
    displayUnit: "POSTS",
  },
  "photos-50": {
    color: "purple",
    type: "14_JOURS",
    displayNumber: "50",
    displayUnit: "PHOTOS",
  },
  "friends-5": {
    color: "yellow",
    type: "7_JOURS",
    displayNumber: "5",
    displayUnit: "AMIS",
  },
  "friends-10": {
    color: "yellow",
    type: "14_JOURS",
    displayNumber: "10",
    displayUnit: "AMIS",
  },
  "all-moods-recorded": {
    color: "pink",
    type: "7_JOURS",
    displayNumber: "✓",
    displayUnit: "MOODS",
  },
  "kanban-master": {
    color: "orange",
    type: "7_JOURS",
    displayNumber: "★",
    displayUnit: "KANBAN",
  },
};

export const DEFAULT_STICKER_VISUAL: StickerType = "sparkles";
export const DEFAULT_BADGE_VISUAL: BadgeVisual = {
  color: "blue",
  type: "7_JOURS",
};

export const EMOJI_BADGES: Record<string, { emoji: string; bg: string }> = {
  "journal-streak-7": { emoji: "\u{1F525}", bg: "#FFEDD5" },
  "journal-streak-14": { emoji: "\u2B50", bg: "#FEF3C7" },
  "journal-streak-30": { emoji: "\u{1F3C6}", bg: "#FEF3C7" },
  "first-post": { emoji: "\u{1F4DD}", bg: "#FEF3C7" },
  "first-mood": { emoji: "\u{1F60A}", bg: "#FCE7F3" },
  "first-photo": { emoji: "\u{1F4F8}", bg: "#E0F2FE" },
  "first-moodboard": { emoji: "\u{1F3A8}", bg: "#EDE9FE" },
  "first-friend": { emoji: "\u{1F91D}", bg: "#D1FAE5" },
  "posts-10": { emoji: "\u270D\uFE0F", bg: "#FDE68A" },
  "photos-10": { emoji: "\u{1F5BC}\uFE0F", bg: "#BAE6FD" },
  "posts-50": { emoji: "\u{1F4DA}", bg: "#FED7AA" },
  "photos-50": { emoji: "\u{1F3C6}", bg: "#FEF08A" },
  "friends-5": { emoji: "\u{1F465}", bg: "#A7F3D0" },
  "friends-10": { emoji: "\u{1F31F}", bg: "#99F6E4" },
  "all-moods-recorded": { emoji: "\u{1F308}", bg: "#FAE8FF" },
  "kanban-master": { emoji: "\u2705", bg: "#ECFCCB" },
};

export const DEFAULT_EMOJI_BADGE = { emoji: "\u{1F3C5}", bg: "#F3F4F6" };

export const BADGE_CATEGORIES = [
  {
    label: "R\u00E9gularit\u00E9",
    keys: ["journal-streak-7", "journal-streak-14", "journal-streak-30"],
  },
  {
    label: "Premiers pas",
    keys: [
      "first-post",
      "first-mood",
      "first-photo",
      "first-moodboard",
      "first-friend",
    ],
  },
  {
    label: "Jalons",
    keys: [
      "posts-10",
      "posts-50",
      "photos-10",
      "photos-50",
      "friends-5",
      "friends-10",
    ],
  },
  {
    label: "Sp\u00E9cial",
    keys: ["all-moods-recorded", "kanban-master"],
  },
];
