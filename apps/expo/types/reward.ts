export interface RewardCriteria {
  eventType: string;
  threshold: number;
  field: string;
}

export interface RewardCollectionItemDto {
  id: string;
  key: string;
  name: string;
  description: string;
  criteria: RewardCriteria;
  iconUrl: string | null;
  earned: boolean;
  earnedAt: string | null;
}
