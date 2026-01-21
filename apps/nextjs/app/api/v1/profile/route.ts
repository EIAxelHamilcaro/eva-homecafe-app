import {
  createProfileController,
  getProfileController,
  updateProfileController,
} from "@/adapters/controllers/profile/profile.controller";

export const GET = getProfileController;
export const POST = createProfileController;
export const PATCH = updateProfileController;
