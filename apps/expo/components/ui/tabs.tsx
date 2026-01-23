import * as React from "react";
import {
  Pressable,
  type PressableProps,
  ScrollView,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { cn } from "@/src/libs/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

type TabsProps = ViewProps & {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

function Tabs({
  value,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View className={cn("flex-1", className)} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

type TabsListProps = ViewProps & {
  className?: string;
  scrollable?: boolean;
};

function TabsList({
  className,
  scrollable = false,
  children,
  ...props
}: TabsListProps) {
  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-2 px-1"
        className={cn("mb-4", className)}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 rounded-xl bg-muted p-1 mb-4",
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}

type TabsTriggerProps = Omit<PressableProps, "children"> & {
  value: string;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
};

function TabsTrigger({
  value,
  className,
  activeClassName,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <Pressable
      className={cn(
        "rounded-lg px-4 py-2",
        isActive
          ? cn("bg-background shadow-sm", activeClassName)
          : "bg-transparent",
        className,
      )}
      onPress={() => onValueChange(value)}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-sm font-medium text-center",
            isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

type TabsTriggerTextProps = TextProps & {
  className?: string;
  active?: boolean;
};

function TabsTriggerText({
  className,
  active,
  ...props
}: TabsTriggerTextProps) {
  return (
    <Text
      className={cn(
        "text-sm font-medium text-center",
        active ? "text-foreground" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type TabsContentProps = ViewProps & {
  value: string;
  className?: string;
};

function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return (
    <View className={cn("flex-1", className)} {...props}>
      {children}
    </View>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsTriggerTextProps,
  type TabsContentProps,
};
