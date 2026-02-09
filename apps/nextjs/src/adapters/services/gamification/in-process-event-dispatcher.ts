import type { DomainEvent } from "@packages/ddd-kit";
import type { GamificationHandler } from "@/application/event-handlers/gamification.handler";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";

export class InProcessEventDispatcher implements IEventDispatcher {
  constructor(private readonly gamificationHandler: GamificationHandler) {}

  async dispatch(event: DomainEvent): Promise<void> {
    try {
      await this.gamificationHandler.handle(event);
    } catch {}
  }

  async dispatchAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
