import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTION_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% width to commit

interface SwipeActionCardProps {
  children: React.ReactNode;
  onSwipeRight?: () => void; // Add to events
  onSwipeLeft?: () => void;  // Delete/dismiss
  enabled?: boolean;         // Enable/disable swipe gesture
}

export function SwipeActionCard({ children, onSwipeRight, onSwipeLeft, enabled = true }: SwipeActionCardProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isCommitting = useSharedValue(false);

  const progress = useDerivedValue(() => Math.min(1, Math.abs(translateX.value) / ACTION_THRESHOLD));

  const cardStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [8, 0, -8]);
    const scale = interpolate(progress.value, [0, 1], [1, 0.98]);
    const shadowOpacity = interpolate(progress.value, [0, 1], [0.1, 0.35]);
    const shadowRadius = interpolate(progress.value, [0, 1], [6, 16]);
    const elevation = interpolate(progress.value, [0, 1], [2, 8]);
    return {
      transform: [{ translateX: translateX.value }, { rotateZ: `${rotateZ}deg` as any }, { scale }],
      shadowColor: '#000',
      shadowOpacity: shadowOpacity as any,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: shadowRadius as any,
      elevation: elevation as any,
    };
  });

  const addLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, ACTION_THRESHOLD], [0, 1]),
    transform: [
      { scale: interpolate(translateX.value, [0, ACTION_THRESHOLD], [0.95, 1]) },
    ],
  }));

  const deleteLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-ACTION_THRESHOLD, 0], [1, 0]),
    transform: [
      { scale: interpolate(translateX.value, [-ACTION_THRESHOLD, 0], [1, 0.95]) },
    ],
  }));

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([-16, 16])
    .failOffsetY([-20, 20])
    .enableTrackpadTwoFingerGesture(false)
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      if (isCommitting.value) return;
      translateX.value = startX.value + e.translationX;
    })
    .onEnd(() => {
      if (isCommitting.value) return;
      const shouldCommitRight = translateX.value > ACTION_THRESHOLD;
      const shouldCommitLeft = translateX.value < -ACTION_THRESHOLD;

      if (shouldCommitRight && onSwipeRight) {
        isCommitting.value = true;
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 220 }, () => {
          runOnJS(onSwipeRight)();
          translateX.value = 0;
          isCommitting.value = false;
        });
        return;
      }
      if (shouldCommitLeft && onSwipeLeft) {
        isCommitting.value = true;
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 220 }, () => {
          runOnJS(onSwipeLeft)();
          translateX.value = 0;
          isCommitting.value = false;
        });
        return;
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 200, mass: 0.9 });
    });

  return (
    <View style={styles.container}>
      {/* Indicators */}
      <Animated.View style={[styles.addBadge, addLabelStyle]} pointerEvents="none">
        <Text style={styles.addText}>Add</Text>
      </Animated.View>
      <Animated.View style={[styles.deleteBadge, deleteLabelStyle]} pointerEvents="none">
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[styles.card, cardStyle]}
          needsOffscreenAlphaCompositing={false}
          shouldRasterizeIOS={true}
          renderToHardwareTextureAndroid={true}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  card: {
    backgroundColor: 'transparent',
  },
  addBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(52,199,89,0.15)',
    borderColor: '#34C759',
    borderWidth: 1,
    borderRadius: 999,
    zIndex: 3,
  },
  addText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBadge: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 999,
    zIndex: 3,
  },
  deleteText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SwipeActionCard;


