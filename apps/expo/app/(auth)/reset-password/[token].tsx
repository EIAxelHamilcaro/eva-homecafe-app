import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { PasswordInput } from "components/ui/input";
import { Logo } from "components/ui/logo";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ApiError } from "lib/api/client";
import { useResetPassword } from "lib/api/hooks/use-auth";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "lib/validations/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirm: "" },
  });

  const resetPasswordMutation = useResetPassword();

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) {
      setError("password", { message: "Token manquant" });
      return;
    }

    setServerError(null);
    resetPasswordMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (
              error.code === "INVALID_TOKEN" ||
              error.code === "TOKEN_EXPIRED"
            ) {
              setServerError(
                "Ce lien a expiré ou est invalide. Demandez un nouveau lien.",
              );
              return;
            }
            setError("password", { message: error.message });
          } else {
            setError("password", { message: "Une erreur est survenue" });
          }
        },
      },
    );
  };

  if (!token) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-lg text-homecafe-grey-dark">
          Lien invalide ou expiré.
        </Text>
        <Button
          onPress={() => router.replace("/(auth)/forgot-password")}
          className="mt-6 rounded-full px-8"
        >
          Demander un nouveau lien
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8">
            {/* Header */}
            <View className="flex-row items-center justify-between py-4">
              <Logo width={100} />
              <Link href="/(auth)/login" asChild>
                <Pressable className="rounded-full bg-primary px-6 py-2.5 active:opacity-90">
                  <Text className="text-sm font-medium text-primary-foreground">
                    Se connecter
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Hero Image */}
            <View className="overflow-hidden rounded-[30px]">
              <Image
                source={require("@/assets/new-password-image.png")}
                className="h-48 w-full"
                resizeMode="cover"
              />
            </View>

            {/* Title */}
            <View className="pb-8 pt-8">
              <Text className="text-2xl font-medium text-homecafe-grey-dark">
                {isSuccess ? "Mot de passe modifié" : "Nouveau mot de passe"}
              </Text>
            </View>

            {/* Content */}
            <View className="gap-4">
              {isSuccess ? (
                <>
                  <Text className="text-sm text-homecafe-grey-dark">
                    Votre mot de passe a été réinitialisé avec succès.
                  </Text>
                  <Button
                    onPress={() => router.replace("/(auth)/login")}
                    className="self-start rounded-full px-8"
                  >
                    Se connecter
                  </Button>
                </>
              ) : (
                <>
                  <Text className="text-sm text-homecafe-grey-dark">
                    Choisissez un nouveau mot de passe sécurisé.
                  </Text>

                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <PasswordInput
                        label="Nouveau mot de passe"
                        placeholder="Minimum 8 caractères"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.password?.message}
                        autoCapitalize="none"
                        autoComplete="new-password"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="passwordConfirm"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <PasswordInput
                        label="Confirmer le mot de passe"
                        placeholder="Retapez votre mot de passe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.passwordConfirm?.message}
                        autoCapitalize="none"
                        autoComplete="new-password"
                      />
                    )}
                  />

                  {serverError && (
                    <View className="gap-3">
                      <View className="rounded-lg bg-red-50 p-3">
                        <Text className="text-sm text-red-600">
                          {serverError}
                        </Text>
                      </View>
                      <Link href="/(auth)/forgot-password" asChild>
                        <Pressable>
                          <Text className="text-sm font-medium text-homecafe-blue">
                            Demander un nouveau lien
                          </Text>
                        </Pressable>
                      </Link>
                    </View>
                  )}

                  <Button
                    onPress={handleSubmit(onSubmit)}
                    loading={resetPasswordMutation.isPending}
                    className="self-start rounded-full px-8"
                  >
                    Réinitialiser
                  </Button>

                  <View className="pt-2">
                    <Link href="/(auth)/login" asChild>
                      <Pressable>
                        <Text className="text-sm font-medium text-homecafe-blue">
                          Retour à la connexion
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
