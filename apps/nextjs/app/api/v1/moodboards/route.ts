import {
  createMoodboardController,
  getUserMoodboardsController,
} from "@/adapters/controllers/moodboard/moodboard.controller";

export const GET = getUserMoodboardsController;
export const POST = createMoodboardController;
