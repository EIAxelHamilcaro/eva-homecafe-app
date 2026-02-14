import { Tabs } from "expo-router";
import {
  BookOpen,
  CalendarDays,
  House,
  MessageCircle,
  Palette,
  User,
  Users,
} from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/config/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.homecafe.yellow,
        tabBarInactiveTintColor: colors.icon.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <House
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <BookOpen
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="moodboard"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Palette
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="organisation"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <CalendarDays
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Users
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <MessageCircle
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <User
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
