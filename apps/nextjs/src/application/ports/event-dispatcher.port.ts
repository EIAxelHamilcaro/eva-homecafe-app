import type { DomainEvent } from "@packages/ddd-kit";

export interface IEventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  dispatchAll(events: DomainEvent[]): Promise<void>;
}
