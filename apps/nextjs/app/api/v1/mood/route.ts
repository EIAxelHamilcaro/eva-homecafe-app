import {
  getTodayMoodController,
  recordMoodController,
} from "@/adapters/controllers/mood/mood.controller";

export const GET = getTodayMoodController;
export const POST = recordMoodController;
