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
