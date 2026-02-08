import {
  createBoardController,
  getUserBoardsController,
} from "@/adapters/controllers/board/board.controller";

export const GET = getUserBoardsController;
export const POST = createBoardController;
