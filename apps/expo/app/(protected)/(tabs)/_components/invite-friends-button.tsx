import { useRouter } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { colors } from "@/src/config/colors";

export function InviteFriendsButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/friends")}
      className="mb-6 flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-90"
    >
      <UserPlus size={20} color={colors.white} />
      <Text className="text-base font-semibold text-white">
        Inviter des ami•es
      </Text>
    </Pressable>
  );
}
