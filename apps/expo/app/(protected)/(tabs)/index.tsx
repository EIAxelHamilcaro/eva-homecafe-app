import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { GalleryWidget } from "@/components/dashboard/gallery-widget";
import { InviteFriendsButton } from "@/components/dashboard/invite-friends-button";
import { JournalWidget } from "@/components/dashboard/journal-widget";
import { MessagerieWidget } from "@/components/dashboard/messagerie-widget";
import { MoodWidget } from "@/components/dashboard/mood-widget";
import { MoodboardWidget } from "@/components/dashboard/moodboard-widget";
import { RewardsWidget } from "@/components/dashboard/rewards-widget";
import { SuiviWidgets } from "@/components/dashboard/suivi-widgets";
import { TodoWidget } from "@/components/dashboard/todo-widget";
import { useAuth } from "@/src/providers/auth-provider";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6 pt-2">
          <Text className="text-2xl font-bold text-foreground">
            Bonjour {user?.name?.split(" ")[0] ?? ""}
          </Text>
          <Text className="text-base text-muted-foreground">
            Bienvenue dans votre café
          </Text>
        </View>

        {/* Gallery widget */}
        <GalleryWidget />

        {/* Messagerie widget */}
        <MessagerieWidget />

        {/* Suivi widgets */}
        <SuiviWidgets />

        {/* Calendar widget */}
        <CalendarWidget />

        {/* Todo widget */}
        <TodoWidget />

        {/* Journal widget */}
        <JournalWidget />

        {/* Moodboard widget */}
        <MoodboardWidget />

        {/* Mood widget */}
        <MoodWidget />

        {/* Rewards widget */}
        <RewardsWidget />

        {/* CTA button */}
        <InviteFriendsButton />
      </ScrollView>
    </SafeAreaView>
  );
}
