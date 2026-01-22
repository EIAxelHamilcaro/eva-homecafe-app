import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox";
import { Dropdown } from "components/ui/dropdown";
import { RadioGroup, RadioGroupItem } from "components/ui/radio-group";
import { Toggle } from "components/ui/toggle";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Monitor,
  Smartphone,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ConnectedDevice {
  id: string;
  name: string;
  type: "desktop" | "mobile";
}

export default function SettingsScreen() {
  const router = useRouter();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newMessagesNotif, setNewMessagesNotif] = useState(true);
  const [invitationsNotif, setInvitationsNotif] = useState(true);

  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [connectedDevices] = useState<ConnectedDevice[]>([
    { id: "1", name: "MacBook Pro d'Eva", type: "desktop" },
    { id: "2", name: "iPhone d'Axel", type: "mobile" },
  ]);

  const [profileVisible, setProfileVisible] = useState(true);
  const [rewardsVisibility, setRewardsVisibility] = useState("friends");

  const [themeMode, setThemeMode] = useState("light");
  const [textSizeSmall, setTextSizeSmall] = useState(false);
  const [textSizeMedium, setTextSizeMedium] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const rewardsVisibilityOptions = [
    { label: "Tout le monde", value: "everyone" },
    { label: "Amis", value: "friends" },
    { label: "Personne", value: "nobody" },
  ];

  const handleDownloadData = () => {
    // TODO: Implement data download
  };

  const handleSaveNotifications = () => {
    // TODO: Save notification preferences
  };

  const handleSaveCustomMode = () => {
    // TODO: Save custom mode preferences
  };

  const handleLogout = () => {
    // TODO: Implement logout
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
  };

  const handleInviteFriends = () => {
    // TODO: Implement invite friends
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full active:bg-muted"
        >
          <ChevronLeft size={24} color="#3D2E2E" />
        </Pressable>
        <Text className="text-xl font-semibold text-foreground">Réglages</Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">
                  Notifications par e-mail
                </Text>
                <Toggle
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">
                  Notifications push
                </Text>
                <Toggle
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </View>

              <View className="h-px bg-border" />

              <View className="gap-3">
                <Checkbox
                  checked={newMessagesNotif}
                  onCheckedChange={setNewMessagesNotif}
                  label="Nouveaux messages"
                />
                <Checkbox
                  checked={invitationsNotif}
                  onCheckedChange={setInvitationsNotif}
                  label="Invitations"
                />
              </View>

              <Button onPress={handleSaveNotifications} className="mt-2">
                <Text className="font-medium text-white">
                  Enregistrer les préférences
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">
                  Double authentification
                </Text>
                <Toggle
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </View>

              <View>
                <Text className="mb-3 text-sm font-medium text-foreground">
                  Appareils connectés
                </Text>
                <View className="gap-3">
                  {connectedDevices.map((device) => (
                    <View
                      key={device.id}
                      className="flex-row items-center gap-3"
                    >
                      {device.type === "desktop" ? (
                        <Monitor size={20} color="#8D7E7E" />
                      ) : (
                        <Smartphone size={20} color="#8D7E7E" />
                      )}
                      <Text className="text-sm text-foreground">
                        {device.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Confidentialité</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Profil visible</Text>
                <Toggle
                  checked={profileVisible}
                  onCheckedChange={setProfileVisible}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm text-foreground">
                  Qui peut voir mes récompenses
                </Text>
                <Dropdown
                  value={rewardsVisibility}
                  options={rewardsVisibilityOptions}
                  onValueChange={setRewardsVisibility}
                  triggerClassName="w-32"
                />
              </View>

              <Button
                variant="outline"
                onPress={handleDownloadData}
                className="mt-2 self-start border-primary"
              >
                <Text className="text-sm font-medium text-primary">
                  Télécharger mes données
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Custom mode</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-4">
              <RadioGroup
                value={themeMode}
                onValueChange={setThemeMode}
                orientation="horizontal"
              >
                <RadioGroupItem value="light" label="Clair" />
                <RadioGroupItem value="dark" label="Sombre" />
              </RadioGroup>

              <View>
                <Text className="mb-3 text-sm text-foreground">
                  Taille du texte
                </Text>
                <View className="gap-3">
                  <Checkbox
                    checked={textSizeSmall}
                    onCheckedChange={setTextSizeSmall}
                    label="Petit"
                  />
                  <Checkbox
                    checked={textSizeMedium}
                    onCheckedChange={setTextSizeMedium}
                    label="Moyen"
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Animations</Text>
                <Toggle
                  checked={animationsEnabled}
                  onCheckedChange={setAnimationsEnabled}
                />
              </View>

              <Button onPress={handleSaveCustomMode} className="mt-2">
                <Text className="font-medium text-white">
                  Enregistrer les préférences
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">À propos</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-3">
              <Text className="text-sm text-foreground">
                Version de l'application 1.0.3
              </Text>

              <Pressable className="flex-row items-center justify-between py-1 active:opacity-70">
                <Text className="text-sm text-foreground">
                  Mentions légales
                </Text>
                <ChevronRight size={20} color="#8D7E7E" />
              </Pressable>

              <Pressable className="flex-row items-center justify-between py-1 active:opacity-70">
                <Text className="text-sm text-foreground">
                  Politique de confidentialité
                </Text>
                <ChevronRight size={20} color="#8D7E7E" />
              </Pressable>

              <Pressable className="flex-row items-center justify-between py-1 active:opacity-70">
                <Text className="text-sm text-foreground">Centre d'aide</Text>
                <ChevronRight size={20} color="#8D7E7E" />
              </Pressable>
            </View>
          </CardContent>
        </Card>

        <View className="mb-4 gap-3 px-2">
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center gap-3 py-2 active:opacity-70"
          >
            <LogOut size={20} color="#3D2E2E" />
            <Text className="text-sm text-foreground">Se déconnecter</Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            className="flex-row items-center gap-3 py-2 active:opacity-70"
          >
            <Trash2 size={20} color="#E53935" />
            <Text className="text-sm text-destructive">
              Supprimer le compte
            </Text>
          </Pressable>
        </View>

        <View className="items-center pb-8 pt-4">
          <Button
            variant="outline"
            onPress={handleInviteFriends}
            className="border-foreground px-8"
          >
            <Text className="text-sm font-medium text-foreground">
              Inviter des ami•es
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
