import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { GalleryWidget } from "@/components/dashboard/gallery-widget";
import { JournalWidget } from "@/components/dashboard/journal-widget";
import { MessagerieWidget } from "@/components/dashboard/messagerie-widget";
import { MoodSliderWidget } from "@/components/dashboard/mood-slider-widget";
import {
  SuiviMonthlyWidget,
  SuiviWeeklyWidget,
} from "@/components/dashboard/suivi-widgets";
import { TodoWidget } from "@/components/dashboard/todo-widget";
import { FriendsCard } from "@/components/social/friends-card";

function getLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          <View className="rounded-2xl bg-homecafe-green/10 p-4 gap-4">
            <GalleryWidget />
            <MessagerieWidget />
            <SuiviMonthlyWidget />
          </View>

          <View className="rounded-2xl bg-homecafe-pink/10 p-4 gap-4">
            <CalendarWidget
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <TodoWidget />
          </View>

          <View className="rounded-2xl bg-homecafe-orange/10 p-4 gap-4">
            <FriendsCard />
            <JournalWidget selectedDate={selectedDate} />
            <MoodSliderWidget selectedDate={selectedDate} />
            <SuiviWeeklyWidget />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
