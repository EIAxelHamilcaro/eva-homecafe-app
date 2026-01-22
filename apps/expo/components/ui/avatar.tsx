import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import { Image, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

const avatarVariants = cva(
  "relative overflow-hidden rounded-full bg-muted items-center justify-center",
  {
    variants: {
      size: {
        default: "h-10 w-10",
        sm: "h-8 w-8",
        lg: "h-14 w-14",
        xl: "h-20 w-20",
        "2xl": "h-28 w-28",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const avatarFallbackTextVariants = cva("font-semibold text-muted-foreground", {
  variants: {
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type AvatarProps = ViewProps &
  VariantProps<typeof avatarVariants> & {
    className?: string;
    src?: string | null;
    alt?: string;
    fallback?: string;
    fallbackClassName?: string;
  };

function Avatar({
  className,
  size = "default",
  src,
  alt,
  fallback,
  fallbackClassName,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showFallback = !src || imageError;

  const getInitials = (text?: string): string => {
    if (!text) return "?";
    const words = text
      .trim()
      .split(" ")
      .filter((w) => w.length > 0);
    if (words.length >= 2 && words[0] && words[1]) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <View className={cn(avatarVariants({ size }), className)} {...props}>
      {showFallback ? (
        <AvatarFallback size={size} className={fallbackClassName}>
          {fallback || getInitials(alt)}
        </AvatarFallback>
      ) : (
        <Image
          source={{ uri: src }}
          alt={alt}
          className="h-full w-full"
          onError={() => setImageError(true)}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

type AvatarImageProps = {
  src: string;
  alt?: string;
  className?: string;
  onError?: () => void;
};

function AvatarImage({ src, alt, className, onError }: AvatarImageProps) {
  return (
    <Image
      source={{ uri: src }}
      alt={alt}
      className={cn("h-full w-full", className)}
      onError={onError}
      resizeMode="cover"
    />
  );
}

type AvatarFallbackProps = ViewProps &
  VariantProps<typeof avatarVariants> & {
    className?: string;
    children?: React.ReactNode;
  };

function AvatarFallback({
  className,
  size = "default",
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <View
      className={cn(
        "h-full w-full items-center justify-center bg-muted",
        className,
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={avatarFallbackTextVariants({ size })}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  avatarVariants,
  avatarFallbackTextVariants,
  type AvatarProps,
  type AvatarImageProps,
  type AvatarFallbackProps,
};
