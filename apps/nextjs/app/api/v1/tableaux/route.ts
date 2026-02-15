import {
  createTableauController,
  getUserTableauxController,
} from "@/adapters/controllers/tableau/tableau.controller";

export const GET = getUserTableauxController;
export const POST = createTableauController;
