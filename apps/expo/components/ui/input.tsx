import { cva, type VariantProps } from "class-variance-authority";
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

const inputVariants = cva(
  "w-full rounded-md border bg-card px-4 py-3 font-normal text-base text-foreground",
  {
    variants: {
      variant: {
        default: "border-homecafe-grey-light focus:border-primary",
        error: "border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InputProps = TextInputProps &
  VariantProps<typeof inputVariants> & {
    label?: string;
    error?: string;
    containerClassName?: string;
    className?: string;
  };

const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, variant, containerClassName, className, ...props }, ref) => {
    return (
      <View className={cn("w-full", containerClassName)}>
        {label && (
          <Text className="mb-1 text-sm font-normal text-homecafe-orange">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            inputVariants({ variant: error ? "error" : variant }),
            className,
          )}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {error && (
          <Text className="mt-1 text-sm text-destructive">{error}</Text>
        )}
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
      variant,
      containerClassName,
      className,
      showPassword,
      onTogglePassword,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(showPassword ?? false);

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
        {label && (
          <Text className="mb-1 text-sm font-normal text-homecafe-orange">
            {label}
          </Text>
        )}
        <View className="relative">
          <TextInput
            ref={ref}
            className={cn(
              inputVariants({ variant: error ? "error" : variant }),
              "pr-12",
              className,
            )}
            secureTextEntry={!visible}
            placeholderTextColor="#9CA3AF"
            {...props}
          />
          <Pressable
            onPress={toggleVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            {visible ? (
              <Eye size={24} color="#0062DD" />
            ) : (
              <EyeOff size={24} color="#0062DD" />
            )}
          </Pressable>
        </View>
        {error && (
          <Text className="mt-1 text-sm text-destructive">{error}</Text>
        )}
      </View>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { Input, PasswordInput, inputVariants, type InputProps };
