export interface PhotoDto {
  id: string;
  userId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption: string | null;
  createdAt: string;
}

export interface GalleryResponse {
  photos: PhotoDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AddPhotoInput {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  caption?: string;
}

export interface PresignedUploadRequest {
  context: "gallery";
  filename: string;
  mimeType: string;
  size: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresAt: string;
}

export interface FeedGalleryPhotoDto {
  photoId: string | null;
  postId: string | null;
  url: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  createdAt: string;
}

export interface FeedGalleryResponse {
  photos: FeedGalleryPhotoDto[];
  pagination: {
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}
