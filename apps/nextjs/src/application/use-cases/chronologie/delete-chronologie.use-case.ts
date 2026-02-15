import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteChronologieInputDto,
  IDeleteChronologieOutputDto,
} from "@/application/dto/chronologie/delete-chronologie.dto";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import { ChronologieId } from "@/domain/chronologie/chronologie-id";

export class DeleteChronologieUseCase
  implements UseCase<IDeleteChronologieInputDto, IDeleteChronologieOutputDto>
{
  constructor(private readonly chronologieRepo: IChronologieRepository) {}

  async execute(
    input: IDeleteChronologieInputDto,
  ): Promise<Result<IDeleteChronologieOutputDto>> {
    const chronologieId = ChronologieId.create(new UUID(input.chronologieId));
    const findResult = await this.chronologieRepo.findById(chronologieId);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const option = findResult.getValue();
    if (option.isNone()) {
      return Result.fail("Chronologie not found");
    }

    const chronologie = option.unwrap();
    if (chronologie.get("userId") !== input.userId) {
      return Result.fail("Forbidden");
    }

    const deleteResult = await this.chronologieRepo.delete(chronologieId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({ deletedId: input.chronologieId });
  }
}
