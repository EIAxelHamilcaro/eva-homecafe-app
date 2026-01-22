import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Logo } from "components/ui/logo";
import { useRouter } from "expo-router";
import { useSignOut } from "lib/api/hooks/use-auth";
import { useGenerateInvite } from "lib/api/hooks/use-invite";
import { useEnsureProfile } from "lib/api/hooks/use-profile";
import { ChevronDown, Mail, Menu, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";

function DropdownField({ label }: { label: string }) {
  return (
    <View className="mb-3">
      <Pressable className="flex-row items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <ChevronDown size={16} color="#8D7E7E" />
      </Pressable>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const signOutMutation = useSignOut();
  const { profile, isLoading, ensureProfile } = useEnsureProfile();
  const { data: inviteData } = useGenerateInvite();
  const [profileVisible, setProfileVisible] = useState(true);

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
  const avatarUrl = profile?.avatarUrl;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Logo width={80} />
        <Pressable className="h-10 w-10 items-center justify-center rounded-full active:bg-muted">
          <Menu size={24} color="#3D2E2E" />
        </Pressable>
      </View>

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

          {user?.email && (
            <View className="flex-row items-center gap-2">
              <Mail size={16} color="#8D7E7E" />
              <Text className="text-sm text-muted-foreground">
                {user.email}
              </Text>
            </View>
          )}
        </View>

        <View className="px-4">
          <Pressable
            onPress={() => router.push("/profile/edit")}
            className="mb-4 rounded-full bg-homecafe-pink px-4 py-3"
          >
            <Text className="text-center font-medium text-white">
              Modifier le profil
            </Text>
          </Pressable>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <DropdownField label="Langue" />
              <DropdownField label="Format heure" />
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-sm text-foreground">Profil visible</Text>
                <Switch
                  value={profileVisible}
                  onValueChange={setProfileVisible}
                  trackColor={{ false: "#E8DED4", true: "#F691C3" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              <Pressable className="mt-2 rounded-full bg-homecafe-pink px-4 py-2">
                <Text className="text-center font-medium text-white">
                  Valider les informations
                </Text>
              </Pressable>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Badges</CardTitle>
              <Text className="text-xs text-muted-foreground">
                Tous les badges que tu as obtenu en tenant un journal régulier
              </Text>
            </CardHeader>
            <CardContent>
              <View className="flex-row justify-around py-4">
                <View className="items-center">
                  <View className="mb-2 h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-red-100">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-red-400 to-red-600">
                      <Text className="text-xs font-bold text-white">7</Text>
                      <Text className="text-xs font-bold text-white">
                        JOURS
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="items-center">
                  <View className="mb-2 h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-purple-100">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-purple-400 to-purple-600">
                      <Text className="text-xs font-bold text-white">14</Text>
                      <Text className="text-xs font-bold text-white">
                        JOURS
                      </Text>
                    </View>
                  </View>
                </View>
                <View className="items-center">
                  <View className="mb-2 h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                    <View className="h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-blue-400 to-blue-600">
                      <Text className="text-xs font-bold text-white">1</Text>
                      <Text className="text-xs font-bold text-white">MOIS</Text>
                    </View>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Code amis</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="items-center py-4">
                {inviteData?.inviteUrl ? (
                  <View className="rounded-2xl bg-white p-4">
                    <QRCode
                      value={inviteData.inviteUrl}
                      size={180}
                      color="#3D2E2E"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : (
                  <View className="h-48 w-48 items-center justify-center rounded-2xl bg-muted">
                    <ActivityIndicator size="small" color="#F691C3" />
                  </View>
                )}
              </View>
            </CardContent>
          </Card>

          <View className="mb-8 gap-3">
            <Button
              variant="ghost"
              onPress={() => signOutMutation.mutate()}
              loading={signOutMutation.isPending}
            >
              <View className="flex-row items-center gap-2">
                <Text className="font-medium text-homecafe-pink">
                  Se déconnecter
                </Text>
              </View>
            </Button>

            <Button variant="ghost">
              <View className="flex-row items-center gap-2">
                <Text className="font-medium text-destructive">
                  Supprimer le compte
                </Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
