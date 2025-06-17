import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-slate-200 border border-slate-300";
      case "ghost":
        return "bg-transparent";
      case "destructive":
        return "bg-red-600";
      default:
        return "bg-blue-600";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "lg":
        return "px-6 py-4 text-lg";
      case "xl":
        return "px-8 py-5 text-xl";
      default:
        return "px-4 py-3 text-base";
    }
  };

  const getTextColorClasses = () => {
    switch (variant) {
      case "secondary":
        return "text-slate-700";
      case "ghost":
        return "text-blue-600";
      case "destructive":
        return "text-white";
      default:
        return "text-white";
    }
  };

  const baseClasses = "rounded-lg items-center justify-center flex-row";
  const widthClasses = fullWidth ? "w-full" : "";
  const disabledClasses = disabled || loading ? "opacity-50" : "";

  const combinedClassName = [
    baseClasses,
    getVariantClasses(),
    getSizeClasses(),
    widthClasses,
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TouchableOpacity
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" || variant === "ghost" ? "#3b82f6" : "white"
          }
          className="mr-2"
        />
      )}
      <Text className={`font-medium ${getTextColorClasses()}`}>
        {loading && loadingText ? loadingText : children}
      </Text>
    </TouchableOpacity>
  );
}
