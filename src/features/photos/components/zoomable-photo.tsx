import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '@/shared/theme';

const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

type ZoomablePhotoProps = {
  uri: string | null;
  cacheKey: string;
  width: number;
  height: number;
};

export function ZoomablePhoto({ uri, cacheKey, width, height }: ZoomablePhotoProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  function clamp(value: number, size: number, currentScale: number) {
    'worklet';
    const limit = (size * (currentScale - 1)) / 2;
    return Math.min(limit, Math.max(-limit, value));
  }

  function resetZoom() {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedX.value = 0;
    savedY.value = 0;
  }

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(MAX_SCALE, Math.max(1, savedScale.value * event.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.05) {
        resetZoom();
        return;
      }
      translateX.value = withTiming(clamp(translateX.value, width, scale.value));
      translateY.value = withTiming(clamp(translateY.value, height, scale.value));
      savedX.value = clamp(savedX.value, width, scale.value);
      savedY.value = clamp(savedY.value, height, scale.value);
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((event) => {
      if (scale.value <= 1) return;
      translateX.value = clamp(savedX.value + event.translationX, width, scale.value);
      translateY.value = clamp(savedY.value + event.translationY, height, scale.value);
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
        return;
      }
      scale.value = withTiming(DOUBLE_TAP_SCALE);
      savedScale.value = DOUBLE_TAP_SCALE;
    });

  const gesture = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={[styles.clip, { width, height }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View collapsable={false} style={[{ width, height }, animatedStyle]}>
          <Image
            source={uri ? { uri, cacheKey } : null}
            style={{ width, height }}
            contentFit="contain"
            transition={150}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    backgroundColor: colors.photoBackdrop,
  },
});
