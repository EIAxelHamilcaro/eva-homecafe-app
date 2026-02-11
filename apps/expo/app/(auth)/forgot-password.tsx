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
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
                <Pressable className="rounded-full bg-homecafe-pink px-6 py-2.5">
                  <Text className="text-sm font-medium text-white">
                    Se connecter
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Hero Image */}
            <View className="overflow-hidden rounded-[30px]">
              <Image
                source={require("@/assets/reset-image.png")}
                className="h-48 w-full"
                resizeMode="cover"
              />
            </View>

            {/* Title */}
            <View className="pb-8 pt-8">
              <Text className="text-2xl font-medium text-homecafe-grey-dark">
                Mot de passe oublié ?
              </Text>
            </View>

            {/* Content */}
            <View className="gap-4">
              {isSubmitted ? (
                <>
                  <Text className="text-sm text-homecafe-grey-dark">
                    Si un compte existe avec cette adresse, vous recevrez un
                    email de réinitialisation.
                  </Text>
                  <Button
                    onPress={() => router.replace("/(auth)/login")}
                    className="self-start rounded-full bg-homecafe-pink px-8"
                  >
                    Retour à la connexion
                  </Button>
                </>
              ) : (
                <>
                  <Text className="text-sm text-homecafe-grey-dark">
                    Entrez votre email pour recevoir un lien de
                    réinitialisation.
                  </Text>

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

                  <Button
                    onPress={handleSubmit(onSubmit)}
                    loading={forgotPasswordMutation.isPending}
                    className="self-start rounded-full bg-homecafe-pink px-8"
                  >
                    Envoyer le lien
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
