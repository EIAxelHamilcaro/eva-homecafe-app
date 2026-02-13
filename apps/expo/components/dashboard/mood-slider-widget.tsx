import NativeSlider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useMoodByDate, useRecordMood } from "@/lib/api/hooks/use-mood";
import { colors } from "@/src/config/colors";

const CATEGORY_LABELS: Record<string, string> = {
  tristesse: "Tristesse",
  anxiete: "Anxiété",
  calme: "Calme",
  excitation: "Excitation",
  bonheur: "Bonheur",
};

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

function intensityToSlider(intensity: number): number {
  return Math.round(intensity * 10);
}

interface MoodSliderWidgetProps {
  selectedDate: string;
}

export function MoodSliderWidget({ selectedDate }: MoodSliderWidgetProps) {
  const { data: moodData, isLoading } = useMoodByDate(selectedDate);
  const recordMood = useRecordMood();
  const [success, setSuccess] = useState(false);

  const existingCategory = moodData?.category ?? null;
  const existingIntensity = moodData?.intensity ?? null;

  const defaultSlider =
    existingIntensity !== null ? intensityToSlider(existingIntensity) : 50;
  const [value, setValue] = useState(defaultSlider);

  useEffect(() => {
    setValue(
      existingIntensity !== null ? intensityToSlider(existingIntensity) : 50,
    );
  }, [existingIntensity]);

  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  function handleValidate() {
    if (recordMood.isPending) return;
    setSuccess(false);
    recordMood.mutate(
      {
        category: getCategory(value) as
          | "tristesse"
          | "anxiete"
          | "calme"
          | "excitation"
          | "bonheur",
        intensity: getIntensity(value),
        moodDate: selectedDate,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        },
      },
    );
  }

  if (isLoading) {
    return (
      <View className="rounded-2xl bg-card p-4">
        <View className="h-32 items-center justify-center">
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-2xl bg-card p-4">
      <Text className="text-lg font-semibold text-foreground">Moodboard</Text>
      <Text className="text-sm capitalize text-muted-foreground">
        {dateLabel}
      </Text>

      {existingCategory && (
        <Text className="mt-1 text-xs text-muted-foreground">
          Humeur enregistrée :{" "}
          <Text className="font-medium">
            {CATEGORY_LABELS[existingCategory] ?? existingCategory}
          </Text>{" "}
          ({existingIntensity}/10)
        </Text>
      )}

      <Text className="mt-2 text-sm text-muted-foreground">
        {existingCategory
          ? "Modifier ton humeur :"
          : "Quelle est ton humeur du jour ?"}
      </Text>

      <View className="relative mt-4 h-10 justify-center">
        <View className="absolute inset-x-3 overflow-hidden rounded-full">
          <LinearGradient
            colors={["#ef4444", "#eab308", "#22c55e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 8 }}
          />
        </View>
        <NativeSlider
          value={value}
          minimumValue={0}
          maximumValue={100}
          step={1}
          onValueChange={setValue}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#1f2937"
          style={{ width: "100%", height: 40 }}
        />
      </View>

      <View className="mt-4">
        <Pressable
          onPress={handleValidate}
          disabled={recordMood.isPending}
          className="self-start rounded-full bg-homecafe-pink px-6 py-2 active:opacity-90 disabled:opacity-50"
        >
          {recordMood.isPending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text className="text-sm font-semibold text-white">
              {success ? "Validé !" : existingCategory ? "Modifier" : "Valider"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
