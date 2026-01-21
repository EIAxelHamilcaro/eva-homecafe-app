import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useRouter } from "expo-router";
import { useSignOut } from "lib/api/hooks/use-auth";
import { useEnsureProfile } from "lib/api/hooks/use-profile";
import { Pencil, User, Users } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const signOutMutation = useSignOut();
  const { profile, isLoading, ensureProfile } = useEnsureProfile();

  useEffect(() => {
    if (user?.name && !isLoading && !profile) {
      ensureProfile(user.name);
    }
  }, [user?.name, isLoading, profile, ensureProfile]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F691C3" />
      </SafeAreaView>
    );
  }

  const displayName = profile?.displayName ?? user?.name ?? "Utilisateur";
  const bio = profile?.bio;
  const avatarUrl = profile?.avatarUrl;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center px-4 pb-6 pt-4">
          <View className="mb-4 h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-homecafe-pink-light">
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <User size={56} color="#F691C3" />
            )}
          </View>

          <Text className="mb-1 text-center text-2xl font-bold text-foreground">
            {displayName}
          </Text>
          {memberSince && (
            <Text className="mb-4 text-center text-sm text-muted-foreground">
              Membre depuis {memberSince}
            </Text>
          )}

          <Pressable
            onPress={() => router.push("/profile/edit")}
            className="flex-row items-center gap-2 rounded-full bg-homecafe-pink px-4 py-2"
          >
            <Pencil size={16} color="#FFFFFF" />
            <Text className="font-medium text-white">Modifier le profil</Text>
          </Pressable>
        </View>

        <View className="px-4">
          {bio && (
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-foreground">{bio}</Text>
              </CardContent>
            </Card>
          )}

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Email</Text>
                <Text className="font-medium text-foreground">
                  {user?.email ?? "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Nom</Text>
                <Text className="font-medium text-foreground">
                  {user?.name ?? "-"}
                </Text>
              </View>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="mb-4"
            onPress={() => router.push("/friends")}
          >
            <View className="flex-row items-center gap-2">
              <Users size={20} color="#3D2E2E" />
              <Text className="font-semibold text-foreground">Mes amis</Text>
            </View>
          </Button>

          <Button
            variant="destructive"
            onPress={() => signOutMutation.mutate()}
            loading={signOutMutation.isPending}
            className="mb-8"
          >
            Se déconnecter
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
