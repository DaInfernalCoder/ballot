import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface ThinkingDotsProps {
  size?: number;
  color?: string;
  spacing?: number;
}

export default function ThinkingDots({
  size = 8,
  color = 'rgba(255, 255, 255, 0.7)',
  spacing = 8,
}: ThinkingDotsProps) {
  const dot1Scale = useSharedValue(1);
  const dot2Scale = useSharedValue(1);
  const dot3Scale = useSharedValue(1);

  useEffect(() => {
    // Staggered bounce animation for each dot
    dot1Scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );

    dot2Scale.value = withDelay(
      150,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      )
    );

    dot3Scale.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }));

  return (
    <View style={[styles.container, { gap: spacing }]}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          dot3Style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {},
});

