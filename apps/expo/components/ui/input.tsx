import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { cn } from "@/src/libs/utils";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  className?: string;
};

const Input = React.forwardRef<TextInput, InputProps>(
  (
    { label, error, containerClassName, className, onFocus, onBlur, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View className={cn("w-full", containerClassName)}>
        <View
          className={cn(
            "rounded-md border px-4 pb-3 pt-2",
            error
              ? "border-red-500"
              : isFocused
                ? "border-homecafe-orange"
                : "border-homecafe-grey",
          )}
        >
          {label && (
            <Text className="text-xs font-medium text-homecafe-orange">
              {label}
            </Text>
          )}
          <TextInput
            ref={ref}
            className={cn("p-0 text-sm text-foreground", className)}
            placeholderTextColor="#9CA3AF"
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </View>
        {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
      </View>
    );
  },
);

Input.displayName = "Input";

type PasswordInputProps = Omit<InputProps, "secureTextEntry"> & {
  showPassword?: boolean;
  onTogglePassword?: () => void;
};

const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  (
    {
      label,
      error,
      containerClassName,
      className,
      showPassword,
      onTogglePassword,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(showPassword ?? false);
    const [isFocused, setIsFocused] = React.useState(false);

    const toggleVisibility = () => {
      if (onTogglePassword) {
        onTogglePassword();
      } else {
        setIsVisible(!isVisible);
      }
    };

    const visible = showPassword !== undefined ? showPassword : isVisible;

    return (
      <View className={cn("w-full", containerClassName)}>
        <View
          className={cn(
            "flex-row items-center rounded-md border px-4 pb-3 pt-2",
            error
              ? "border-red-500"
              : isFocused
                ? "border-homecafe-orange"
                : "border-homecafe-grey",
          )}
        >
          <View className="flex-1">
            {label && (
              <Text className="text-xs font-medium text-homecafe-orange">
                {label}
              </Text>
            )}
            <TextInput
              ref={ref}
              className={cn("p-0 text-sm text-foreground", className)}
              secureTextEntry={!visible}
              placeholderTextColor="#9CA3AF"
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              {...props}
            />
          </View>
          <Pressable
            onPress={toggleVisibility}
            className="ml-2 p-1"
            accessibilityLabel={
              visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
          >
            {visible ? (
              <EyeOff size={20} color="#0062DD" />
            ) : (
              <Eye size={20} color="#0062DD" />
            )}
          </Pressable>
        </View>
        {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput, type InputProps };
