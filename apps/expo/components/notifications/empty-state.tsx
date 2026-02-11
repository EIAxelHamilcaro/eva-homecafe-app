import { Bell } from "lucide-react-native";
import { Text, View } from "react-native";

export function NoNotificationsEmpty() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Bell size={40} color="#9CA3AF" />
      </View>
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Aucune notification
      </Text>
      <Text className="text-center text-sm leading-5 text-muted-foreground">
        Vous recevrez des notifications pour les demandes d'amis et les messages
      </Text>
    </View>
  );
}
