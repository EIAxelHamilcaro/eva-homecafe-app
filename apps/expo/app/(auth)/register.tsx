import { Button } from "components/ui/button";
import { Input, PasswordInput } from "components/ui/input";
import { Link, router } from "expo-router";
import { ApiError } from "lib/api/client";
import { useSignUp } from "lib/api/hooks/use-auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});

  const signUpMutation = useSignUp();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email invalide";
    }

    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validate()) {
      signUpMutation.mutate(
        { email, password, name },
        {
          onSuccess: () => {
            router.replace("/");
          },
          onError: (error) => {
            if (error instanceof ApiError) {
              if (error.code === "EMAIL_ALREADY_EXISTS") {
                setErrors({ email: "Cet email est déjà utilisé" });
              } else {
                setErrors({ email: error.message });
              }
            } else {
              setErrors({ email: "Une erreur est survenue" });
            }
          },
        },
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <View className="h-16 w-28 items-center justify-center">
              <Text className="text-xl font-bold text-homecafe-pink">
                homecafé
              </Text>
            </View>
            <Link href="/(auth)/login" asChild>
              <Pressable className="rounded-full bg-homecafe-pink px-4 py-2">
                <Text className="text-sm font-normal text-primary-foreground">
                  S'identifier
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Hero Image Placeholder */}
          <View className="mx-6 h-60 items-center justify-center overflow-hidden rounded-3xl bg-homecafe-pink-light">
            <Text className="text-4xl">☕</Text>
            <Text className="mt-2 text-lg text-homecafe-grey-dark">
              HomeCafé
            </Text>
          </View>

          {/* Welcome Header */}
          <View className="px-10 pt-8">
            <Text className="text-2xl font-medium text-homecafe-grey-dark">
              Bienvenue !
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4 px-10 pt-6">
            <Input
              label="Nom"
              placeholder="Votre nom"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="E-mail"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <PasswordInput
              label="Mot de passe"
              placeholder="••••••••••••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              autoComplete="new-password"
            />
          </View>

          {/* Register Button */}
          <View className="px-10 pt-4">
            <Button
              onPress={handleRegister}
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

          {/* Footer */}
          <View className="mt-12 items-center gap-6 bg-card px-10 py-10">
            <View className="h-16 w-56 items-center justify-center">
              <Text className="text-2xl font-bold text-homecafe-pink">
                homecafé
              </Text>
            </View>

            {/* Footer Links */}
            <View className="flex-row gap-8">
              <Text className="text-xl font-medium text-homecafe-orange">
                Inscription
              </Text>
              <Pressable>
                <Text className="text-xl font-medium text-homecafe-blue">
                  Contact
                </Text>
              </Pressable>
            </View>

            {/* Social Media */}
            <View className="flex-row gap-4">
              <Pressable className="size-10 items-center justify-center rounded-full bg-homecafe-pink">
                <Text className="text-primary-foreground">f</Text>
              </Pressable>
              <Pressable className="size-10 items-center justify-center rounded-full bg-homecafe-pink">
                <Text className="text-primary-foreground">in</Text>
              </Pressable>
              <Pressable className="size-10 items-center justify-center rounded-full bg-homecafe-pink">
                <Text className="text-primary-foreground">X</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View className="h-px w-full bg-homecafe-grey-light" />

            {/* Copyright */}
            <Text className="text-center text-sm text-homecafe-grey-muted">
              <Text className="text-homecafe-blue">
                Copyright © 2023 BRIX Templates | All Rights Reserved |{" "}
              </Text>
              <Text className="text-foreground">Terms and Conditions </Text>
              <Text className="text-homecafe-blue">| </Text>
              <Text className="text-foreground">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
