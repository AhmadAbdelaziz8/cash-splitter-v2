import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      loading,
      loadingText,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Base classes
    const baseClasses = "items-center justify-center rounded-lg";

    // Variant classes
    const variantClasses = {
      primary: "bg-sky-400 active:bg-sky-500",
      secondary: "border-2 border-sky-400 active:bg-sky-50",
      ghost: "active:bg-gray-100",
      destructive: "bg-red-500 active:bg-red-600",
    };

    // Size classes
    const sizeClasses = {
      sm: "py-2 px-3",
      md: "py-3 px-4",
      lg: "py-4 px-6",
      xl: "py-4 px-8",
    };

    // Text variant classes
    const textVariantClasses = {
      primary: "text-gray-800",
      secondary: "text-sky-500",
      ghost: "text-gray-700",
      destructive: "text-white",
    };

    // Text size classes
    const textSizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    const buttonClassName = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth ? "w-full" : "",
      isDisabled ? "opacity-50" : "",
    ].join(" ");

    const textClassName = [
      "font-bold",
      textVariantClasses[variant],
      textSizeClasses[size],
    ].join(" ");

    return (
      <TouchableOpacity
        ref={ref}
        className={buttonClassName}
        disabled={isDisabled}
        style={style}
        {...props}
      >
        {loading ? (
          <>
            <ActivityIndicator
              size="small"
              color={variant === "primary" ? "#374151" : "#0ea5e9"}
            />
            {loadingText && (
              <Text className={textClassName} style={{ marginLeft: 8 }}>
                {loadingText}
              </Text>
            )}
          </>
        ) : (
          <Text className={textClassName}>{children}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";
