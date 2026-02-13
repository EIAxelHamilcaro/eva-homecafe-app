"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useState } from "react";
import {
  useSettingsQuery,
  useUpdateSettingsMutation,
} from "@/app/(protected)/_hooks/use-settings";
import { AboutSection } from "./about-section";
import { AccountActionsSection } from "./account-actions-section";
import { NotificationPreferencesSection } from "./notification-preferences-section";

interface SettingsState {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewMessages: boolean;
  notifyFriendActivity: boolean;
  notifyBadgesEarned: boolean;
  notifyJournalReminder: boolean;
}

const defaultSettings: SettingsState = {
  emailNotifications: true,
  pushNotifications: true,
  notifyNewMessages: true,
  notifyFriendActivity: true,
  notifyBadgesEarned: true,
  notifyJournalReminder: true,
};

export function SettingsForm() {
  const [localSettings, setLocalSettings] = useState<SettingsState | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);

  const {
    data: serverSettings,
    isLoading,
    error: loadError,
  } = useSettingsQuery();
  const updateSettings = useUpdateSettingsMutation();

  const settings: SettingsState = localSettings ?? {
    emailNotifications:
      serverSettings?.emailNotifications ?? defaultSettings.emailNotifications,
    pushNotifications:
      serverSettings?.pushNotifications ?? defaultSettings.pushNotifications,
    notifyNewMessages:
      serverSettings?.notifyNewMessages ?? defaultSettings.notifyNewMessages,
    notifyFriendActivity:
      serverSettings?.notifyFriendActivity ??
      defaultSettings.notifyFriendActivity,
    notifyBadgesEarned:
      serverSettings?.notifyBadgesEarned ?? defaultSettings.notifyBadgesEarned,
    notifyJournalReminder:
      serverSettings?.notifyJournalReminder ??
      defaultSettings.notifyJournalReminder,
  };

  const handleChange = (
    field: keyof SettingsState,
    value: boolean | string,
  ) => {
    setLocalSettings((prev) => ({
      ...(prev ?? settings),
      [field]: value,
    }));
    setSuccess(null);
  };

  const handleSave = () => {
    setSuccess(null);
    updateSettings.mutate(settings, {
      onSuccess: () => {
        setSuccess("Paramètres sauvegardés");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  const error =
    loadError?.message ??
    (updateSettings.isError ? updateSettings.error.message : null);

  return (
    <div className="space-y-4">
      <NotificationPreferencesSection
        emailNotifications={settings.emailNotifications}
        pushNotifications={settings.pushNotifications}
        notifyNewMessages={settings.notifyNewMessages}
        notifyFriendActivity={settings.notifyFriendActivity}
        notifyBadgesEarned={settings.notifyBadgesEarned}
        notifyJournalReminder={settings.notifyJournalReminder}
        onChange={handleChange}
      />

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="w-full"
      >
        {updateSettings.isPending
          ? "Sauvegarde..."
          : "Enregistrer les préférences"}
      </Button>

      <AboutSection />

      <AccountActionsSection />
    </div>
  );
}
