import * as React from "react";
import { Pressable, Text, View, type ViewProps } from "react-native";

import { cn } from "@/src/libs/utils";

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error(
      "RadioGroup components must be used within a RadioGroup provider",
    );
  }
  return context;
}

type RadioGroupProps = ViewProps & {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
};

function RadioGroup({
  value,
  onValueChange,
  disabled = false,
  className,
  orientation = "vertical",
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <View
        className={cn(
          orientation === "horizontal"
            ? "flex-row items-center gap-4"
            : "gap-3",
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

type RadioGroupItemProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
};

function RadioGroupItem({
  value,
  label,
  disabled: itemDisabled = false,
  className,
  labelClassName,
}: RadioGroupItemProps) {
  const {
    value: selectedValue,
    onValueChange,
    disabled: groupDisabled,
  } = useRadioGroupContext();
  const isSelected = selectedValue === value;
  const isDisabled = itemDisabled || groupDisabled;

  const handlePress = () => {
    if (!isDisabled) {
      onValueChange(value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={cn("flex-row items-center gap-3", className)}
    >
      <View
        className={cn(
          "h-5 w-5 items-center justify-center rounded-full border-2",
          isSelected ? "border-primary" : "border-homecafe-grey-light",
          isDisabled && "opacity-50",
        )}
      >
        {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </View>
      {label && (
        <Text
          className={cn(
            "text-base text-foreground",
            isDisabled && "opacity-50",
            labelClassName,
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
};
