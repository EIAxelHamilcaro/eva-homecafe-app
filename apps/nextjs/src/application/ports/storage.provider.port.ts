import type { Result } from "@packages/ddd-kit";

export interface IUploadFileInput {
  file: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}

export interface IUploadFileOutput {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface IPresignedUrlInput {
  key: string;
  mimeType: string;
  size: number;
  expiresIn?: number;
}

export interface IPresignedUrlOutput {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresAt: Date;
}

export interface IStorageProvider {
  upload(input: IUploadFileInput): Promise<Result<IUploadFileOutput>>;
  delete(fileId: string): Promise<Result<void>>;
  getUrl(fileId: string): Promise<Result<string>>;
  generatePresignedUploadUrl(
    input: IPresignedUrlInput,
  ): Promise<Result<IPresignedUrlOutput>>;
}
