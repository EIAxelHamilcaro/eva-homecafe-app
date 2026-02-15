import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetTableauxInputDto,
  IGetTableauxOutputDto,
} from "@/application/dto/tableau/get-tableaux.dto";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";

export class GetUserTableauxUseCase
  implements UseCase<IGetTableauxInputDto, IGetTableauxOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IGetTableauxInputDto,
  ): Promise<Result<IGetTableauxOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 50,
    };

    const result = await this.tableauRepo.findByUserId(
      input.userId,
      pagination,
    );

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const paginatedTableaux = result.getValue();

    return Result.ok({
      tableaux: paginatedTableaux.data.map(tableauToDto),
    });
  }
}
