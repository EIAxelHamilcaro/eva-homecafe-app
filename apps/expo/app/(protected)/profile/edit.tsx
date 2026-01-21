import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { useRouter } from "expo-router";
import { ApiError } from "lib/api/client";
import { useProfile, useUpdateProfile } from "lib/api/hooks/use-profile";
import {
  type UpdateProfileFormData,
  updateProfileSchema,
} from "lib/validations/profile";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      avatarUrl: null,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        bio: profile.bio ?? "",
        avatarUrl: profile.avatarUrl,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfileMutation.mutate(
      {
        displayName: data.displayName,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            setError("displayName", { message: error.message });
          }
        },
      },
    );
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F691C3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-2"
          >
            <ArrowLeft size={24} color="#3D2E2E" />
            <Text className="text-lg font-semibold text-foreground">
              Modifier le profil
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center px-4 py-6">
            <Pressable className="relative mb-6">
              <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-homecafe-pink-light">
                {profile?.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={56} color="#F691C3" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full bg-homecafe-pink">
                <Camera size={18} color="#FFFFFF" />
              </View>
            </Pressable>

            <Text className="mb-1 text-center text-sm text-muted-foreground">
              Appuyez sur l'avatar pour changer de photo
            </Text>
          </View>

          <View className="px-4">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Informations du profil
                </CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <Controller
                  control={control}
                  name="displayName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Nom d'affichage"
                      placeholder="Votre nom d'affichage"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.displayName?.message}
                      autoCapitalize="words"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View className="w-full">
                      <Text className="mb-1 text-sm font-normal text-homecafe-orange">
                        Bio
                      </Text>
                      <TextInput
                        className="w-full rounded-md border border-homecafe-grey-light bg-card px-4 py-3 text-base text-foreground focus:border-primary"
                        placeholder="Parlez-nous de vous..."
                        placeholderTextColor="#9CA3AF"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        style={{ minHeight: 100 }}
                      />
                      {errors.bio?.message && (
                        <Text className="mt-1 text-sm text-destructive">
                          {errors.bio.message}
                        </Text>
                      )}
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {value?.length ?? 0}/500 caractères
                      </Text>
                    </View>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              onPress={handleSubmit(onSubmit)}
              loading={updateProfileMutation.isPending}
              disabled={!isDirty}
              className="mb-4 rounded-full bg-homecafe-pink"
            >
              Enregistrer les modifications
            </Button>

            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={updateProfileMutation.isPending}
              className="mb-8"
            >
              Annuler
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
