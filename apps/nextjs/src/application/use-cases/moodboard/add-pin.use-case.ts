import { Option, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddPinInputDto,
  IAddPinOutputDto,
} from "@/application/dto/moodboard/add-pin.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import { MoodboardId } from "@/domain/moodboard/moodboard-id";
import { Pin } from "@/domain/moodboard/pin.entity";
import { HexColor } from "@/domain/moodboard/value-objects/hex-color.vo";
import { PinType } from "@/domain/moodboard/value-objects/pin-type.vo";

export class AddPinUseCase
  implements UseCase<IAddPinInputDto, IAddPinOutputDto>
{
  constructor(
    private readonly moodboardRepo: IMoodboardRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: IAddPinInputDto): Promise<Result<IAddPinOutputDto>> {
    const typeResult = PinType.create(input.type);
    if (typeResult.isFailure) {
      return Result.fail(typeResult.getError());
    }
    const pinType = typeResult.getValue();

    if (pinType.value === "image" && !input.imageUrl) {
      return Result.fail("Image URL is required for image pins");
    }

    if (pinType.value === "color" && !input.color) {
      return Result.fail("Color is required for color pins");
    }

    let hexColor: Option<HexColor> = Option.none();
    if (pinType.value === "color" && input.color) {
      const colorResult = HexColor.create(input.color);
      if (colorResult.isFailure) {
        return Result.fail(colorResult.getError());
      }
      hexColor = Option.some(colorResult.getValue());
    }

    const moodboardId = MoodboardId.create(new UUID(input.moodboardId));
    const findResult = await this.moodboardRepo.findById(moodboardId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const moodboardOption = findResult.getValue();
    if (moodboardOption.isNone()) {
      return Result.fail("Moodboard not found");
    }

    const moodboard = moodboardOption.unwrap();
    if (moodboard.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const position = moodboard.get("pins").length;
    const pin = Pin.create({
      type: pinType,
      imageUrl:
        pinType.value === "image"
          ? Option.some(input.imageUrl!)
          : Option.none(),
      color: hexColor,
      position,
    });

    const addResult = moodboard.addPin(pin);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError());
    }

    const updateResult = await this.moodboardRepo.update(moodboard);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    await this.eventDispatcher.dispatchAll(moodboard.domainEvents);
    moodboard.clearEvents();

    return Result.ok({
      id: pin.id.value.toString(),
      type: pin.get("type").value,
      imageUrl: pin.get("imageUrl").isSome()
        ? pin.get("imageUrl").unwrap()
        : null,
      color: pin.get("color").isSome() ? pin.get("color").unwrap().value : null,
      position: pin.get("position"),
      createdAt: pin.get("createdAt").toISOString(),
    });
  }
}
