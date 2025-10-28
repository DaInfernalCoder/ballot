import { DiscoveredEvent } from '@/types/event';
import React, { useEffect } from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import { HomeEventCard } from './home-event-card/HomeEventCard';

interface AnimatedEventCardProps {
  event: DiscoveredEvent;
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onUnflip: () => void;
  onDismiss: (id: string) => void;
  entranceDelay?: number;
}

export default function AnimatedEventCard({
  event,
  index,
  flipped,
  onFlip,
  onUnflip,
  onDismiss,
  entranceDelay = 0,
}: AnimatedEventCardProps) {
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animation
    translateY.value = withDelay(
      entranceDelay,
      withSpring(0, {
        damping: 20,
        stiffness: 150,
      })
    );
    scale.value = withDelay(
      entranceDelay,
      withSpring(1, {
        damping: 20,
        stiffness: 150,
      })
    );
    opacity.value = withDelay(
      entranceDelay,
      withSpring(1, {
        damping: 20,
        stiffness: 150,
      })
    );
  }, [entranceDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <HomeEventCard
        id={event.id}
        title={event.title}
        location={event.location}
        date={event.date}
        time={event.time}
        image={event.image}
        imageKey={event.imageKey}
        imageUrl={event.imageUrl}
        aiOverview={event.aiOverview}
        link={event.link}
        sourceUrls={event.sourceUrls}
        tags={event.tags}
        venue={event.venue}
        address={event.address}
        organizer={event.organizer}
        websiteLink={event.websiteLink}
        impactStatement={event.impactStatement}
        qaPairs={event.qaPairs}
        flipped={flipped}
        onFlip={onFlip}
        onUnflip={onUnflip}
        onDismiss={onDismiss}
      />
    </Animated.View>
  );
}

