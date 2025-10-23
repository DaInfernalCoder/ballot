import React, { ReactNode, useEffect, useRef } from 'react';
import { PixelRatio, Platform, StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type FlippableCardProps = {
  front: ReactNode;
  back: ReactNode;
  flipped: boolean;
  style?: StyleProp<ViewStyle>;
  perspective?: number;
  durationMs?: number;
};

export default function FlippableCard({
  front,
  back,
  flipped,
  style,
  perspective = 1000,
  durationMs = 300,
}: FlippableCardProps) {
  const rotation = useSharedValue(0);
  const frontRef = useRef<View>(null);
  const backRef = useRef<View>(null);

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, {
      duration: durationMs,
      easing: Easing.inOut(Easing.ease),
    });
  }, [flipped, durationMs]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective },
        { rotateY: `${rotation.value}deg` as any },
      ],
      backfaceVisibility: 'hidden',
    } as any;
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective },
        { rotateY: `${rotation.value + 180}deg` as any },
      ],
      backfaceVisibility: 'hidden',
    } as any;
  });

  const cameraDistance = Platform.OS === 'android' ? 8000 * PixelRatio.get() : 8000;

  useEffect(() => {
    // Apply cameraDistance via native props to avoid TS prop errors on Animated.View
    frontRef.current?.setNativeProps({ cameraDistance });
    backRef.current?.setNativeProps({ cameraDistance });
  }, [cameraDistance]);

  return (
    <View style={style}>
      <View style={{ position: 'relative' }}>
        <Animated.View
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
            backAnimatedStyle,
          ]}
          pointerEvents={flipped ? 'auto' : 'none'}
          ref={backRef}
        >
          {back}
        </Animated.View>

        <Animated.View
          style={[
            frontAnimatedStyle,
          ]}
          pointerEvents={flipped ? 'none' : 'auto'}
          ref={frontRef}
        >
          {front}
        </Animated.View>
      </View>
    </View>
  );
}


