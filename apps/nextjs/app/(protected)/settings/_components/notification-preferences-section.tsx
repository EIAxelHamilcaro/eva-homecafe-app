"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
import { Label } from "@packages/ui/components/ui/label";
import { Separator } from "@packages/ui/components/ui/separator";
import { Switch } from "@packages/ui/components/ui/switch";

interface NotificationPreferencesSectionProps {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyNewMessages: boolean;
  notifyFriendActivity: boolean;
  notifyBadgesEarned: boolean;
  notifyJournalReminder: boolean;
  onChange: (
    field:
      | "emailNotifications"
      | "pushNotifications"
      | "notifyNewMessages"
      | "notifyFriendActivity"
      | "notifyBadgesEarned"
      | "notifyJournalReminder",
    value: boolean | string,
  ) => void;
}

export function NotificationPreferencesSection({
  emailNotifications,
  pushNotifications,
  notifyNewMessages,
  notifyFriendActivity,
  notifyBadgesEarned,
  notifyJournalReminder,
  onChange,
}: NotificationPreferencesSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="emailNotifications" className="text-sm">
            Notifications par e-mail
          </Label>
          <Switch
            id="emailNotifications"
            checked={emailNotifications}
            onCheckedChange={(checked) =>
              onChange("emailNotifications", checked === true)
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="pushNotifications" className="text-sm">
            Notifications push
          </Label>
          <Switch
            id="pushNotifications"
            checked={pushNotifications}
            onCheckedChange={(checked) =>
              onChange("pushNotifications", checked === true)
            }
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">
            Choisissez les notifications que vous souhaitez recevoir
          </p>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyNewMessages"
              checked={notifyNewMessages}
              onCheckedChange={(checked) =>
                onChange("notifyNewMessages", checked === true)
              }
            />
            <Label htmlFor="notifyNewMessages" className="text-sm">
              Nouveaux messages
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyFriendActivity"
              checked={notifyFriendActivity}
              onCheckedChange={(checked) =>
                onChange("notifyFriendActivity", checked === true)
              }
            />
            <Label htmlFor="notifyFriendActivity" className="text-sm">
              Activité des ami·es
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyBadgesEarned"
              checked={notifyBadgesEarned}
              onCheckedChange={(checked) =>
                onChange("notifyBadgesEarned", checked === true)
              }
            />
            <Label htmlFor="notifyBadgesEarned" className="text-sm">
              Badges obtenus
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="notifyJournalReminder"
              checked={notifyJournalReminder}
              onCheckedChange={(checked) =>
                onChange("notifyJournalReminder", checked === true)
              }
            />
            <Label htmlFor="notifyJournalReminder" className="text-sm">
              Rappel journal
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
