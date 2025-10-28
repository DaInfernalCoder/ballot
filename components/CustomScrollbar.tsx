import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface CustomScrollbarProps {
  scrollY: Animated.SharedValue<number>;
  contentHeight: number;
  scrollViewHeight: number;
  onScrollTo: (y: number) => void;
}

const SCROLLBAR_WIDTH = 4;
const SCROLLBAR_THUMB_MIN_HEIGHT = 50;
const SCROLLBAR_PADDING = 8;

export default function CustomScrollbar({
  scrollY,
  contentHeight,
  scrollViewHeight,
  onScrollTo,
}: CustomScrollbarProps) {
  const isDragging = useSharedValue(false);
  const dragStartY = useSharedValue(0);
  const dragStartScrollY = useSharedValue(0);

  // Calculate dimensions
  const isScrollable = contentHeight > scrollViewHeight;
  const scrollableHeight = Math.max(0, contentHeight - scrollViewHeight);
  const trackHeight = scrollViewHeight - SCROLLBAR_PADDING * 2;

  // Calculate thumb height based on viewport to content ratio
  const thumbHeightRatio = isScrollable ? scrollViewHeight / contentHeight : 1;
  const thumbHeight = Math.max(
    SCROLLBAR_THUMB_MIN_HEIGHT,
    thumbHeightRatio * trackHeight
  );

  // Maximum scroll position for the thumb
  const maxThumbY = Math.max(0, trackHeight - thumbHeight);

  // Pan gesture for dragging the thumb
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      dragStartY.value = scrollY.value;
      dragStartScrollY.value = scrollY.value;
    })
    .onUpdate((event) => {
      // Calculate new scroll position based on thumb drag
      const deltaY = event.translationY;
      const scrollRatio = scrollableHeight / maxThumbY;
      const newScrollY = Math.max(
        0,
        Math.min(scrollableHeight, dragStartScrollY.value + deltaY * scrollRatio)
      );

      // Update scroll position
      runOnJS(onScrollTo)(newScrollY);
    })
    .onEnd(() => {
      isDragging.value = false;
    });

  // Animated style for the thumb
  const thumbStyle = useAnimatedStyle(() => {
    // Calculate thumb position based on scroll position
    const thumbY = interpolate(
      scrollY.value,
      [0, scrollableHeight],
      [0, maxThumbY],
      'clamp'
    );

    // Scale up slightly when dragging
    const scale = withSpring(isDragging.value ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });

    // Increase opacity when dragging
    const opacity = withSpring(isDragging.value ? 0.8 : 0.6, {
      damping: 15,
      stiffness: 150,
    });

    return {
      transform: [
        { translateY: thumbY },
        { scaleX: scale },
      ],
      opacity,
    };
  });

  // Don't show scrollbar if content doesn't overflow
  if (!isScrollable) return null;

  return (
    <View style={styles.scrollbarContainer} pointerEvents="box-none">
      <View
        style={[
          styles.scrollbarTrack,
          {
            height: scrollViewHeight,
            paddingVertical: SCROLLBAR_PADDING,
          },
        ]}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.scrollbarThumb,
              {
                width: SCROLLBAR_WIDTH,
                height: thumbHeight,
              },
              thumbStyle,
            ]}
          />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollbarContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollbarTrack: {
    width: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  scrollbarThumb: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
