"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useCallback, useEffect, useState } from "react";
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
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/settings");
      if (!res.ok) {
        setError("Impossible de charger les paramètres");
        return;
      }
      const data = await res.json();
      setSettings({
        emailNotifications: data.emailNotifications,
        pushNotifications: data.pushNotifications,
        notifyNewMessages: data.notifyNewMessages,
        notifyFriendActivity: data.notifyFriendActivity,
        notifyBadgesEarned: data.notifyBadgesEarned,
        notifyJournalReminder: data.notifyJournalReminder,
      });
    } catch {
      setError("Impossible de charger les paramètres");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (
    field: keyof SettingsState,
    value: boolean | string,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Impossible de sauvegarder les paramètres");
        return;
      }

      setSuccess("Paramètres sauvegardés");
    } catch {
      setError("Impossible de sauvegarder les paramètres");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

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

      <Button onClick={handleSave} disabled={submitting} className="w-full">
        {submitting ? "Sauvegarde..." : "Enregistrer les préférences"}
      </Button>

      <AboutSection />

      <AccountActionsSection />
    </div>
  );
}
