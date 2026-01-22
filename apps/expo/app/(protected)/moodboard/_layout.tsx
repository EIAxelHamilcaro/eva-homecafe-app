import { Stack } from "expo-router";

export default function MoodboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="tracker"
        options={{
          presentation: "modal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
