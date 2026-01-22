import { View, type ViewProps } from "react-native";
import {
  type DateData,
  LocaleConfig,
  Calendar as RNCalendar,
} from "react-native-calendars";

import { cn } from "@/src/libs/utils";

LocaleConfig.locales.fr = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  today: "Aujourd'hui",
};

LocaleConfig.defaultLocale = "fr";

type DotColor = "pink" | "orange" | "yellow" | "green" | "blue" | "purple";

type MarkedDate = {
  dots?: { key: string; color: string }[];
  selected?: boolean;
  selectedColor?: string;
  marked?: boolean;
};

type CalendarProps = ViewProps & {
  selectedDate?: string;
  markedDates?: Record<string, MarkedDate>;
  onDayPress?: (date: DateData) => void;
  onMonthChange?: (date: DateData) => void;
  minDate?: string;
  maxDate?: string;
  hideArrows?: boolean;
  disabled?: boolean;
};

const DOT_COLORS: Record<DotColor, string> = {
  pink: "#F5A5B8",
  orange: "#FB923C",
  yellow: "#FACC15",
  green: "#4ADE80",
  blue: "#60A5FA",
  purple: "#A78BFA",
};

const THEME = {
  backgroundColor: "transparent",
  calendarBackground: "transparent",
  textSectionTitleColor: "#9CA3AF",
  selectedDayBackgroundColor: "#F5A5B8",
  selectedDayTextColor: "#FFFFFF",
  todayTextColor: "#F5A5B8",
  dayTextColor: "#3D2E2E",
  textDisabledColor: "#D1D5DB",
  dotColor: "#F5A5B8",
  selectedDotColor: "#FFFFFF",
  arrowColor: "#3D2E2E",
  monthTextColor: "#3D2E2E",
  textDayFontFamily: "System",
  textMonthFontFamily: "System",
  textDayHeaderFontFamily: "System",
  textDayFontWeight: "400" as const,
  textMonthFontWeight: "600" as const,
  textDayHeaderFontWeight: "500" as const,
  textDayFontSize: 14,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 12,
};

function Calendar({
  selectedDate,
  markedDates = {},
  onDayPress,
  onMonthChange,
  minDate,
  maxDate,
  hideArrows = false,
  disabled = false,
  className,
  ...props
}: CalendarProps) {
  const computedMarkedDates = { ...markedDates };

  if (selectedDate) {
    computedMarkedDates[selectedDate] = {
      ...computedMarkedDates[selectedDate],
      selected: true,
      selectedColor: "#F5A5B8",
    };
  }

  return (
    <View className={cn("rounded-xl bg-white p-2", className)} {...props}>
      <RNCalendar
        current={selectedDate}
        markedDates={computedMarkedDates}
        markingType="multi-dot"
        onDayPress={disabled ? undefined : onDayPress}
        onMonthChange={onMonthChange}
        minDate={minDate}
        maxDate={maxDate}
        hideArrows={hideArrows}
        disableMonthChange={hideArrows}
        theme={THEME}
        enableSwipeMonths={!disabled}
        firstDay={1}
      />
    </View>
  );
}

function createDot(
  color: DotColor,
  key?: string,
): { key: string; color: string } {
  return {
    key: key || color,
    color: DOT_COLORS[color],
  };
}

export {
  Calendar,
  createDot,
  DOT_COLORS,
  type CalendarProps,
  type DotColor,
  type MarkedDate,
};
