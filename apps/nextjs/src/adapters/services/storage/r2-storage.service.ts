import crypto from "node:crypto";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Result } from "@packages/ddd-kit";
import type {
  IPresignedUrlInput,
  IPresignedUrlOutput,
  IStorageProvider,
  IUploadFileInput,
  IUploadFileOutput,
} from "@/application/ports/storage.provider.port";

export class R2StorageService implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor() {
    const s3Endpoint = process.env.S3_ENDPOINT;
    const accessKeyId =
      process.env.S3_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey =
      process.env.S3_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.S3_BUCKET_NAME ?? process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.S3_PUBLIC_URL ?? process.env.R2_PUBLIC_URL;
    const accountId = process.env.R2_ACCOUNT_ID;

    if (!accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      throw new Error(
        "Storage configuration incomplete. Set S3_ENDPOINT + S3_ACCESS_KEY_ID + S3_SECRET_ACCESS_KEY + S3_BUCKET_NAME + S3_PUBLIC_URL (or R2_* equivalents)",
      );
    }

    if (!s3Endpoint && !accountId) {
      throw new Error("Either S3_ENDPOINT or R2_ACCOUNT_ID must be set");
    }

    this.bucketName = bucketName;
    this.publicUrl = publicUrl;

    this.client = new S3Client({
      region: s3Endpoint ? "us-east-1" : "auto",
      endpoint: s3Endpoint ?? `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: !!s3Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async upload(input: IUploadFileInput): Promise<Result<IUploadFileOutput>> {
    try {
      const { file, filename, mimeType, folder } = input;
      const id = crypto.randomUUID();
      const extension = path.extname(filename);
      const key = folder ? `${folder}/${id}${extension}` : `${id}${extension}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: mimeType,
        }),
      );

      return Result.ok({
        id,
        url: `${this.publicUrl}/${key}`,
        filename: `${id}${extension}`,
        mimeType,
        size: file.length,
      });
    } catch (error) {
      return Result.fail(`Failed to upload file to R2: ${error}`);
    }
  }

  async delete(fileId: string): Promise<Result<void>> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileId,
        }),
      );
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete file from R2: ${error}`);
    }
  }

  async getUrl(fileId: string): Promise<Result<string>> {
    try {
      const url = await getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileId,
        }),
        { expiresIn: 3600 },
      );
      return Result.ok(url);
    } catch (error) {
      return Result.fail(`Failed to get URL from R2: ${error}`);
    }
  }

  async generatePresignedUploadUrl(
    input: IPresignedUrlInput,
  ): Promise<Result<IPresignedUrlOutput>> {
    try {
      const expiresIn = input.expiresIn ?? 900;

      const uploadUrl = await getSignedUrl(
        this.client,
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: input.key,
          ContentType: input.mimeType,
          ContentLength: input.size,
        }),
        { expiresIn },
      );

      return Result.ok({
        uploadUrl,
        fileUrl: `${this.publicUrl}/${input.key}`,
        key: input.key,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      });
    } catch (error) {
      return Result.fail(`Failed to generate presigned URL: ${error}`);
    }
  }
}
