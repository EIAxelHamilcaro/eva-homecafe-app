import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Input, PasswordInput } from "components/ui/input";
import { Logo } from "components/ui/logo";
import { Link, router } from "expo-router";
import { ApiError } from "lib/api/client";
import { useSignUp } from "lib/api/hooks/use-auth";
import { type SignUpFormData, signUpSchema } from "lib/validations/auth";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const signUpMutation = useSignUp();

  const onSubmit = (data: SignUpFormData) => {
    signUpMutation.mutate(data, {
      onSuccess: () => {
        router.replace("/");
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.code === "EMAIL_ALREADY_EXISTS") {
            setError("email", { message: "Cet email est déjà utilisé" });
          } else {
            setError("email", { message: error.message });
          }
        } else {
          setError("email", { message: "Une erreur est survenue" });
        }
      },
    });
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
                  S'identifier
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Hero Image */}
          <View className="mx-6 h-40 items-center justify-center overflow-hidden rounded-3xl bg-homecafe-pink-light">
            <Logo width={180} />
          </View>

          {/* Welcome Header */}
          <View className="px-10 pt-8">
            <Text className="text-2xl font-medium text-homecafe-grey-dark">
              Bienvenue !
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 px-10 pt-6">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nom"
                  placeholder="Votre nom"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

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

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput
                  label="Mot de passe"
                  placeholder="••••••••••••••••••"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  autoComplete="new-password"
                />
              )}
            />
          </View>

          {/* Register Button */}
          <View className="px-10 pt-4">
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={signUpMutation.isPending}
              className="rounded-full bg-homecafe-pink"
            >
              S'inscrire
            </Button>
          </View>

          {/* Legal Mentions */}
          <View className="px-10 pt-3">
            <Text className="text-[10px] text-homecafe-grey-dark">
              Mentions légales
            </Text>
          </View>

          {/* Already a member */}
          <View className="flex-row items-center gap-1 px-10 pt-4">
            <Text className="text-sm text-foreground">Déjà membre ?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-sm font-normal text-homecafe-blue">
                  Connecte-toi
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
