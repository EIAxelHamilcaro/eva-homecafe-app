import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Result } from "@packages/ddd-kit";
import type {
  IStorageProvider,
  IUploadFileInput,
  IUploadFileOutput,
} from "@/application/ports/storage.provider.port";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export class LocalStorageService implements IStorageProvider {
  async upload(input: IUploadFileInput): Promise<Result<IUploadFileOutput>> {
    try {
      const { file, filename, mimeType, folder } = input;
      const id = crypto.randomUUID();
      const extension = path.extname(filename);
      const newFilename = `${id}${extension}`;

      const uploadPath = folder ? path.join(UPLOAD_DIR, folder) : UPLOAD_DIR;

      await fs.mkdir(uploadPath, { recursive: true });
      const filePath = path.join(uploadPath, newFilename);
      await fs.writeFile(filePath, file);

      const relativePath = folder
        ? `/uploads/${folder}/${newFilename}`
        : `/uploads/${newFilename}`;

      return Result.ok({
        id,
        url: relativePath,
        filename: newFilename,
        mimeType,
        size: file.length,
      });
    } catch (error) {
      return Result.fail(`Failed to upload file: ${error}`);
    }
  }

  async delete(fileId: string): Promise<Result<void>> {
    try {
      const files = await this.findFileById(fileId);
      for (const file of files) {
        await fs.unlink(file);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to delete file: ${error}`);
    }
  }

  async getUrl(fileId: string): Promise<Result<string>> {
    try {
      const files = await this.findFileById(fileId);
      const firstFile = files[0];
      if (!firstFile) {
        return Result.fail("File not found");
      }
      const relativePath = firstFile.replace(
        path.join(process.cwd(), "public"),
        "",
      );
      return Result.ok(relativePath);
    } catch (error) {
      return Result.fail(`Failed to get file URL: ${error}`);
    }
  }

  private async findFileById(fileId: string): Promise<string[]> {
    const result: string[] = [];
    await this.searchInDirectory(UPLOAD_DIR, fileId, result);
    return result;
  }

  private async searchInDirectory(
    dir: string,
    fileId: string,
    result: string[],
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await this.searchInDirectory(fullPath, fileId, result);
        } else if (entry.name.startsWith(fileId)) {
          result.push(fullPath);
        }
      }
    } catch {
      // Directory may not exist
    }
  }
}
