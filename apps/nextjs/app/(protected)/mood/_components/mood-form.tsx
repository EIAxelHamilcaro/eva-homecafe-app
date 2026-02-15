"use client";

import { Button } from "@packages/ui/components/ui/button";
import { useState } from "react";
import {
  useRecordMoodMutation,
  useTodayMoodQuery,
} from "@/app/(protected)/_hooks/use-mood";

const MOOD_OPTIONS = [
  { value: "calme", label: "Calme" },
  { value: "enervement", label: "\u00c9nervement" },
  { value: "excitation", label: "Excitation" },
  { value: "anxiete", label: "Anxi\u00e9t\u00e9" },
  { value: "tristesse", label: "Tristesse" },
  { value: "bonheur", label: "Bonheur" },
  { value: "ennui", label: "Ennui" },
  { value: "nervosite", label: "Nervosit\u00e9" },
  { value: "productivite", label: "Productivit\u00e9" },
] as const;

export function MoodForm() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: todayMood, isLoading } = useTodayMoodQuery();
  const recordMood = useRecordMoodMutation();

  const effectiveCategory = selectedCategory ?? todayMood?.category ?? null;
  const effectiveIntensity =
    selectedCategory !== null ? intensity : (todayMood?.intensity ?? intensity);

  const handleSubmit = () => {
    if (!effectiveCategory) {
      setError("Please select a mood category");
      return;
    }

    setError(null);
    setSuccess(null);

    recordMood.mutate(
      { category: effectiveCategory, intensity: effectiveIntensity },
      {
        onSuccess: (data) => {
          setSuccess(data.isUpdate ? "Mood updated!" : "Mood recorded!");
        },
        onError: (err) => {
          setError(err.message || "Failed to record mood");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {todayMood && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-primary">
            Today&apos;s mood:{" "}
            {MOOD_OPTIONS.find((m) => m.value === todayMood.category)?.label ??
              todayMood.category}{" "}
            (intensity: {todayMood.intensity}/10)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can update your mood below.
          </p>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          How are you feeling?
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <Button
              key={mood.value}
              variant="outline"
              onClick={() => {
                setSelectedCategory(mood.value);
                setError(null);
                setSuccess(null);
              }}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                effectiveCategory === mood.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              {mood.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Intensity: {effectiveIntensity}/10
        </h2>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={effectiveIntensity}
          onChange={(e) => {
            setIntensity(Number(e.target.value));
            if (selectedCategory === null && todayMood) {
              setSelectedCategory(todayMood.category);
            }
          }}
          className="w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

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
        onClick={handleSubmit}
        disabled={recordMood.isPending || !effectiveCategory}
        className="w-full"
      >
        {recordMood.isPending
          ? "Saving..."
          : todayMood
            ? "Update Mood"
            : "Record Mood"}
      </Button>
    </div>
  );
}
