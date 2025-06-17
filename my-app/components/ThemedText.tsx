import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ColorScheme } from "@/types";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  className = "",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const getTypeClasses = () => {
    switch (type) {
      case "title":
        return "text-3xl font-bold leading-8";
      case "defaultSemiBold":
        return "text-base font-semibold leading-6";
      case "subtitle":
        return "text-xl font-bold";
      case "link":
        return "text-base leading-7 text-blue-600 dark:text-blue-400";
      default:
        return "text-base leading-6";
    }
  };

  const combinedClassName = `${getTypeClasses()} ${className}`.trim();

  return (
    <Text
      className={combinedClassName}
      style={[
        type !== "link" && { color }, // Only apply custom color if not a link type
        style,
      ]}
      {...rest}
    />
  );
}
