import { Button } from "components/ui/button";
import { Card, CardContent } from "components/ui/card";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { api } from "lib/api/client";
import { useSignOut } from "lib/api/hooks/use-auth";
import { useGenerateInvite } from "lib/api/hooks/use-invite";
import { useEnsureProfile, useUpdateProfile } from "lib/api/hooks/use-profile";
import { useBadges } from "lib/api/hooks/use-rewards";
import {
  Calendar,
  Camera,
  ChevronRight,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "src/providers/auth-provider";
import type { ProfileAddress } from "@/types/profile";
import type { RewardCollectionItemDto } from "@/types/reward";

const BADGE_CATEGORIES: { label: string; keys: string[] }[] = [
  {
    label: "Régularité",
    keys: ["journal-streak-7", "journal-streak-14", "journal-streak-30"],
  },
  {
    label: "Premiers pas",
    keys: [
      "first-post",
      "first-mood",
      "first-photo",
      "first-moodboard",
      "first-friend",
    ],
  },
  {
    label: "Jalons",
    keys: [
      "posts-10",
      "posts-50",
      "photos-10",
      "photos-50",
      "friends-5",
      "friends-10",
    ],
  },
  {
    label: "Spécial",
    keys: ["all-moods-recorded", "kanban-master"],
  },
];

const EMOJI_BADGES: Record<string, { emoji: string; bg: string }> = {
  "first-post": { emoji: "📝", bg: "bg-amber-100" },
  "first-mood": { emoji: "😊", bg: "bg-pink-100" },
  "first-photo": { emoji: "📸", bg: "bg-sky-100" },
  "first-moodboard": { emoji: "🎨", bg: "bg-violet-100" },
  "first-friend": { emoji: "🤝", bg: "bg-emerald-100" },
  "posts-10": { emoji: "✍️", bg: "bg-amber-200" },
  "photos-10": { emoji: "🖼️", bg: "bg-sky-200" },
  "posts-50": { emoji: "📚", bg: "bg-orange-200" },
  "photos-50": { emoji: "🏆", bg: "bg-yellow-200" },
  "friends-5": { emoji: "👥", bg: "bg-emerald-200" },
  "friends-10": { emoji: "🌟", bg: "bg-teal-200" },
  "all-moods-recorded": { emoji: "🌈", bg: "bg-fuchsia-100" },
  "kanban-master": { emoji: "✅", bg: "bg-lime-100" },
};

function BadgeIcon({ reward }: { reward: RewardCollectionItemDto }) {
  const emojiBadge = EMOJI_BADGES[reward.key];
  const earnedClass = !reward.earned ? "opacity-30" : "";

  return (
    <View className="items-center gap-1.5">
      <View className={`h-16 w-16 items-center justify-center ${earnedClass}`}>
        <View
          className={`h-14 w-14 items-center justify-center rounded-2xl ${emojiBadge?.bg ?? "bg-gray-100"}`}
        >
          <Text className="text-2xl">{emojiBadge?.emoji ?? "🏅"}</Text>
        </View>
      </View>
      <Text
        className={`max-w-20 text-center text-[10px] leading-tight ${reward.earned ? "font-medium text-foreground" : "text-muted-foreground"}`}
      >
        {reward.name}
      </Text>
    </View>
  );
}

function formatBirthday(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function QrCodeSection() {
  const {
    data: inviteData,
    refetch,
    isLoading,
    isFetching,
  } = useGenerateInvite();
  const [hasRequested, setHasRequested] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFetching && !inviteData?.inviteUrl) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isFetching, inviteData?.inviteUrl, animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  function handleGenerate() {
    setHasRequested(true);
    refetch();
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <Text className="mb-4 text-lg font-semibold text-foreground">
          Code amis
        </Text>

        {!hasRequested && !inviteData ? (
          <View className="items-center gap-3 py-4">
            <View className="h-44 w-44 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
              <QrCode size={48} color="#9CA3AF" />
            </View>
            <Button
              onPress={handleGenerate}
              disabled={isLoading || isFetching}
              className="rounded-full px-5"
            >
              <Text className="font-medium text-white">
                Générer mon QR code
              </Text>
            </Button>
          </View>
        ) : isFetching && !inviteData?.inviteUrl ? (
          <View className="items-center justify-center py-4">
            <Animated.View
              style={{ opacity }}
              className="h-44 w-44 rounded-lg bg-muted"
            />
          </View>
        ) : inviteData?.inviteUrl ? (
          <View className="items-center gap-3 py-4">
            <View className="rounded-2xl bg-white p-4">
              <QRCode
                value={inviteData.inviteUrl}
                size={176}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text className="text-center text-xs text-muted-foreground">
              Scannez ce QR code pour m'ajouter en ami
            </Text>
            <Button
              onPress={handleGenerate}
              disabled={isFetching}
              className="rounded-full px-5"
            >
              {isFetching ? (
                <Loader2 size={16} color="#FFFFFF" />
              ) : (
                <Text className="font-medium text-white">Nouveau code</Text>
              )}
            </Button>
          </View>
        ) : (
          <View className="items-center justify-center py-4">
            <Text className="text-sm text-destructive">
              Erreur lors de la génération du QR code
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const signOutMutation = useSignOut();
  const { profile, isLoading, ensureProfile } = useEnsureProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: allBadges } = useBadges();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    displayName: "",
    birthday: "",
    phone: "",
    profession: "",
  });

  const [addressForm, setAddressForm] = useState<ProfileAddress>({
    street: "",
    zipCode: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (user?.name && !isLoading && !profile) {
      ensureProfile(user.name);
    }
  }, [user?.name, isLoading, profile, ensureProfile]);

  useEffect(() => {
    if (profile) {
      setPersonalForm({
        displayName: profile.displayName ?? user?.name ?? "",
        birthday: profile.birthday?.split("T")[0] ?? "",
        phone: profile.phone ?? "",
        profession: profile.profession ?? "",
      });
      setAddressForm({
        street: profile.address?.street ?? "",
        zipCode: profile.address?.zipCode ?? "",
        city: profile.address?.city ?? "",
        country: profile.address?.country ?? "",
      });
    }
  }, [profile, user?.name]);

  const earnedBadges = allBadges?.filter((b) => b.earned) ?? [];
  const totalRewardsCount = allBadges?.length ?? 0;
  const earnedRewardsCount = earnedBadges.length;

  const displayName = profile?.displayName ?? user?.name ?? "Utilisateur";
  const avatarUrl = profile?.avatarUrl;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;
  const firstName = displayName.split(" ")[0] || "";
  const lastName = displayName.split(" ").slice(1).join(" ") || "";

  const handleAvatarChange = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const uploadRes = await api.post<{ uploadUrl: string; fileUrl: string }>(
        "/api/v1/upload",
        {
          context: "avatar",
          filename: asset.fileName ?? "avatar.jpg",
          mimeType: asset.mimeType ?? "image/jpeg",
          size: asset.fileSize ?? 0,
        },
      );

      const fileBlob = await fetch(asset.uri).then((r) => r.blob());
      await fetch(uploadRes.uploadUrl, {
        method: "PUT",
        body: fileBlob,
        headers: { "Content-Type": asset.mimeType ?? "image/jpeg" },
      });

      updateProfileMutation.mutate({ avatarUrl: uploadRes.fileUrl });
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour l'avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }, [updateProfileMutation]);

  const handleSavePersonalInfo = useCallback(() => {
    updateProfileMutation.mutate(
      {
        displayName: personalForm.displayName,
        phone: personalForm.phone || null,
        birthday: personalForm.birthday || null,
        profession: personalForm.profession || null,
      },
      {
        onSuccess: () => setEditingPersonalInfo(false),
        onError: () =>
          Alert.alert("Erreur", "Impossible de sauvegarder les informations."),
      },
    );
  }, [personalForm, updateProfileMutation]);

  const handleSaveAddress = useCallback(() => {
    const hasAddress =
      addressForm.street &&
      addressForm.zipCode &&
      addressForm.city &&
      addressForm.country;
    updateProfileMutation.mutate(
      { address: hasAddress ? addressForm : null },
      {
        onSuccess: () => setEditingAddress(false),
        onError: () =>
          Alert.alert("Erreur", "Impossible de sauvegarder l'adresse."),
      },
    );
  }, [addressForm, updateProfileMutation]);

  const handleLogout = useCallback(() => {
    setLoggingOut(true);
    signOutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
      onError: () => {
        setLoggingOut(false);
        Alert.alert("Erreur", "Impossible de se déconnecter.");
      },
    });
  }, [signOutMutation, router]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr·e de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            signOutMutation.mutate(undefined, {
              onSuccess: () => router.replace("/login"),
            });
          },
        },
      ],
    );
  }, [signOutMutation, router]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F691C3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-semibold text-foreground">Profil</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header — Avatar + Infos */}
        <View className="items-center px-4 pb-4 pt-4">
          <Pressable
            onPress={handleAvatarChange}
            disabled={uploadingAvatar}
            className="relative mb-4"
          >
            <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-homecafe-pink-light">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <User size={36} color="#F691C3" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Camera size={14} color="#FFFFFF" />
            </View>
            {uploadingAvatar && (
              <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
                <Loader2 size={20} color="#FFFFFF" />
              </View>
            )}
          </Pressable>

          <Text className="mb-1 text-xl font-semibold text-foreground">
            {displayName}
          </Text>
          {memberSince && (
            <Text className="mb-2 text-xs text-muted-foreground">
              Membre depuis {memberSince}
            </Text>
          )}

          <View className="gap-1">
            {profile?.birthday && (
              <View className="flex-row items-center justify-center gap-1.5">
                <Calendar size={12} color="#8D7E7E" />
                <Text className="text-xs text-muted-foreground">
                  {formatBirthday(profile.birthday)}
                </Text>
              </View>
            )}
            {user?.email && (
              <View className="flex-row items-center justify-center gap-1.5">
                <Mail size={12} color="#8D7E7E" />
                <Text className="text-xs text-muted-foreground">
                  {user.email}
                </Text>
              </View>
            )}
            <View className="flex-row items-center justify-center gap-1.5">
              <Phone size={12} color="#8D7E7E" />
              <Text
                className={`text-xs ${profile?.phone ? "text-muted-foreground" : "italic text-muted-foreground"}`}
              >
                {profile?.phone ?? "Non renseigné"}
              </Text>
            </View>
            <View className="flex-row items-center justify-center gap-1.5">
              <MapPin size={12} color="#8D7E7E" />
              <Text
                className={`text-xs ${profile?.address ? "text-muted-foreground" : "italic text-muted-foreground"}`}
              >
                {profile?.address
                  ? `${profile.address.city}, ${profile.address.country}`
                  : "Non renseigné"}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4">
          {/* Récompenses */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <Text className="text-lg font-semibold text-foreground">
                Récompenses
              </Text>
              <Text className="text-xs text-muted-foreground">
                {earnedRewardsCount}/{totalRewardsCount}
              </Text>
              <View className="mt-4 flex-row items-center justify-center gap-3">
                {earnedBadges.length > 0 ? (
                  earnedBadges.slice(0, 4).map((badge) => {
                    const emojiBadge = EMOJI_BADGES[badge.key];
                    return (
                      <View key={badge.id} className="items-center gap-1.5">
                        <View
                          className={`h-[72px] w-[72px] items-center justify-center rounded-2xl ${emojiBadge?.bg ?? "bg-gray-100"}`}
                        >
                          <Text className="text-2xl">
                            {emojiBadge?.emoji ?? "🏅"}
                          </Text>
                        </View>
                        <Text className="max-w-20 text-center text-[10px] font-medium leading-tight text-foreground">
                          {badge.name}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <View className="flex-row gap-3">
                    {["📝", "😊", "📸"].map((emoji) => (
                      <View
                        key={`placeholder-${emoji}`}
                        className="h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gray-100 opacity-30"
                      >
                        <Text className="text-2xl">{emoji}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <Button
                onPress={() => setShowRewardsModal(true)}
                className="mt-4 self-center rounded-full px-6"
              >
                <Text className="font-medium text-white">Voir tout</Text>
              </Button>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <Text className="mb-4 text-lg font-semibold text-foreground">
                Informations personnelles
              </Text>
              {editingPersonalInfo ? (
                <View className="gap-4">
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Nom complet
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={personalForm.displayName}
                      onChangeText={(v) =>
                        setPersonalForm((f) => ({ ...f, displayName: v }))
                      }
                      autoCapitalize="words"
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Naissance (AAAA-MM-JJ)
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={personalForm.birthday}
                      onChangeText={(v) =>
                        setPersonalForm((f) => ({ ...f, birthday: v }))
                      }
                      placeholder="2000-01-15"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Téléphone
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={personalForm.phone}
                      onChangeText={(v) =>
                        setPersonalForm((f) => ({ ...f, phone: v }))
                      }
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Profession
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={personalForm.profession}
                      onChangeText={(v) =>
                        setPersonalForm((f) => ({ ...f, profession: v }))
                      }
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      onPress={handleSavePersonalInfo}
                      loading={updateProfileMutation.isPending}
                      className="rounded-full px-5"
                    >
                      <Text className="font-medium text-white">
                        Enregistrer
                      </Text>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onPress={() => {
                        setEditingPersonalInfo(false);
                        setPersonalForm({
                          displayName: profile?.displayName ?? user?.name ?? "",
                          birthday: profile?.birthday?.split("T")[0] ?? "",
                          phone: profile?.phone ?? "",
                          profession: profile?.profession ?? "",
                        });
                      }}
                    >
                      <Text className="text-sm text-foreground">Annuler</Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="flex-row flex-wrap gap-x-6 gap-y-4">
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">
                        Prénom
                      </Text>
                      <Text className="mt-0.5 text-sm font-medium text-foreground">
                        {firstName || "—"}
                      </Text>
                    </View>
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">Nom</Text>
                      <Text className="mt-0.5 text-sm font-medium text-foreground">
                        {lastName || "—"}
                      </Text>
                    </View>
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">
                        Naissance
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm font-medium ${!profile?.birthday ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {profile?.birthday
                          ? formatBirthday(profile.birthday)
                          : "Non renseigné"}
                      </Text>
                    </View>
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">
                        E-mail
                      </Text>
                      <Text className="mt-0.5 text-sm font-medium text-foreground">
                        {user?.email ?? "—"}
                      </Text>
                    </View>
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">
                        Téléphone
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm font-medium ${!profile?.phone ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {profile?.phone ?? "Non renseigné"}
                      </Text>
                    </View>
                    <View className="w-[40%]">
                      <Text className="text-xs text-muted-foreground">
                        Profession
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm font-medium ${!profile?.profession ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {profile?.profession ?? "Non renseigné"}
                      </Text>
                    </View>
                  </View>
                  <Button
                    onPress={() => setEditingPersonalInfo(true)}
                    className="mt-5 self-start rounded-full px-5"
                  >
                    <Text className="font-medium text-white">
                      Modifier les informations
                    </Text>
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <Text className="mb-4 text-lg font-semibold text-foreground">
                Adresse
              </Text>
              {editingAddress ? (
                <View className="gap-4">
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Numéro et nom de voie
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={addressForm.street}
                      onChangeText={(v) =>
                        setAddressForm((f) => ({ ...f, street: v }))
                      }
                    />
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="mb-1 text-xs text-muted-foreground">
                        Code postal
                      </Text>
                      <TextInput
                        className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                        value={addressForm.zipCode}
                        onChangeText={(v) =>
                          setAddressForm((f) => ({ ...f, zipCode: v }))
                        }
                        keyboardType="number-pad"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-1 text-xs text-muted-foreground">
                        Ville
                      </Text>
                      <TextInput
                        className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                        value={addressForm.city}
                        onChangeText={(v) =>
                          setAddressForm((f) => ({ ...f, city: v }))
                        }
                      />
                    </View>
                  </View>
                  <View>
                    <Text className="mb-1 text-xs text-muted-foreground">
                      Pays
                    </Text>
                    <TextInput
                      className="rounded-lg border border-border bg-card px-3 py-3 text-sm text-foreground"
                      value={addressForm.country}
                      onChangeText={(v) =>
                        setAddressForm((f) => ({ ...f, country: v }))
                      }
                    />
                  </View>
                  <View className="flex-row gap-2">
                    <Button
                      onPress={handleSaveAddress}
                      loading={updateProfileMutation.isPending}
                      className="rounded-full px-5"
                    >
                      <Text className="font-medium text-white">
                        Enregistrer
                      </Text>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onPress={() => {
                        setEditingAddress(false);
                        setAddressForm({
                          street: profile?.address?.street ?? "",
                          zipCode: profile?.address?.zipCode ?? "",
                          city: profile?.address?.city ?? "",
                          country: profile?.address?.country ?? "",
                        });
                      }}
                    >
                      <Text className="text-sm text-foreground">Annuler</Text>
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="gap-y-4">
                    <View>
                      <Text className="text-xs text-muted-foreground">
                        Numéro et nom de voie
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm font-medium ${!profile?.address?.street ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {profile?.address?.street ?? "Non renseigné"}
                      </Text>
                    </View>
                    <View className="flex-row gap-x-6">
                      <View className="flex-1">
                        <Text className="text-xs text-muted-foreground">
                          Code postal
                        </Text>
                        <Text
                          className={`mt-0.5 text-sm font-medium ${!profile?.address?.zipCode ? "italic text-muted-foreground" : "text-foreground"}`}
                        >
                          {profile?.address?.zipCode ?? "Non renseigné"}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted-foreground">
                          Ville
                        </Text>
                        <Text
                          className={`mt-0.5 text-sm font-medium ${!profile?.address?.city ? "italic text-muted-foreground" : "text-foreground"}`}
                        >
                          {profile?.address?.city ?? "Non renseigné"}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text className="text-xs text-muted-foreground">
                        Pays
                      </Text>
                      <Text
                        className={`mt-0.5 text-sm font-medium ${!profile?.address?.country ? "italic text-muted-foreground" : "text-foreground"}`}
                      >
                        {profile?.address?.country ?? "Non renseigné"}
                      </Text>
                    </View>
                  </View>
                  <Button
                    onPress={() => setEditingAddress(true)}
                    className="mt-5 self-start rounded-full px-5"
                  >
                    <Text className="font-medium text-white">
                      Modifier les informations
                    </Text>
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>

          {/* Code amis */}
          <QrCodeSection />

          {/* Paramètres */}
          <Card className="mb-4">
            <CardContent className="px-6 py-4">
              <Pressable
                onPress={() => router.push("/settings")}
                className="flex-row items-center justify-between"
              >
                <Text className="text-sm font-medium text-foreground">
                  Paramètres
                </Text>
                <ChevronRight size={16} color="#8D7E7E" />
              </Pressable>
            </CardContent>
          </Card>

          {/* Actions compte */}
          <View className="mb-8 gap-2 px-2 pb-4">
            <Pressable
              onPress={handleLogout}
              disabled={loggingOut}
              className="flex-row items-center gap-2.5 py-1.5 active:opacity-70"
            >
              <LogOut size={16} color="#3D2E2E" />
              <Text className="text-sm text-foreground">
                {loggingOut ? "Déconnexion..." : "Se déconnecter"}
              </Text>
            </Pressable>
            <Pressable
              onPress={handleDeleteAccount}
              className="flex-row items-center gap-2.5 py-1.5 active:opacity-70"
            >
              <Trash2 size={16} color="#E53935" />
              <Text className="text-sm text-destructive">
                Supprimer le compte
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal récompenses */}
      <Modal
        visible={showRewardsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-foreground">
                Récompenses
              </Text>
              <Text className="text-sm text-muted-foreground">
                {earnedRewardsCount}/{totalRewardsCount}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowRewardsModal(false)}
              className="h-10 w-10 items-center justify-center rounded-full active:bg-muted"
            >
              <X size={24} color="#3D2E2E" />
            </Pressable>
          </View>
          <ScrollView className="flex-1 px-4 py-4">
            {BADGE_CATEGORIES.map((category) => {
              const categoryRewards = category.keys
                .map((key) => allBadges?.find((r) => r.key === key))
                .filter(Boolean) as RewardCollectionItemDto[];
              if (categoryRewards.length === 0) return null;
              return (
                <View key={category.label} className="mb-5">
                  <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {category.label}
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {categoryRewards.map((reward) => (
                      <BadgeIcon key={reward.id} reward={reward} />
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
