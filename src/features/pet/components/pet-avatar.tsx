import { useEffect, useImperativeHandle, useMemo, useState, type Ref } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { dragonSvg } from '../dragon-art';
import type { PetMood, PetStage } from '../types';

const HEART =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21 C11 20 2 14 2 8 C2 5 4.5 3 7 3 C9 3 11 4 12 6 C13 4 15 3 17 3 C19.5 3 22 5 22 8 C22 14 13 20 12 21 Z" fill="#E0668C"/></svg>';

export type PetAvatarHandle = {
  cheer: () => void;
};

type PetAvatarProps = {
  mood: PetMood;
  stage?: PetStage;
  size?: number;
  animated?: boolean;
  ref?: Ref<PetAvatarHandle>;
};

export function PetAvatar({
  mood,
  stage = 'baby',
  size = 180,
  animated = true,
  ref,
}: PetAvatarProps) {
  const [bounce] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const [heart] = useState(() => new Animated.Value(0));
  const xml = useMemo(() => dragonSvg(stage, mood), [stage, mood]);

  useImperativeHandle(ref, () => ({
    cheer() {
      hop.setValue(0);
      heart.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(hop, {
            toValue: 1,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
        ]),
        Animated.timing(heart, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    },
  }));

  useEffect(() => {
    if (!animated) return;
    const duration = mood === 'sleepy' ? 2600 : mood === 'happy' ? 900 : 1600;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, bounce, mood]);

  const lift = mood === 'happy' ? -8 : -4;
  const translateY = Animated.add(
    bounce.interpolate({ inputRange: [0, 1], outputRange: [0, lift] }),
    hop.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.12] }),
  );
  const heartSize = size * 0.18;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
        <SvgXml xml={xml} width={size} height={size} />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.heart,
          {
            width: heartSize,
            height: heartSize,
            left: size * 0.62,
            top: size * 0.12,
            opacity: heart.interpolate({
              inputRange: [0, 0.15, 0.7, 1],
              outputRange: [0, 1, 1, 0],
            }),
            transform: [
              {
                translateY: heart.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -size * 0.25],
                }),
              },
              {
                scale: heart.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.9] }),
              },
            ],
          },
        ]}
      >
        <SvgXml xml={HEART} width={heartSize} height={heartSize} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  heart: {
    position: 'absolute',
  },
});
