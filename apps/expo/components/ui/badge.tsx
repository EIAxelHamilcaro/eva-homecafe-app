import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

const badgeVariants = cva(
  "flex-row items-center justify-center rounded-full px-3 py-1",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-destructive",
        outline: "border border-border bg-transparent",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        info: "bg-blue-500",
      },
      size: {
        default: "px-3 py-1",
        sm: "px-2 py-0.5",
        lg: "px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const badgeTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-white",
      outline: "text-foreground",
      success: "text-white",
      warning: "text-white",
      info: "text-white",
    },
    size: {
      default: "text-xs",
      sm: "text-[10px]",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & {
    children?: React.ReactNode;
    className?: string;
    textClassName?: string;
  };

function Badge({
  className,
  textClassName,
  variant = "default",
  size = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <View
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(badgeTextVariants({ variant, size }), textClassName)}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Badge, badgeVariants, badgeTextVariants, type BadgeProps };
