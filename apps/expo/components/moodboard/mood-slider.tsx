import { Pressable, Text, View, type ViewProps } from "react-native";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/src/libs/utils";

type MoodSliderProps = ViewProps & {
  value?: number;
  onValueChange?: (value: number) => void;
  onValidate?: () => void;
  title?: string;
  subtitle?: string;
  showCard?: boolean;
  showValidateButton?: boolean;
  validateLabel?: string;
  className?: string;
  sliderClassName?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

function MoodSlider({
  value = 50,
  onValueChange,
  onValidate,
  title = "Moodboard",
  subtitle = "Quelle est ton humeur du jour ?",
  showCard = true,
  showValidateButton = true,
  validateLabel = "Valider",
  className,
  sliderClassName,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  ...props
}: MoodSliderProps) {
  const content = (
    <>
      <View className="mb-4">
        <Text className="text-foreground text-lg font-semibold">{title}</Text>
        {subtitle && (
          <Text className="text-muted-foreground text-sm">{subtitle}</Text>
        )}
      </View>

      <View className="mb-4">
        <Slider
          value={value}
          min={min}
          max={max}
          step={step}
          onValueChange={onValueChange}
          disabled={disabled}
          className={sliderClassName}
          trackClassName="bg-homecafe-grey-light h-3"
          activeTrackClassName="bg-primary"
          thumbClassName="border-primary bg-white h-7 w-7"
        />
      </View>

      {showValidateButton && (
        <View>
          <Pressable
            onPress={onValidate}
            disabled={disabled}
            className={cn(
              "bg-primary self-start rounded-full px-6 py-2 active:opacity-70",
              disabled && "opacity-50",
            )}
            accessibilityRole="button"
            accessibilityLabel={validateLabel}
          >
            <Text className="text-sm font-medium text-white">
              {validateLabel}
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );

  if (!showCard) {
    return (
      <View className={cn("", className)} {...props}>
        {content}
      </View>
    );
  }

  return (
    <View
      className={cn(
        "bg-card rounded-xl border border-border p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {content}
    </View>
  );
}

export { MoodSlider, type MoodSliderProps };
