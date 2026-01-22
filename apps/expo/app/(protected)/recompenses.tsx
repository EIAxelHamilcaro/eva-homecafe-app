import { router } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, SafeAreaView, View } from "react-native";

import { type BadgeData, BadgeGrid } from "@/components/badges/badge-grid";

const mockBadges: BadgeData[] = [
  {
    id: "1",
    color: "orange",
    type: "7_JOURS",
    statusDots: ["green", "orange", "pink"],
  },
  {
    id: "2",
    color: "pink",
    type: "14_JOURS",
    statusDots: ["gray", "gray", "blue"],
  },
  {
    id: "3",
    color: "blue",
    type: "1_MOIS",
    statusDots: ["gray", "gray", "gray"],
  },
  {
    id: "4",
    color: "pink",
    type: "7_JOURS",
    statusDots: ["blue", "pink", "green"],
  },
  {
    id: "5",
    color: "orange",
    type: "14_JOURS",
    statusDots: ["orange", "gray", "pink"],
  },
  {
    id: "6",
    color: "yellow",
    type: "1_MOIS",
    statusDots: ["pink", "orange", "pink"],
  },
  {
    id: "7",
    color: "pink",
    type: "7_JOURS",
    statusDots: ["gray", "pink", "gray"],
  },
  {
    id: "8",
    color: "yellow",
    type: "14_JOURS",
    statusDots: ["green", "pink", "green"],
  },
  {
    id: "9",
    color: "orange",
    type: "1_MOIS",
    statusDots: ["pink", "gray", "gray"],
  },
  {
    id: "10",
    color: "yellow",
    type: "7_JOURS",
    statusDots: ["green", "gray", "blue"],
  },
  {
    id: "11",
    color: "blue",
    type: "14_JOURS",
    statusDots: ["gray", "pink", "gray"],
  },
  {
    id: "12",
    color: "purple",
    type: "1_MOIS",
    statusDots: ["green", "green", "gray"],
  },
  {
    id: "13",
    color: "orange",
    type: "7_JOURS",
    statusDots: ["green", "orange", "pink"],
  },
  {
    id: "14",
    color: "pink",
    type: "14_JOURS",
    statusDots: ["gray", "pink", "gray"],
  },
  {
    id: "15",
    color: "pink",
    type: "1_MOIS",
    statusDots: ["pink", "gray", "blue"],
  },
  {
    id: "16",
    color: "orange",
    type: "7_JOURS",
    statusDots: ["green", "pink", "blue"],
  },
  {
    id: "17",
    color: "blue",
    type: "14_JOURS",
    statusDots: ["gray", "gray", "gray"],
  },
  {
    id: "18",
    color: "purple",
    type: "1_MOIS",
    statusDots: ["gray", "gray", "gray"],
  },
];

export default function RecompensesModal() {
  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(protected)/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        {/* Close button */}
        <View className="absolute right-4 top-4 z-10">
          <Pressable
            onPress={handleClose}
            className="h-10 w-10 items-center justify-center rounded-full border border-homecafe-pink bg-background active:bg-muted"
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={20} color="#3D2E2E" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Badge grid */}
        <View className="flex-1 px-4 pt-16">
          <BadgeGrid badges={mockBadges} badgeSize={120} />
        </View>
      </View>
    </SafeAreaView>
  );
}
