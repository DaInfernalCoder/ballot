import { DiscoveredEvent } from '@/types/event';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import CardDeckGestureHandler from './CardDeckGestureHandler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_SCALE = 0.9; // Background cards scaled to 90%
const CARD_OFFSET = 12; // Vertical offset between stacked cards
const CARDS_TO_RENDER = 3; // Render current + 2 behind

interface CardDeckViewProps {
  data: DiscoveredEvent[];
  renderCard: (event: DiscoveredEvent, index: number) => React.ReactNode;
  onSwipeUp: (event: DiscoveredEvent) => void;
  onSwipeDown: (event: DiscoveredEvent) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  containerHeight: number;
}

interface CardStackItem {
  event: DiscoveredEvent;
  position: number; // 0 = front, 1 = behind, 2 = further behind
  globalIndex: number;
}

export default function CardDeckView({
  data,
  renderCard,
  onSwipeUp,
  onSwipeDown,
  currentIndex,
  onIndexChange,
  containerHeight,
}: CardDeckViewProps) {
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  // Calculate which cards to show (current + 2 behind)
  const getVisibleCards = (): CardStackItem[] => {
    if (data.length === 0) return [];

    const cards: CardStackItem[] = [];
    for (let i = 0; i < Math.min(CARDS_TO_RENDER, data.length); i++) {
      const index = (currentIndex + i) % data.length;
      cards.push({
        event: data[index],
        position: i,
        globalIndex: index,
      });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  const handleSwipeLeft = () => {
    // Navigate to next card
    const nextIndex = (currentIndex + 1) % data.length;
    onIndexChange(nextIndex);
  };

  const handleSwipeRight = () => {
    // Navigate to previous card
    const prevIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
    onIndexChange(prevIndex);
  };

  const handleSwipeUp = (event: DiscoveredEvent) => {
    setRemovingIndex(currentIndex);
    setTimeout(() => {
      onSwipeUp(event);
      setRemovingIndex(null);
      // Move to next card after removal
      const nextIndex = currentIndex % (data.length - 1);
      onIndexChange(nextIndex);
    }, 300);
  };

  const handleSwipeDown = (event: DiscoveredEvent) => {
    setRemovingIndex(currentIndex);
    setTimeout(() => {
      onSwipeDown(event);
      setRemovingIndex(null);
      // Move to next card after removal
      const nextIndex = currentIndex % (data.length - 1);
      onIndexChange(nextIndex);
    }, 300);
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View style={styles.cardStack}>
        {visibleCards.map((item, stackIndex) => (
          <CardStackLayer
            key={`${item.globalIndex}-${item.event.id}`}
            item={item}
            stackIndex={stackIndex}
            renderCard={renderCard}
            onSwipeLeft={stackIndex === 0 ? handleSwipeLeft : undefined}
            onSwipeRight={stackIndex === 0 ? handleSwipeRight : undefined}
            onSwipeUp={stackIndex === 0 ? () => handleSwipeUp(item.event) : undefined}
            onSwipeDown={stackIndex === 0 ? () => handleSwipeDown(item.event) : undefined}
            disabled={stackIndex !== 0 || removingIndex !== null}
          />
        ))}
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentIndex && styles.progressDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

interface CardStackLayerProps {
  item: CardStackItem;
  stackIndex: number;
  renderCard: (event: DiscoveredEvent, index: number) => React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  disabled: boolean;
}

function CardStackLayer({
  item,
  stackIndex,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  disabled,
}: CardStackLayerProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Animate to position based on stack index
    const targetScale = Math.pow(CARD_SCALE, stackIndex);
    const targetY = stackIndex * CARD_OFFSET;
    const targetOpacity = stackIndex === 0 ? 1 : 0.7;

    scale.value = withSpring(targetScale, {
      damping: 20,
      stiffness: 150,
    });
    translateY.value = withSpring(targetY, {
      damping: 20,
      stiffness: 150,
    });
    opacity.value = withSpring(targetOpacity, {
      damping: 20,
      stiffness: 150,
    });
  }, [stackIndex]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
    zIndex: CARDS_TO_RENDER - stackIndex,
  }));

  const cardContent = renderCard(item.event, item.globalIndex);

  return (
    <Animated.View style={[styles.cardLayer, animatedStyle]}>
      {stackIndex === 0 ? (
        <CardDeckGestureHandler
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
          onSwipeUp={onSwipeUp}
          onSwipeDown={onSwipeDown}
          disabled={disabled}
        >
          {cardContent}
        </CardDeckGestureHandler>
      ) : (
        cardContent
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStack: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardLayer: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

