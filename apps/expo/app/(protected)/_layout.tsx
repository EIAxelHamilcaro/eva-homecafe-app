import { Redirect, Stack } from "expo-router";
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

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="friends" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="moodboard" />
      <Stack.Screen
        name="recompenses"
        options={{
          presentation: "modal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="stickers"
        options={{
          presentation: "modal",
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="galerie"
        options={{
          presentation: "modal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
