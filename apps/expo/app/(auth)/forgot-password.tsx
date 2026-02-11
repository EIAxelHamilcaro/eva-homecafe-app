import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Logo } from "components/ui/logo";
import { Link, router } from "expo-router";
import { useForgotPassword } from "lib/api/hooks/use-auth";
import {
  type ForgotPasswordFormData,
  forgotPasswordSchema,
} from "lib/validations/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(
      { ...data, redirectTo: "evahomecafeapp://reset-password" },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
        onError: () => {
          Alert.alert(
            "Erreur",
            "Impossible d'envoyer l'email. Vérifiez votre connexion.",
          );
        },
      },
    );
  };

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
              Mot de passe oublié ?
            </Text>
            <Text className="mt-2 text-sm text-homecafe-grey-dark">
              {isSubmitted
                ? "Si un compte existe avec cette adresse, vous recevrez un email de réinitialisation."
                : "Entrez votre email pour recevoir un lien de réinitialisation."}
            </Text>
          </View>

          {!isSubmitted ? (
            <>
              {/* Form */}
              <View className="gap-4 px-10 pt-6">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="E-mail"
                      placeholder="votre@email.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  )}
                />
              </View>

              {/* Submit Button */}
              <View className="px-10 pt-6">
                <Button
                  onPress={handleSubmit(onSubmit)}
                  loading={forgotPasswordMutation.isPending}
                  className="rounded-full bg-homecafe-pink"
                >
                  Envoyer le lien
                </Button>
              </View>
            </>
          ) : (
            <View className="px-10 pt-6">
              <Button
                onPress={() => router.replace("/(auth)/login")}
                className="rounded-full bg-homecafe-pink"
              >
                Retour à la connexion
              </Button>
            </View>
          )}

          {/* Back to login */}
          {!isSubmitted && (
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
