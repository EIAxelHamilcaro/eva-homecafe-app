"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Label } from "@packages/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";
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
  notifyPostActivity: boolean;
  notifyJournalReminder: boolean;
  language: "fr" | "en";
}

const defaultSettings: SettingsState = {
  emailNotifications: true,
  pushNotifications: true,
  notifyNewMessages: true,
  notifyFriendActivity: true,
  notifyBadgesEarned: true,
  notifyPostActivity: true,
  notifyJournalReminder: true,
  language: "fr",
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
    notifyPostActivity:
      serverSettings?.notifyPostActivity ?? defaultSettings.notifyPostActivity,
    notifyJournalReminder:
      serverSettings?.notifyJournalReminder ??
      defaultSettings.notifyJournalReminder,
    language:
      (serverSettings?.language as "fr" | "en") ?? defaultSettings.language,
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
        notifyPostActivity={settings.notifyPostActivity}
        notifyJournalReminder={settings.notifyJournalReminder}
        onChange={handleChange}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Langue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="language" className="text-sm">
              Langue de l'application
            </Label>
            <Select
              value={settings.language}
              onValueChange={(value) => handleChange("language", value)}
            >
              <SelectTrigger id="language" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Francais</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
