import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

export function InviteFriendsButton() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/(protected)/friends")}
      className="self-center rounded-full border border-primary/50 px-8 py-3 active:bg-primary/5"
    >
      <Text className="text-sm font-medium text-foreground">
        Inviter des ami·es
      </Text>
    </Pressable>
  );
}
