import { useRouter } from "expo-router";
import { UserPlus, Users } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";

import { Card, CardContent } from "@/components/ui/card";
import { useFriends } from "@/lib/api/hooks/use-friends";
import { env } from "@/src/config/env";
import type { Friend } from "@/types/friend";

function getAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${env.apiUrl}${avatarUrl}`;
}

function AvatarThumbnail({ friend }: { friend: Friend }) {
  const name = friend.displayName ?? friend.name ?? "?";
  const initial = name.charAt(0).toUpperCase();
  const uri = getAvatarUrl(friend.avatarUrl);

  if (uri) {
    return (
      <View className="-ml-2 first:ml-0 h-9 w-9 overflow-hidden rounded-full border-2 border-white">
        <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
      </View>
    );
  }

  return (
    <View className="-ml-2 first:ml-0 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-homecafe-pink/20">
      <Text className="text-xs font-semibold text-homecafe-pink">
        {initial}
      </Text>
    </View>
  );
}

export function FriendsCard() {
  const router = useRouter();
  const { data } = useFriends(1, 4);

  const friends = data?.friends ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <Card>
      <CardContent className="p-6">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Users size={20} color="#F691C3" />
            <Text className="text-sm font-semibold text-foreground">Amis</Text>
          </View>
          <Text className="text-sm text-muted-foreground">{total}</Text>
        </View>

        {friends.length > 0 ? (
          <View className="mb-3 flex-row pl-2">
            {friends.map((friend) => (
              <AvatarThumbnail key={friend.id} friend={friend} />
            ))}
            {total > 4 && (
              <View className="-ml-2 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-muted">
                <Text className="text-xs font-medium text-muted-foreground">
                  +{total - 4}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text className="mb-3 text-sm text-muted-foreground">
            Aucun ami pour le moment
          </Text>
        )}

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => router.push("/(protected)/friends")}
            className="flex-1 items-center justify-center rounded-xl border border-border py-2.5 active:bg-muted"
          >
            <Text className="text-sm font-medium text-foreground">
              Voir tout
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(protected)/friends/add")}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 active:bg-primary/80"
          >
            <UserPlus size={16} color="#FFFFFF" />
            <Text className="text-sm font-medium text-white">Inviter</Text>
          </Pressable>
        </View>
      </CardContent>
    </Card>
  );
}
