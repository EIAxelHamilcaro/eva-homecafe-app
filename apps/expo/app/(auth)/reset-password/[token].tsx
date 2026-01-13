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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [isSuccess, setIsSuccess] = useState(false);

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

    resetPasswordMutation.mutate(
      { token, password: data.password },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            const errorMap: Record<string, string> = {
              INVALID_TOKEN: "Le lien a expiré ou est invalide",
              TOKEN_EXPIRED: "Le lien a expiré",
            };
            const message = errorMap[error.code] ?? error.message;
            setError("password", { message });
          } else {
            setError("password", { message: "Une erreur est survenue" });
          }
        },
      },
    );
  };

  if (!token) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-card px-10">
        <Text className="text-center text-lg text-homecafe-grey-dark">
          Lien invalide ou expiré.
        </Text>
        <Button
          onPress={() => router.replace("/(auth)/forgot-password")}
          className="mt-6 rounded-full bg-homecafe-pink"
        >
          Demander un nouveau lien
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-card">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header with Logo */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <Logo width={100} />
            <Link href="/(auth)/login" asChild>
              <Pressable className="rounded-full bg-homecafe-pink px-4 py-2">
                <Text className="text-sm font-normal text-primary-foreground">
                  Se connecter
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Hero Image */}
          <View className="mx-6 h-40 items-center justify-center overflow-hidden rounded-3xl bg-homecafe-pink-light">
            <Logo width={180} />
          </View>

          {/* Header */}
          <View className="px-10 pt-8">
            <Text className="text-2xl font-medium text-homecafe-grey-dark">
              {isSuccess ? "Mot de passe modifié" : "Nouveau mot de passe"}
            </Text>
            <Text className="mt-2 text-sm text-homecafe-grey-dark">
              {isSuccess
                ? "Votre mot de passe a été réinitialisé avec succès."
                : "Choisissez un nouveau mot de passe sécurisé."}
            </Text>
          </View>

          {!isSuccess ? (
            <>
              {/* Form */}
              <View className="gap-4 px-10 pt-6">
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
              </View>

              {/* Submit Button */}
              <View className="px-10 pt-6">
                <Button
                  onPress={handleSubmit(onSubmit)}
                  loading={resetPasswordMutation.isPending}
                  className="rounded-full bg-homecafe-pink"
                >
                  Réinitialiser
                </Button>
              </View>
            </>
          ) : (
            <View className="px-10 pt-6">
              <Button
                onPress={() => router.replace("/(auth)/login")}
                className="rounded-full bg-homecafe-pink"
              >
                Se connecter
              </Button>
            </View>
          )}

          {/* Back to login */}
          {!isSuccess && (
            <View className="flex-row items-center gap-1 px-10 pt-4">
              <Text className="text-sm text-foreground">Tu te souviens ?</Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-sm font-normal text-homecafe-blue">
                    Connecte-toi
                  </Text>
                </Pressable>
              </Link>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
