import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Checkbox } from "components/ui/checkbox";
import { Dropdown } from "components/ui/dropdown";
import { RadioGroup, RadioGroupItem } from "components/ui/radio-group";
import { Toggle } from "components/ui/toggle";
import { useRouter } from "expo-router";
import { useSignOut } from "lib/api/hooks/use-auth";
import { useGenerateInvite } from "lib/api/hooks/use-invite";
import { useSettings, useUpdateSettings } from "lib/api/hooks/use-settings";
import { ChevronLeft, ChevronRight, LogOut, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  languageOptions,
  rewardsVisibilityOptions,
  timeFormatOptions,
} from "@/types/settings";

function SettingsSkeleton() {
  return (
    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="mb-4 rounded-xl border border-border bg-card p-4"
        >
          <View className="mb-4 h-5 w-32 rounded bg-muted" />
          <View className="gap-3">
            <View className="h-4 w-full rounded bg-muted" />
            <View className="h-4 w-3/4 rounded bg-muted" />
            <View className="h-4 w-1/2 rounded bg-muted" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const signOutMutation = useSignOut();
  const { data: inviteData } = useGenerateInvite();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifyNewMessages, setNotifyNewMessages] = useState(true);
  const [notifyFriendActivity, setNotifyFriendActivity] = useState(true);
  const [notifyBadgesEarned, setNotifyBadgesEarned] = useState(true);
  const [notifyJournalReminder, setNotifyJournalReminder] = useState(true);

  const [themeMode, setThemeMode] = useState("system");
  const [language, setLanguage] = useState("fr");
  const [timeFormat, setTimeFormat] = useState("24h");

  const [savingSection, setSavingSection] = useState<
    "notifications" | "customMode" | null
  >(null);

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications);
      setPushNotifications(settings.pushNotifications);
      setNotifyNewMessages(settings.notifyNewMessages);
      setNotifyFriendActivity(settings.notifyFriendActivity);
      setNotifyBadgesEarned(settings.notifyBadgesEarned);
      setNotifyJournalReminder(settings.notifyJournalReminder);
      setThemeMode(settings.themeMode);
      setLanguage(settings.language);
      setTimeFormat(settings.timeFormat);
    }
  }, [settings]);

  useEffect(() => {
    if (isError) {
      Alert.alert("Erreur", "Impossible de charger les réglages.");
    }
  }, [isError]);

  const handleSaveNotifications = () => {
    setSavingSection("notifications");
    updateSettings.mutate(
      {
        emailNotifications,
        pushNotifications,
        notifyNewMessages,
        notifyFriendActivity,
        notifyBadgesEarned,
        notifyJournalReminder,
      },
      {
        onSuccess: () =>
          Alert.alert("Succès", "Préférences de notifications enregistrées."),
        onError: () =>
          Alert.alert("Erreur", "Impossible de sauvegarder les notifications."),
        onSettled: () => setSavingSection(null),
      },
    );
  };

  const handlePrivacyToggle = (field: "profileVisibility", value: boolean) => {
    updateSettings.mutate(
      { [field]: value },
      {
        onError: () =>
          Alert.alert(
            "Erreur",
            "Impossible de mettre à jour la confidentialité.",
          ),
      },
    );
  };

  const handleRewardsVisibilityChange = (value: string) => {
    updateSettings.mutate(
      { rewardsVisibility: value as "everyone" | "friends" | "nobody" },
      {
        onError: () =>
          Alert.alert("Erreur", "Impossible de mettre à jour la visibilité."),
      },
    );
  };

  const handleSaveCustomMode = () => {
    setSavingSection("customMode");
    updateSettings.mutate(
      {
        themeMode: themeMode as "light" | "dark" | "system",
        language: language as "fr" | "en",
        timeFormat: timeFormat as "12h" | "24h",
      },
      {
        onSuccess: () =>
          Alert.alert("Succès", "Préférences d'affichage enregistrées."),
        onError: () =>
          Alert.alert("Erreur", "Impossible de sauvegarder les préférences."),
        onSettled: () => setSavingSection(null),
      },
    );
  };

  const handleLogout = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
      onError: () => Alert.alert("Erreur", "Impossible de se déconnecter."),
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer le compte",
      "La suppression définitive sera disponible prochainement. Voulez-vous vous déconnecter en attendant ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: handleLogout,
        },
      ],
    );
  };

  const handleInviteFriends = async () => {
    const url = inviteData?.inviteUrl;
    if (!url) {
      Alert.alert("Erreur", "Impossible de générer le lien d'invitation.");
      return;
    }
    await Share.share({
      message: `Rejoins-moi sur HomeCafé ! ${url}`,
      url,
    });
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Bientôt disponible",
      "Le téléchargement des données sera disponible prochainement.",
    );
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

      {isLoading ? (
        <SettingsSkeleton />
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="mb-4 text-center text-base text-muted-foreground">
            Impossible de charger les réglages.
          </Text>
          <Button onPress={() => refetch()}>
            <Text className="font-medium text-white">Réessayer</Text>
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Notifications */}
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
                    checked={notifyNewMessages}
                    onCheckedChange={setNotifyNewMessages}
                    label="Nouveaux messages"
                  />
                  <Checkbox
                    checked={notifyFriendActivity}
                    onCheckedChange={setNotifyFriendActivity}
                    label="Activité des amis"
                  />
                  <Checkbox
                    checked={notifyBadgesEarned}
                    onCheckedChange={setNotifyBadgesEarned}
                    label="Badges obtenus"
                  />
                  <Checkbox
                    checked={notifyJournalReminder}
                    onCheckedChange={setNotifyJournalReminder}
                    label="Rappel journal"
                  />
                </View>

                <Button
                  onPress={handleSaveNotifications}
                  loading={
                    updateSettings.isPending &&
                    savingSection === "notifications"
                  }
                  className="mt-2"
                >
                  <Text className="font-medium text-white">
                    Enregistrer les préférences
                  </Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Confidentialité */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Confidentialité</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">
                    Profil visible
                  </Text>
                  <Toggle
                    checked={settings?.profileVisibility ?? true}
                    onCheckedChange={(value) =>
                      handlePrivacyToggle("profileVisibility", value)
                    }
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm text-foreground">
                    Qui peut voir mes récompenses
                  </Text>
                  <Dropdown
                    value={settings?.rewardsVisibility ?? "friends"}
                    options={rewardsVisibilityOptions}
                    onValueChange={handleRewardsVisibilityChange}
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

          {/* Custom mode */}
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
                  <RadioGroupItem value="system" label="Système" />
                </RadioGroup>

                <View>
                  <Text className="mb-2 text-sm text-foreground">Langue</Text>
                  <Dropdown
                    value={language}
                    options={languageOptions}
                    onValueChange={setLanguage}
                  />
                </View>

                <View>
                  <Text className="mb-2 text-sm text-foreground">
                    Format heure
                  </Text>
                  <Dropdown
                    value={timeFormat}
                    options={timeFormatOptions}
                    onValueChange={setTimeFormat}
                  />
                </View>

                <Button
                  onPress={handleSaveCustomMode}
                  loading={
                    updateSettings.isPending && savingSection === "customMode"
                  }
                  className="mt-2"
                >
                  <Text className="font-medium text-white">
                    Enregistrer les préférences
                  </Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* À propos */}
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
              disabled={signOutMutation.isPending}
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
                Inviter des ami·es
              </Text>
            </Button>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
