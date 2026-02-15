import { Tabs } from "expo-router";
import {
  Bell,
  BookOpen,
  CalendarDays,
  House,
  MessageCircle,
  Palette,
  User,
  Users,
} from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUnreadCount } from "@/lib/api/hooks/use-notifications";

import { colors } from "@/src/config/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

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
        name="notifications"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ width: 28, height: 28 }}>
              <Bell
                size={24}
                color={color}
                fill={focused ? color : "transparent"}
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -8,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#F691C3",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
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
