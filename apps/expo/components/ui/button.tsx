import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
} from "react-native";

import { cn } from "@/src/libs/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-xl",
  {
    variants: {
      variant: {
        default: "bg-primary active:bg-primary/80",
        destructive: "bg-destructive active:bg-destructive/80",
        outline: "border border-border bg-background active:bg-muted",
        secondary: "bg-secondary active:bg-secondary/80",
        ghost: "active:bg-muted",
        link: "",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-4",
        lg: "h-14 px-8",
        icon: "h-12 w-12",
        "icon-sm": "h-10 w-10",
        "icon-lg": "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("font-semibold text-base", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      secondary: "text-secondary-foreground",
      ghost: "text-foreground",
      link: "text-primary underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
      "icon-sm": "text-sm",
      "icon-lg": "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    className?: string;
    textClassName?: string;
    loading?: boolean;
  };

function Button({
  className,
  textClassName,
  variant = "default",
  size = "default",
  disabled,
  loading,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        isDisabled && "opacity-50",
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "default" || variant === "destructive" ? "#fff" : "#000"
          }
        />
      ) : typeof children === "string" ? (
        <Text
          className={cn(buttonTextVariants({ variant, size }), textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Button, buttonVariants, buttonTextVariants, type ButtonProps };
