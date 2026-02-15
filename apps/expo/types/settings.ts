export interface UserPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewMessages: boolean;
  notifyFriendActivity: boolean;
  notifyBadgesEarned: boolean;
  notifyPostActivity: boolean;
  notifyJournalReminder: boolean;
  profileVisibility: boolean;
  rewardsVisibility: "everyone" | "friends" | "nobody";
  themeMode: "light" | "dark" | "system";
  language: "fr" | "en";
  timeFormat: "12h" | "24h";
  createdAt: string;
  updatedAt: string;
}

export const rewardsVisibilityOptions = [
  { label: "Tout le monde", value: "everyone" },
  { label: "Amis", value: "friends" },
  { label: "Personne", value: "nobody" },
];

export const languageOptions = [
  { label: "Français", value: "fr" },
  { label: "English", value: "en" },
];

export const timeFormatOptions = [
  { label: "24h", value: "24h" },
  { label: "12h", value: "12h" },
];

export interface UpdateSettingsInput {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  notifyNewMessages?: boolean;
  notifyFriendActivity?: boolean;
  notifyBadgesEarned?: boolean;
  notifyPostActivity?: boolean;
  notifyJournalReminder?: boolean;
  profileVisibility?: boolean;
  rewardsVisibility?: "everyone" | "friends" | "nobody";
  themeMode?: "light" | "dark" | "system";
  language?: "fr" | "en";
  timeFormat?: "12h" | "24h";
}
