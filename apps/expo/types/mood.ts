export type MoodCategory =
  | "calme"
  | "enervement"
  | "excitation"
  | "anxiete"
  | "tristesse"
  | "bonheur"
  | "ennui"
  | "nervosite"
  | "productivite";

export interface TodayMoodResponse {
  id: string;
  category: MoodCategory;
  intensity: number;
  createdAt: string;
}

export interface MoodWeekEntry {
  date: string;
  dayOfWeek: string;
  category: MoodCategory;
  intensity: number;
}

export interface MoodWeekResponse {
  entries: MoodWeekEntry[];
}

export interface MoodCategoryDistribution {
  category: MoodCategory;
  count: number;
  percentage: number;
}

export interface MoodStatsResponse {
  categoryDistribution: MoodCategoryDistribution[];
  averageIntensity: number;
  totalEntries: number;
  dominantMood: MoodCategory;
}

export interface MoodTrendsMonth {
  month: string;
  dominantCategory: MoodCategory;
  averageIntensity: number;
  entryCount: number;
}

export interface MoodTrendsResponse {
  months: MoodTrendsMonth[];
}

export interface RecordMoodInput {
  category: MoodCategory;
  intensity: number;
}

export interface RecordMoodResponse {
  id: string;
  userId: string;
  category: MoodCategory;
  intensity: number;
  createdAt: string;
  isUpdate: boolean;
}
