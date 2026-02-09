import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  type DbClient,
  db,
  desc,
  eq,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import { photo as photoTable } from "@packages/drizzle/schema";
import {
  photoToDomain,
  photoToPersistence,
} from "@/adapters/mappers/gallery.mapper";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import type { Photo } from "@/domain/gallery/photo.aggregate";
import type { PhotoId } from "@/domain/gallery/photo-id";

export class DrizzleGalleryRepository implements IGalleryRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: Photo, trx?: Transaction): Promise<Result<Photo>> {
    try {
      const data = photoToPersistence(entity);
      await this.getDb(trx)
        .insert(photoTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create photo: ${error}`);
    }
  }

  async update(entity: Photo, trx?: Transaction): Promise<Result<Photo>> {
    try {
      const data = photoToPersistence(entity);
      await this.getDb(trx)
        .update(photoTable)
        .set({
          caption: data.caption,
        })
        .where(eq(photoTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update photo: ${error}`);
    }
  }

  async delete(id: PhotoId, trx?: Transaction): Promise<Result<PhotoId>> {
    try {
      await this.getDb(trx)
        .delete(photoTable)
        .where(eq(photoTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete photo: ${error}`);
    }
  }

  async findById(id: PhotoId): Promise<Result<Option<Photo>>> {
    try {
      const result = await db
        .select()
        .from(photoTable)
        .where(eq(photoTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const photoResult = photoToDomain(record);
      if (photoResult.isFailure) {
        return Result.fail(photoResult.getError());
      }

      return Result.ok(Option.some(photoResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find photo by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Photo>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(photoTable)
        .where(eq(photoTable.userId, userId))
        .orderBy(desc(photoTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(photoTable)
        .where(eq(photoTable.userId, userId));

      const photos: Photo[] = [];
      for (const record of records) {
        const photoResult = photoToDomain(record);
        if (photoResult.isFailure) {
          return Result.fail(photoResult.getError());
        }
        photos.push(photoResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(photos, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find photos for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Photo>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(photoTable)
          .orderBy(desc(photoTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const photos: Photo[] = [];
      for (const record of records) {
        const photoResult = photoToDomain(record);
        if (photoResult.isFailure) {
          return Result.fail(photoResult.getError());
        }
        photos.push(photoResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(photos, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all photos: ${error}`);
    }
  }

  async findMany(
    props: Partial<Photo["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Photo>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return this.findAll(pagination);
      }

      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find photos: ${error}`);
    }
  }

  async findBy(
    props: Partial<Photo["_props"]>,
  ): Promise<Result<Option<Photo>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(photoTable)
        .where(eq(photoTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const photoResult = photoToDomain(record);
      if (photoResult.isFailure) {
        return Result.fail(photoResult.getError());
      }

      return Result.ok(Option.some(photoResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find photo: ${error}`);
    }
  }

  async exists(id: PhotoId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: photoTable.id })
        .from(photoTable)
        .where(eq(photoTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check photo existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db.select({ value: sqlCount() }).from(photoTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count photos: ${error}`);
    }
  }
}
