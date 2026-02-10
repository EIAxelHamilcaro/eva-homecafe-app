"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Label } from "@packages/ui/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@packages/ui/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";

interface CustomizationSectionProps {
  themeMode: "light" | "dark" | "system";
  language: "fr" | "en";
  timeFormat: "12h" | "24h";
  onChange: (
    field: "themeMode" | "language" | "timeFormat",
    value: boolean | string,
  ) => void;
}

const languageOptions = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const timeFormatOptions = [
  { value: "24h", label: "24h" },
  { value: "12h", label: "12h" },
];

export function CustomizationSection({
  themeMode,
  language,
  timeFormat,
  onChange,
}: CustomizationSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Personnalisation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Thème</Label>
          <RadioGroup
            value={themeMode}
            onValueChange={(value) => onChange("themeMode", value)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="text-sm">
                Clair
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="text-sm">
                Sombre
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="text-sm">
                Système
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language" className="text-sm">
            Langue
          </Label>
          <Select
            value={language}
            onValueChange={(value) => onChange("language", value)}
          >
            <SelectTrigger id="language" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeFormat" className="text-sm">
            Format horaire
          </Label>
          <Select
            value={timeFormat}
            onValueChange={(value) => onChange("timeFormat", value)}
          >
            <SelectTrigger id="timeFormat" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeFormatOptions.map((option) => (
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
