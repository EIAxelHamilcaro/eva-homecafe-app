import { Result, type UseCase } from "@packages/ddd-kit";
import { chronologieToDto } from "@/application/dto/chronologie/chronologie-dto.mapper";
import type {
  IGetChronologiesInputDto,
  IGetChronologiesOutputDto,
} from "@/application/dto/chronologie/get-chronologies.dto";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";

export class GetUserChronologiesUseCase
  implements UseCase<IGetChronologiesInputDto, IGetChronologiesOutputDto>
{
  constructor(private readonly chronologieRepo: IChronologieRepository) {}

  async execute(
    input: IGetChronologiesInputDto,
  ): Promise<Result<IGetChronologiesOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 50,
    };

    const result = await this.chronologieRepo.findByUserId(
      input.userId,
      pagination,
    );

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const paginatedChronologies = result.getValue();

    return Result.ok({
      chronologies: paginatedChronologies.data.map(chronologieToDto),
    });
  }
}
