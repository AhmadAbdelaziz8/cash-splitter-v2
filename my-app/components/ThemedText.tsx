import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  // Define Tailwind classes for different text types
  const getTextClasses = () => {
    switch (type) {
      case "title":
        return "text-3xl font-bold leading-8";
      case "defaultSemiBold":
        return "text-base font-semibold leading-6";
      case "subtitle":
        return "text-xl font-bold";
      case "link":
        return "text-base text-blue-600 leading-6";
      default:
        return "text-base leading-6";
    }
  };

  return (
    <Text style={[{ color }, style]} className={getTextClasses()} {...rest} />
  );
}
