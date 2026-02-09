export type AchievementQueryFn = (userId: string) => Promise<number>;

export interface IAchievementQueryProvider {
  getQueryForField(field: string): AchievementQueryFn | null;
  getCountQueryForEventType(eventType: string): AchievementQueryFn | null;
}
