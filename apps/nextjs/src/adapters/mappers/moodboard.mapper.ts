import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  moodboard as moodboardTable,
  pin as pinTable,
} from "@packages/drizzle/schema";
import { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { MoodboardId } from "@/domain/moodboard/moodboard-id";
import { Pin } from "@/domain/moodboard/pin.entity";
import { PinId } from "@/domain/moodboard/pin-id";
import { HexColor } from "@/domain/moodboard/value-objects/hex-color.vo";
import { MoodboardTitle } from "@/domain/moodboard/value-objects/moodboard-title.vo";
import type { PinTypeValue } from "@/domain/moodboard/value-objects/pin-type.vo";
import { PinType } from "@/domain/moodboard/value-objects/pin-type.vo";

type MoodboardRecord = typeof moodboardTable.$inferSelect;
type PinRecord = typeof pinTable.$inferSelect;

type MoodboardPersistence = Omit<MoodboardRecord, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date | null;
};

type PinPersistence = Omit<PinRecord, "createdAt"> & {
  createdAt?: Date;
};

export function pinToDomain(record: PinRecord): Result<Pin> {
  const typeResult = PinType.create(record.type as PinTypeValue);
  if (typeResult.isFailure) {
    return Result.fail(typeResult.getError());
  }

  let color: Option<HexColor> = Option.none();
  if (record.color) {
    const colorResult = HexColor.create(record.color);
    if (colorResult.isFailure) {
      return Result.fail(colorResult.getError());
    }
    color = Option.some(colorResult.getValue());
  }

  const pin = Pin.reconstitute(
    {
      type: typeResult.getValue(),
      imageUrl: Option.fromNullable(record.imageUrl),
      color,
      position: record.position,
      createdAt: record.createdAt,
    },
    PinId.create(new UUID(record.id)),
  );

  return Result.ok(pin);
}

export function pinToPersistence(
  pinEntity: Pin,
  moodboardId: string,
): PinPersistence {
  const color = pinEntity.get("color");

  return {
    id: pinEntity.id.value.toString(),
    moodboardId,
    type: pinEntity.get("type").value,
    imageUrl: pinEntity.get("imageUrl").isSome()
      ? pinEntity.get("imageUrl").unwrap()
      : null,
    color: color.isSome() ? color.unwrap().value : null,
    position: pinEntity.get("position"),
    createdAt: pinEntity.get("createdAt"),
  };
}

export function moodboardToDomain(
  record: MoodboardRecord,
  pinRecords: PinRecord[] = [],
): Result<Moodboard> {
  const titleResult = MoodboardTitle.create(record.title);
  if (titleResult.isFailure) {
    return Result.fail(titleResult.getError());
  }

  const pins: Pin[] = [];
  for (const pinRecord of pinRecords) {
    const pinResult = pinToDomain(pinRecord);
    if (pinResult.isFailure) {
      return Result.fail(pinResult.getError());
    }
    pins.push(pinResult.getValue());
  }

  const moodboard = Moodboard.reconstitute(
    {
      userId: record.userId,
      title: titleResult.getValue(),
      pins,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? undefined,
    },
    MoodboardId.create(new UUID(record.id)),
  );

  return Result.ok(moodboard);
}

export function moodboardToPersistence(
  moodboard: Moodboard,
): MoodboardPersistence {
  return {
    id: moodboard.id.value.toString(),
    userId: moodboard.get("userId"),
    title: moodboard.get("title").value,
    createdAt: moodboard.get("createdAt"),
    updatedAt: moodboard.get("updatedAt") ?? null,
  };
}
