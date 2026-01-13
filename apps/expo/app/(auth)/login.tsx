import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Input, PasswordInput } from "components/ui/input";
import { Logo } from "components/ui/logo";
import { Link, router } from "expo-router";
import { ApiError } from "lib/api/client";
import { useSignIn } from "lib/api/hooks/use-auth";
import { type SignInFormData, signInSchema } from "lib/validations/auth";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useSignIn();

  const onSubmit = (data: SignInFormData) => {
    signInMutation.mutate(data, {
      onSuccess: () => {
        router.replace("/");
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          if (error.code === "INVALID_CREDENTIALS") {
            setError("email", { message: "Email ou mot de passe incorrect" });
          } else if (error.code === "USER_NOT_FOUND") {
            setError("email", {
              message: "Aucun compte trouvé avec cet email",
            });
          } else {
            setError("email", { message: error.message });
          }
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
            <Link href="/(auth)/register" asChild>
              <Pressable className="rounded-full bg-homecafe-pink px-4 py-2">
                <Text className="text-sm font-normal text-primary-foreground">
                  S'inscrire
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
              Bon retour !
            </Text>
          </View>

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
                  autoComplete="current-password"
                />
              )}
            />
          </View>

          {/* Forgot Password */}
          <View className="px-10 pt-2">
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable>
                <Text className="text-sm text-homecafe-blue">
                  Mot de passe oublié ?
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Login Button */}
          <View className="px-10 pt-4">
            <Button
              onPress={handleSubmit(onSubmit)}
              loading={signInMutation.isPending}
              className="rounded-full bg-homecafe-pink"
            >
              Se connecter
            </Button>
          </View>

          {/* Not a member yet */}
          <View className="flex-row items-center gap-1 px-10 pt-4">
            <Text className="text-sm text-foreground">Pas encore membre ?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-sm font-normal text-homecafe-blue">
                  Inscris-toi
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
