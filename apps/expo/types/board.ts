export interface CardDto {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  position: number;
  progress: number;
  dueDate: string | null;
}

export interface ColumnDto {
  id: string;
  title: string;
  position: number;
  cards: CardDto[];
}

export interface BoardDto {
  id: string;
  title: string;
  type: "todo" | "kanban";
  columns: ColumnDto[];
  createdAt: string;
  updatedAt: string | null;
}

export interface GetBoardsResponse {
  boards: BoardDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ChronologyCard {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  isCompleted: boolean;
  progress: number;
  boardId: string;
  boardTitle: string;
  boardType: "todo" | "kanban";
  columnTitle: string;
}

export interface ChronologyEventDate {
  count: number;
  boards: { id: string; title: string }[];
}

export interface ChronologyResponse {
  cards: ChronologyCard[];
  eventDates: Record<string, ChronologyEventDate>;
}

export interface CreateBoardInput {
  title: string;
  type: "todo";
  items?: { title: string }[];
}

export interface CreateKanbanBoardInput {
  title: string;
  columns?: { title: string }[];
}

export interface UpdateBoardInput {
  title?: string;
  addCards?: { title: string }[];
  removeCardIds?: string[];
  toggleCardIds?: string[];
}

export interface AddCardInput {
  columnId: string;
  title: string;
  description?: string;
  progress?: number;
  dueDate?: string;
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  progress?: number;
  dueDate?: string;
}

export interface MoveCardInput {
  toColumnId: string;
  newPosition: number;
}
