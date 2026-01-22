import { Checkbox } from "components/ui/checkbox";
import { useRouter } from "expo-router";
import {
  Calendar,
  ChevronRight,
  Image,
  Mail,
  PenLine,
  Smile,
  UserPlus,
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";

const MOCK_GALLERY_IMAGES = [
  { id: "1", color: "#F5E6D3" },
  { id: "2", color: "#E8D4C4" },
  { id: "3", color: "#D4C4B0" },
  { id: "4", color: "#C9B8A8" },
];

const MOCK_UNREAD_MESSAGES = 3;

const MOCK_TODO_ITEMS = [
  { id: "1", title: "Faire les courses", completed: false },
  { id: "2", title: "Appeler maman", completed: true },
  { id: "3", title: "Répondre aux emails", completed: false },
];

const MOCK_MONTHLY_DATA = [
  { month: "Jan", value: 65 },
  { month: "Fév", value: 80 },
  { month: "Mar", value: 45 },
  { month: "Avr", value: 90 },
  { month: "Mai", value: 70 },
  { month: "Jun", value: 85 },
];

const MOCK_WEEKLY_DATA = [
  { day: "L", value: 3 },
  { day: "M", value: 4 },
  { day: "M", value: 2 },
  { day: "J", value: 5 },
  { day: "V", value: 4 },
  { day: "S", value: 3 },
  { day: "D", value: 4 },
];

function GalleryWidget() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/galerie")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">Galerie</Text>
        <View className="flex-row items-center">
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color="#F691C3" />
        </View>
      </View>
      <View className="flex-row gap-2">
        {MOCK_GALLERY_IMAGES.map((image) => (
          <View
            key={image.id}
            className="flex-1 aspect-square items-center justify-center rounded-xl"
            style={{ backgroundColor: image.color }}
          >
            <Image size={20} color="#FFFFFF" />
          </View>
        ))}
      </View>
    </Pressable>
  );
}

function MessagerieWidget() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/(tabs)/messages")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail size={24} color="#F691C3" />
          </View>
          <View>
            <Text className="text-lg font-semibold text-foreground">
              Messagerie
            </Text>
            {MOCK_UNREAD_MESSAGES > 0 && (
              <Text className="text-sm text-muted-foreground">
                {MOCK_UNREAD_MESSAGES} message
                {MOCK_UNREAD_MESSAGES > 1 ? "s" : ""} non lu
                {MOCK_UNREAD_MESSAGES > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center">
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color="#F691C3" />
        </View>
      </View>
    </Pressable>
  );
}

function SuiviWidgets() {
  const maxMonthlyValue = Math.max(...MOCK_MONTHLY_DATA.map((d) => d.value));
  const maxWeeklyValue = Math.max(...MOCK_WEEKLY_DATA.map((d) => d.value));

  return (
    <View className="mb-4">
      <Text className="mb-3 text-lg font-semibold text-foreground">Suivi</Text>

      {/* Monthly bar chart */}
      <View className="mb-3 rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Mensuel
        </Text>
        <View className="h-24 flex-row items-end justify-between">
          {MOCK_MONTHLY_DATA.map((item) => (
            <View key={item.month} className="items-center">
              <View
                className="w-6 rounded-t-md bg-primary"
                style={{ height: (item.value / maxMonthlyValue) * 80 }}
              />
              <Text className="mt-1 text-xs text-muted-foreground">
                {item.month}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly line graph (simplified as dots) */}
      <View className="rounded-2xl bg-card p-4">
        <Text className="mb-3 text-sm font-medium text-muted-foreground">
          Hebdomadaire
        </Text>
        <View className="h-16 flex-row items-end justify-between">
          {MOCK_WEEKLY_DATA.map((item, index) => (
            <View key={`${item.day}-${index}`} className="items-center">
              <View
                className="h-3 w-3 rounded-full bg-primary"
                style={{
                  marginBottom: (item.value / maxWeeklyValue) * 40,
                }}
              />
              <Text className="mt-2 text-xs text-muted-foreground">
                {item.day}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function CalendarWidget() {
  const router = useRouter();
  const today = new Date();
  const dayName = today.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayNumber = today.getDate();
  const monthName = today.toLocaleDateString("fr-FR", { month: "long" });

  return (
    <Pressable
      onPress={() => router.push("/organisation" as `/organisation`)}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Calendar size={28} color="#F691C3" />
          </View>
          <View>
            <Text className="text-lg font-semibold capitalize text-foreground">
              {dayName}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {dayNumber} {monthName}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

function TodoWidget() {
  const router = useRouter();

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-foreground">To do</Text>
        <Pressable
          onPress={() => router.push("/organisation" as `/organisation`)}
          className="flex-row items-center"
        >
          <Text className="mr-1 text-sm text-primary">Voir plus</Text>
          <ChevronRight size={16} color="#F691C3" />
        </Pressable>
      </View>
      <View className="gap-2">
        {MOCK_TODO_ITEMS.map((item) => (
          <View key={item.id} className="flex-row items-center gap-3">
            <Checkbox checked={item.completed} />
            <Text
              className={`flex-1 text-base ${
                item.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function JournalWidget() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/journal/create")}
      className="mb-4 rounded-2xl bg-card p-4 active:opacity-90"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <PenLine size={24} color="#F691C3" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">Journal</Text>
          <Text className="text-sm text-muted-foreground">
            Écrire une entrée
          </Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

function MoodWidget() {
  const router = useRouter();
  const moods = ["😢", "😕", "😐", "🙂", "😊"];

  return (
    <View className="mb-4 rounded-2xl bg-card p-4">
      <View className="mb-3 flex-row items-center gap-2">
        <Smile size={20} color="#F691C3" />
        <Text className="text-lg font-semibold text-foreground">Humeur</Text>
      </View>
      <View className="flex-row justify-between">
        {moods.map((mood) => (
          <Pressable
            key={mood}
            onPress={() => router.push("/(protected)/moodboard")}
            className="h-12 w-12 items-center justify-center rounded-full bg-muted active:bg-muted/80"
          >
            <Text className="text-2xl">{mood}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function InviteFriendsButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/friends")}
      className="mb-6 flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-90"
    >
      <UserPlus size={20} color="#FFFFFF" />
      <Text className="text-base font-semibold text-white">
        Inviter des ami•es
      </Text>
    </Pressable>
  );
}

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
