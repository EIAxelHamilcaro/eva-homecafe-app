"use client";

import { useCallback, useEffect, useState } from "react";
import type { IGetTodayMoodOutputDto } from "@/application/dto/mood/get-today-mood.dto";
import type { IRecordMoodOutputDto } from "@/application/dto/mood/record-mood.dto";

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<IGetTodayMoodOutputDto>(null);

  const fetchTodayMood = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/mood");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as IGetTodayMoodOutputDto;
      setTodayMood(data);
      if (data) {
        setSelectedCategory(data.category);
        setIntensity(data.intensity);
      }
    } catch {
      setError("Failed to load today's mood");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayMood();
  }, [fetchTodayMood]);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setError("Please select a mood category");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/v1/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          intensity,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data as { error?: string };
        setError(err.error ?? "Failed to record mood");
        return;
      }

      const result = data as IRecordMoodOutputDto;
      setTodayMood({
        id: result.id,
        category: result.category,
        intensity: result.intensity,
        createdAt: result.createdAt,
      });
      setSuccess(result.isUpdate ? "Mood updated!" : "Mood recorded!");
    } catch {
      setError("Failed to record mood");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
            <button
              key={mood.value}
              type="button"
              onClick={() => {
                setSelectedCategory(mood.value);
                setError(null);
                setSuccess(null);
              }}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                selectedCategory === mood.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Intensity: {intensity}/10
        </h2>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
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

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !selectedCategory}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Saving..." : todayMood ? "Update Mood" : "Record Mood"}
      </button>
    </div>
  );
}
