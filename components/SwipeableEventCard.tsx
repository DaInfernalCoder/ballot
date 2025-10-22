import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// iOS-style delete button width
const DELETE_BUTTON_WIDTH = 90;
const SWIPE_THRESHOLD_FULL = SCREEN_WIDTH * 0.6; // 60% swipe triggers auto-delete
const SNAP_BACK_THRESHOLD = 45;

interface SwipeableEventCardProps {
  children: React.ReactNode;
  onDelete: () => void;
  onDeletePress: () => void; // For partial swipe + button press
}

const DeleteIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SwipeableEventCard({
  children,
  onDelete,
  onDeletePress,
}: SwipeableEventCardProps) {
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const itemHeight = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDeleting = useSharedValue(false);

  const handleDelete = () => {
    'worklet';
    isDeleting.value = true;
    // Animate out
    opacity.value = withTiming(0, { duration: 200 });
    itemHeight.value = withTiming(0, { duration: 250 }, () => {
      runOnJS(onDelete)();
    });
  };

  const gesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      // Store the current position when gesture starts for smooth continuation
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      // Don't allow interaction during deletion animation
      if (isDeleting.value) return;
      
      // Smoothly update position based on starting context + gesture translation
      // This allows continuous swiping in both directions
      const newTranslation = contextX.value + event.translationX;
      
      translateX.value = Math.max(
        Math.min(newTranslation, 0), // Cap at 0 (can't swipe right past original position)
        -DELETE_BUTTON_WIDTH - 20 // Cap at delete button width
      );
    })
    .onEnd((event) => {
      // Don't process gesture end if we're deleting
      if (isDeleting.value) return;
      
      const shouldDelete = translateX.value < -SWIPE_THRESHOLD_FULL;
      
      if (shouldDelete) {
        // Full swipe - auto delete
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        handleDelete();
      } else if (translateX.value < -SNAP_BACK_THRESHOLD) {
        // Partial swipe - snap to reveal delete button
        translateX.value = withSpring(-DELETE_BUTTON_WIDTH, {
          damping: 20,
          stiffness: 200,
        });
      } else {
        // Snap back to original position
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value === 1 ? undefined : itemHeight.value,
    opacity: itemHeight.value === 0 ? 0 : 1,
  }));

  const handleDeleteButtonPress = () => {
    // Close the swipe and show confirmation
    translateX.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
    });
    onDeletePress();
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      {/* Delete Button Background */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteButtonPress}
          activeOpacity={0.8}
        >
          <DeleteIcon />
        </TouchableOpacity>
      </View>

      {/* Swipeable Card */}
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DELETE_BUTTON_WIDTH,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    backgroundColor: '#000000',
  },
});

