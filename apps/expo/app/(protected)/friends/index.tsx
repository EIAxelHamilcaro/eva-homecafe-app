import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-foreground">Friends List - Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}
