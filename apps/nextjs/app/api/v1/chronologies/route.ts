import {
  createChronologieController,
  getUserChronologiesController,
} from "@/adapters/controllers/chronologie/chronologie.controller";

export const GET = getUserChronologiesController;
export const POST = createChronologieController;
