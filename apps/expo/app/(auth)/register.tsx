import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "components/ui/button";
import { Input, PasswordInput } from "components/ui/input";
import { Logo } from "components/ui/logo";
import { Link, router, useLocalSearchParams } from "expo-router";
import { ApiError } from "lib/api/client";
import { useSignUp } from "lib/api/hooks/use-auth";
import { type SignUpFormData, signUpSchema } from "lib/validations/auth";
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
import { useAcceptInvite } from "@/lib/api/hooks/use-invite";

export default function RegisterScreen() {
  const { invite } = useLocalSearchParams<{ invite?: string }>();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", passwordConfirm: "" },
  });

  const signUpMutation = useSignUp();
  const acceptInviteMutation = useAcceptInvite();

  const onSubmit = (data: SignUpFormData) => {
    signUpMutation.mutate(
      { name: data.name, email: data.email, password: data.password },
      {
        onSuccess: () => {
          if (invite) {
            acceptInviteMutation.mutate(
              { token: invite },
              {
                onError: () => {
                  Alert.alert(
                    "Invitation",
                    "L'invitation a expire, demandez un nouveau code a votre ami",
                  );
                },
              },
            );
          }
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
                    S'identifier
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Hero Image */}
            <View className="overflow-hidden rounded-[30px]">
              <Image
                source={require("@/assets/signup-image.png")}
                className="h-48 w-full"
                resizeMode="cover"
              />
            </View>

            {/* Title */}
            <View className="pb-8 pt-8">
              <Text className="text-2xl font-medium text-homecafe-grey-dark">
                Bienvenue !
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
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
                    autoComplete="name"
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
                    placeholder="Minimum 8 caractères"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
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
                    autoComplete="new-password"
                  />
                )}
              />

              {signUpMutation.isError &&
                !(signUpMutation.error instanceof ApiError) && (
                  <View className="rounded-lg bg-red-50 p-3">
                    <Text className="text-sm text-red-600">
                      Impossible de créer le compte. Vérifiez votre connexion.
                    </Text>
                  </View>
                )}

              <Button
                onPress={handleSubmit(onSubmit)}
                loading={signUpMutation.isPending}
                className="rounded-full bg-homecafe-pink px-8 self-start"
              >
                S'inscrire
              </Button>

              <Text className="text-[10px] text-homecafe-grey-dark">
                Mentions légales
              </Text>

              <View className="flex-row items-center gap-1 pt-2">
                <Text className="text-sm text-foreground">Déjà membre ?</Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text className="text-sm font-medium text-homecafe-blue">
                      Connecte-toi
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
