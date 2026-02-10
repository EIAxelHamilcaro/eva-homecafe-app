"use client";

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
import { Switch } from "@packages/ui/components/ui/switch";

interface PrivacySectionProps {
  profileVisibility: boolean;
  rewardsVisibility: "everyone" | "friends" | "nobody";
  onChange: (
    field: "profileVisibility" | "rewardsVisibility",
    value: boolean | string,
  ) => void;
}

const rewardsVisibilityOptions = [
  { value: "everyone", label: "Tout le monde" },
  { value: "friends", label: "Ami·es uniquement" },
  { value: "nobody", label: "Personne" },
];

export function PrivacySection({
  profileVisibility,
  rewardsVisibility,
  onChange,
}: PrivacySectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Confidentialité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="profileVisibility" className="text-sm">
            Profil visible
          </Label>
          <Switch
            id="profileVisibility"
            checked={profileVisibility}
            onCheckedChange={(checked) =>
              onChange("profileVisibility", checked === true)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rewardsVisibility" className="text-sm">
            Qui peut voir mes récompenses
          </Label>
          <Select
            value={rewardsVisibility}
            onValueChange={(value) => onChange("rewardsVisibility", value)}
          >
            <SelectTrigger id="rewardsVisibility" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rewardsVisibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
