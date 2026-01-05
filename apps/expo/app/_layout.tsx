import "../src/global.css";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Providers from "@/providers";

export default function RootLayout() {
  return (
    <Providers>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, title: "Accueil" }}
        />
      </Tabs>
      <StatusBar style="dark" />
    </Providers>
  );
}
