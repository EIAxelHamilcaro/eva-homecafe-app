import type { DomainEvent } from "@packages/ddd-kit";
import type { EvaluateAchievementUseCase } from "@/application/use-cases/reward/evaluate-achievement.use-case";

export class GamificationHandler {
  constructor(
    private readonly evaluateAchievement: EvaluateAchievementUseCase,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    const userIds = this.extractUserIds(event);
    for (const userId of userIds) {
      await this.evaluateAchievement.execute({
        userId,
        eventType: event.type,
      });
    }
  }

  private extractUserIds(event: DomainEvent): string[] {
    const e = event as DomainEvent & {
      userId?: string;
      senderId?: string;
      receiverId?: string;
    };

    if (e.userId) return [e.userId];

    if (e.senderId && e.receiverId) {
      return [e.senderId, e.receiverId];
    }

    return [];
  }
}
