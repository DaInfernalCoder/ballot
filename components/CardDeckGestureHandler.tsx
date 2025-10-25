import React, { ReactNode } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HORIZONTAL_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% to commit navigation
const VERTICAL_THRESHOLD = 100; // 100px to commit save/dismiss
const DIRECTION_LOCK_DISTANCE = 50; // Lock direction after 50px movement

interface CardDeckGestureHandlerProps {
  children: ReactNode;
  onSwipeLeft?: () => void; // Navigate to next card
  onSwipeRight?: () => void; // Navigate to previous card
  onSwipeUp?: () => void; // Save event
  onSwipeDown?: () => void; // Dismiss event
  disabled?: boolean;
}

export default function CardDeckGestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  disabled = false,
}: CardDeckGestureHandlerProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const gestureDirection = useSharedValue<'none' | 'horizontal' | 'vertical'>('none');

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart(() => {
      gestureDirection.value = 'none';
    })
    .onUpdate((event) => {
      // Detect dominant direction if not yet locked
      if (gestureDirection.value === 'none') {
        const absX = Math.abs(event.translationX);
        const absY = Math.abs(event.translationY);
        const totalDistance = Math.sqrt(absX * absX + absY * absY);

        if (totalDistance > DIRECTION_LOCK_DISTANCE) {
          // Lock to dominant direction
          gestureDirection.value = absX > absY ? 'horizontal' : 'vertical';
        }
      }

      // Apply translation based on locked direction
      if (gestureDirection.value === 'horizontal') {
        translateX.value = event.translationX;
        translateY.value = 0;
      } else if (gestureDirection.value === 'vertical') {
        translateX.value = 0;
        translateY.value = event.translationY;
        
        // Apply opacity and scale fade for vertical swipes
        const progress = Math.min(Math.abs(event.translationY) / 200, 1);
        opacity.value = 1 - progress * 0.5;
        scale.value = 1 - progress * 0.1;
      }
    })
    .onEnd((event) => {
      const direction = gestureDirection.value;

      if (direction === 'horizontal') {
        // Horizontal swipe - navigation
        const shouldNavigate = Math.abs(translateX.value) > HORIZONTAL_THRESHOLD;
        
        if (shouldNavigate) {
          // Commit navigation
          const targetX = translateX.value > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
          translateX.value = withTiming(targetX, { duration: 200 }, () => {
            if (translateX.value > 0 && onSwipeRight) {
              runOnJS(onSwipeRight)();
            } else if (translateX.value < 0 && onSwipeLeft) {
              runOnJS(onSwipeLeft)();
            }
            // Reset after callback
            translateX.value = 0;
          });
        } else {
          // Snap back
          translateX.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
        }
      } else if (direction === 'vertical') {
        // Vertical swipe - save or dismiss
        const shouldCommit = Math.abs(translateY.value) > VERTICAL_THRESHOLD;
        
        if (shouldCommit) {
          // Commit action
          const targetY = translateY.value < 0 ? -SCREEN_HEIGHT : SCREEN_HEIGHT;
          translateY.value = withTiming(targetY, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
          scale.value = withTiming(0.8, { duration: 300 }, () => {
            if (translateY.value < 0 && onSwipeUp) {
              runOnJS(onSwipeUp)();
            } else if (translateY.value > 0 && onSwipeDown) {
              runOnJS(onSwipeDown)();
            }
            // Reset after callback
            translateY.value = 0;
            opacity.value = 1;
            scale.value = 1;
          });
        } else {
          // Snap back
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 200,
          });
          opacity.value = withSpring(1, {
            damping: 20,
            stiffness: 200,
          });
          scale.value = withSpring(1, {
            damping: 20,
            stiffness: 200,
          });
        }
      }

      // Reset direction lock
      gestureDirection.value = 'none';
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

