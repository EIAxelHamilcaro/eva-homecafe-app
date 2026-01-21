import { Tabs } from "expo-router";
import { Bell, Home, MessageCircle, User } from "lucide-react-native";
import { Platform, Text, View } from "react-native";

import { useUnreadCount } from "@/lib/api/hooks/use-notifications";

function NotificationBadge({
  count,
  color,
  focused,
}: {
  count: number;
  color: string;
  focused: boolean;
}) {
  return (
    <View>
      <Bell size={24} color={color} fill={focused ? color : "transparent"} />
      {count > 0 && (
        <View className="absolute -right-2 -top-1 min-w-[18px] items-center justify-center rounded-full bg-homecafe-pink px-1">
          <Text className="text-xs font-semibold text-white">
            {count > 99 ? "99+" : count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#F691C3",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Home
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
          title: "Messages",
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
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <NotificationBadge
              count={unreadCount}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
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
