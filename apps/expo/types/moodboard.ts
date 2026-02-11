export interface MoodboardPinDto {
  id: string;
  type: "image" | "color";
  imageUrl: string | null;
  color: string | null;
  position: number;
  createdAt: string;
}

export interface MoodboardListItemDto {
  id: string;
  title: string;
  pinCount: number;
  previewPins: Omit<MoodboardPinDto, "createdAt">[];
  createdAt: string;
}

export interface MoodboardDetailDto {
  id: string;
  title: string;
  userId: string;
  pins: MoodboardPinDto[];
  createdAt: string;
}

export interface MoodboardListResponse {
  moodboards: MoodboardListItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateMoodboardInput {
  title: string;
}

export interface CreateMoodboardOutput {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export type AddPinInput =
  | { type: "image"; imageUrl: string }
  | { type: "color"; color: string };

export interface AddPinOutput {
  id: string;
  type: "image" | "color";
  imageUrl: string | null;
  color: string | null;
  position: number;
  createdAt: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresAt: string;
}
