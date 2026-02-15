export interface IJournalReminderEligibleUser {
  userId: string;
}

export interface IJournalReminderQueryProvider {
  getEligibleUsers(): Promise<IJournalReminderEligibleUser[]>;
}
