import { Pressable, type PressableProps, View } from "react-native";
import { cn } from "@/src/libs/utils";

interface FABProps extends PressableProps {
  children: React.ReactNode;
  className?: string;
}

export function FAB({ children, className, ...props }: FABProps) {
  return (
    <Pressable
      className={cn(
        "absolute bottom-6 right-4 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:bg-primary/80",
        className,
      )}
      {...props}
    >
      <View>{children}</View>
    </Pressable>
  );
}
