"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Card, CardContent } from "@packages/ui/components/ui/card";
import { useState } from "react";

interface MoodboardWidgetProps {
  selectedDate: string;
  existingIntensity: number | null;
  existingCategory: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  tristesse: "Tristesse",
  anxiete: "Anxiete",
  calme: "Calme",
  excitation: "Excitation",
  bonheur: "Bonheur",
  enervement: "Enervement",
  ennui: "Ennui",
  nervosite: "Nervosite",
  productivite: "Productivite",
};

function intensityToSlider(intensity: number): number {
  return Math.round(intensity * 10);
}

function getCategory(val: number): string {
  if (val <= 20) return "tristesse";
  if (val <= 40) return "anxiete";
  if (val <= 60) return "calme";
  if (val <= 80) return "excitation";
  return "bonheur";
}

function getIntensity(val: number): number {
  return Math.max(1, Math.min(10, Math.round(val / 10)));
}

export function MoodboardWidget({
  selectedDate,
  existingIntensity,
  existingCategory,
}: MoodboardWidgetProps) {
  const defaultSlider =
    existingIntensity !== null ? intensityToSlider(existingIntensity) : 50;
  const [value, setValue] = useState(defaultSlider);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" },
  );

  async function handleValidate() {
    if (submitting) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/v1/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: getCategory(value),
          intensity: getIntensity(value),
          moodDate: selectedDate,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      /* empty */
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold">Moodboard</h3>
        <p className="text-sm capitalize text-muted-foreground">{dateLabel}</p>
        {existingCategory && (
          <p className="mt-1 text-xs text-muted-foreground">
            Humeur enregistree :{" "}
            <span className="font-medium">
              {CATEGORY_LABELS[existingCategory] ?? existingCategory}
            </span>{" "}
            ({existingIntensity}/10)
          </p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          {existingCategory
            ? "Modifier ton humeur :"
            : "Quelle est ton humeur du jour ?"}
        </p>
        <div className="relative mt-6 mb-2 py-3">
          <div
            className="h-2 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #ef4444, #eab308, #22c55e)",
            }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
            aria-label="Humeur du jour"
          />
          <div
            className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-gray-800 shadow-md"
            style={{ left: `calc(${value}% - 10px)` }}
          />
        </div>
        <div className="mt-4">
          <Button
            onClick={handleValidate}
            disabled={submitting}
            className="rounded-full px-6"
          >
            {submitting
              ? "..."
              : success
                ? "Valide !"
                : existingCategory
                  ? "Modifier"
                  : "Valider"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
