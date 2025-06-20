import type { PropsWithChildren, ReactElement } from "react";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { useBottomTabOverflow } from "@/components/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";

// Defines the height of the parallax header.
const HEADER_HEIGHT = 50;

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow(); // Considers bottom tab bar height for scroll insets.

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView className="flex-1">
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{
          paddingBottom: bottom, // Ensures content is not hidden by a bottom tab bar.
          paddingTop: 15, // Standard top padding for content within the scroll view.
        }}
      >
        {headerImage && (
          <Animated.View
            style={[
              {
                height: HEADER_HEIGHT,
                overflow: "hidden",
                backgroundColor: headerBackgroundColor
                  ? headerBackgroundColor[colorScheme]
                  : "transparent",
              },
              headerAnimatedStyle,
            ]}
          >
            {headerImage}
          </Animated.View>
        )}
        <ThemedView className="flex-1 px-5 pt-[15px] pb-8 gap-4 overflow-hidden">
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}
