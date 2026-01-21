import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "src/providers/auth-provider";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F691C3" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/register" />;
  }

  return <Slot />;
}
