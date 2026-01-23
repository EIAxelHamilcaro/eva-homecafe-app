import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/providers/auth-provider";

import { CalendarWidget } from "./_components/calendar-widget";
import { GalleryWidget } from "./_components/gallery-widget";
import { InviteFriendsButton } from "./_components/invite-friends-button";
import { JournalWidget } from "./_components/journal-widget";
import { MessagerieWidget } from "./_components/messagerie-widget";
import { MoodWidget } from "./_components/mood-widget";
import { SuiviWidgets } from "./_components/suivi-widgets";
import { TodoWidget } from "./_components/todo-widget";

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

        {/* Mood widget */}
        <MoodWidget />

        {/* CTA button */}
        <InviteFriendsButton />
      </ScrollView>
    </SafeAreaView>
  );
}
