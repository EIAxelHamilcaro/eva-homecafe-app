import { Text, type TextProps, View, type ViewProps } from "react-native";

import { cn } from "../../src/libs/utils";

type CardProps = ViewProps & {
  className?: string;
};

function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

type CardHeaderProps = ViewProps & {
  className?: string;
};

function CardHeader({ className, ...props }: CardHeaderProps) {
  return <View className={cn("flex-col gap-1.5 pb-4", className)} {...props} />;
}

type CardTitleProps = TextProps & {
  className?: string;
};

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <Text
      className={cn(
        "text-card-foreground text-lg font-semibold leading-none",
        className,
      )}
      {...props}
    />
  );
}

type CardDescriptionProps = TextProps & {
  className?: string;
};

function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

type CardContentProps = ViewProps & {
  className?: string;
};

function CardContent({ className, ...props }: CardContentProps) {
  return <View className={cn("", className)} {...props} />;
}

type CardFooterProps = ViewProps & {
  className?: string;
};

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <View className={cn("flex-row items-center pt-4", className)} {...props} />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
};
