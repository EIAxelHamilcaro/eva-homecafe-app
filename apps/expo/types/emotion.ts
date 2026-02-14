import type { MoodCategory } from "./mood";

export interface EmotionYearEntry {
  date: string;
  category: MoodCategory;
}

export interface EmotionYearCalendarResponse {
  entries: EmotionYearEntry[];
}

export interface RecordEmotionInput {
  category: MoodCategory;
  emotionDate: string;
}

export interface RecordEmotionResponse {
  id: string;
  userId: string;
  category: string;
  isUpdate: boolean;
}
