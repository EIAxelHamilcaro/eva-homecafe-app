import { type Href, useRouter } from "expo-router";
import { User } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { formatDay, formatMonth } from "@/lib/utils/post-format";
import { colors } from "@/src/config/colors";
import { useAuth } from "@/src/providers/auth-provider";

interface JournalHeaderProps {
  today: string;
}

export function JournalHeader({ today }: JournalHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-row items-stretch gap-3">
      <View
        className="shrink-0 flex-row items-center justify-center rounded bg-homecafe-green px-1 py-2"
        style={{ width: 100 }}
      >
        <Text className="text-xs text-white -rotate-90">
          {formatMonth(today)}
        </Text>
        <Text className="text-5xl font-bold text-white ">
          {formatDay(today)}
        </Text>
      </View>

      <View className="flex-1 flex-row items-center justify-center gap-3 rounded bg-homecafe-blue/10 p-2">
        {user?.image ? (
          <Image
            source={{ uri: user.image }}
            className="h-12 w-12 shrink-0 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-full bg-homecafe-pink-light">
            <User size={26} color={colors.homecafe.pink} />
          </View>
        )}
        <Pressable
          onPress={() =>
            router.push("/(protected)/(tabs)/journal/create" as Href)
          }
          className="min-w-0 flex-1 items-start justify-center rounded-full border border-homecafe-pink bg-transparent px-4 py-3 active:bg-homecafe-pink/10"
        >
          <Text className="text-sm text-foreground">Ajouter un post</Text>
        </Pressable>
      </View>
    </View>
  );
}
