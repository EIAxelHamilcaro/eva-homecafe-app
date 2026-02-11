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
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
              <Link href="/(auth)/register" asChild>
                <Pressable className="rounded-full bg-homecafe-pink px-6 py-2.5">
                  <Text className="text-sm font-medium text-white">
                    S'inscrire
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Hero Image */}
            <View className="overflow-hidden rounded-[30px]">
              <Image
                source={require("@/assets/login-image.png")}
                className="h-48 w-full"
                resizeMode="cover"
              />
            </View>

            {/* Title */}
            <View className="pb-8 pt-8">
              <Text className="text-2xl font-medium text-homecafe-grey-dark">
                C'est chouette de te revoir !
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
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
                    placeholder="Minimum 8 caractères"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    autoComplete="current-password"
                  />
                )}
              />

              {signInMutation.isError &&
                !(signInMutation.error instanceof ApiError) && (
                  <View className="rounded-lg bg-red-50 p-3">
                    <Text className="text-sm text-red-600">
                      Impossible de se connecter. Vérifiez votre connexion.
                    </Text>
                  </View>
                )}

              {/* Button + Forgot password */}
              <View className="flex-row items-center gap-4">
                <Button
                  onPress={handleSubmit(onSubmit)}
                  loading={signInMutation.isPending}
                  className="rounded-full bg-homecafe-pink px-8"
                >
                  Se connecter
                </Button>
                <Link href="/(auth)/forgot-password" asChild>
                  <Pressable>
                    <Text className="text-sm font-medium text-homecafe-blue">
                      Mot de passe oublié ?
                    </Text>
                  </Pressable>
                </Link>
              </View>

              <Text className="text-[10px] text-homecafe-grey-dark">
                Mentions légales
              </Text>

              <View className="flex-row items-center gap-1 pt-2">
                <Text className="text-sm text-foreground">
                  Pas encore membre ?
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Pressable>
                    <Text className="text-sm font-medium text-homecafe-blue">
                      Inscris-toi
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
