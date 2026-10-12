import { useEffect, useImperativeHandle, useState, type Ref } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { PET_ART, PET_SCALE } from '@/shared/lib/pet-art';
import { colors, fonts } from '@/shared/theme';

import type { PetMood, PetStage } from '../types';

const HEART =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21 C11 20 2 14 2 8 C2 5 4.5 3 7 3 C9 3 11 4 12 6 C13 4 15 3 17 3 C19.5 3 22 5 22 8 C22 14 13 20 12 21 Z" fill="#E0668C"/></svg>';

const HEARTS = [
  { x: 0.62, y: 0.14, drift: 0.06, delay: 0, scale: 1 },
  { x: 0.22, y: 0.22, drift: -0.05, delay: 120, scale: 0.75 },
  { x: 0.48, y: 0.04, drift: 0.02, delay: 240, scale: 0.6 },
];

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

function loop(value: Animated.Value, duration: number, delay = 0) {
  return Animated.loop(
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
}

export function PetAvatar({
  mood,
  stage = 'baby',
  size = 180,
  animated = true,
  ref,
}: PetAvatarProps) {
  const [breath] = useState(() => new Animated.Value(0));
  const [sway] = useState(() => new Animated.Value(0));
  const [bounce] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const [squash] = useState(() => new Animated.Value(0));
  const [hearts] = useState(() => HEARTS.map(() => new Animated.Value(0)));
  const [snore] = useState(() => new Animated.Value(0));

  useImperativeHandle(ref, () => ({
    cheer() {
      hop.setValue(0);
      squash.setValue(0);
      hearts.forEach((value) => value.setValue(0));
      Animated.parallel([
        Animated.sequence([
          Animated.timing(squash, {
            toValue: 1,
            duration: 110,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.spring(squash, {
              toValue: 0,
              friction: 3,
              tension: 160,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(hop, {
                toValue: 1,
                duration: 180,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.spring(hop, { toValue: 0, friction: 4, useNativeDriver: true }),
            ]),
          ]),
        ]),
        ...hearts.map((value, index) =>
          Animated.sequence([
            Animated.delay(HEARTS[index].delay),
            Animated.timing(value, {
              toValue: 1,
              duration: 1000,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    },
  }));

  useEffect(() => {
    if (!animated) return;
    const sleepy = mood === 'sleepy';
    const loops = [
      loop(breath, sleepy ? 1800 : mood === 'happy' ? 700 : 1100),
      loop(sway, sleepy ? 3200 : 2200),
    ];
    if (mood === 'happy') loops.push(loop(bounce, 260, 1400));
    if (sleepy) {
      loops.push(
        Animated.loop(
          Animated.timing(snore, {
            toValue: 1,
            duration: 2400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
      );
    }
    loops.forEach((item) => item.start());
    return () => loops.forEach((item) => item.stop());
  }, [animated, bounce, breath, mood, snore, sway]);

  const art = size * PET_SCALE[stage];
  const sleepy = mood === 'sleepy';
  const sad = mood === 'lonely' || mood === 'hungry';

  const translateY = Animated.add(
    bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.06] }),
    hop.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.14] }),
  );
  const scaleX = Animated.add(
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, sleepy ? 1.03 : 1.018] }),
    squash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }),
  );
  const scaleY = Animated.add(
    breath.interpolate({ inputRange: [0, 1], outputRange: [1, sleepy ? 0.985 : 1.03] }),
    squash.interpolate({ inputRange: [0, 1], outputRange: [0, -0.14] }),
  );
  const tilt = sleepy ? 1 : sad ? 1.5 : 2.5;
  const rotate = sway.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${tilt}deg`, `${tilt}deg`],
  });
  const shadowScale = hop.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] });
  const heartSize = size * 0.16;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          styles.shadow,
          {
            width: art * 0.62,
            height: art * 0.08,
            left: (size - art * 0.62) / 2,
            bottom: size * 0.01,
            borderRadius: art,
            transform: [{ scaleX: shadowScale }],
          },
        ]}
      />
      <Animated.View
        style={{
          position: 'absolute',
          width: art,
          height: art,
          left: (size - art) / 2,
          bottom: 0,
          transformOrigin: 'bottom',
          transform: [{ translateY }, { rotate }, { scaleX }, { scaleY }],
        }}
      >
        <Image
          source={PET_ART[stage][mood]}
          style={{ width: art, height: art }}
          resizeMode="contain"
          fadeDuration={0}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {sleepy ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill]}>
          {[0, 1].map((index) => {
            const phase = Animated.modulo(Animated.add(snore, index * 0.5), 1);
            return (
              <Animated.Text
                key={index}
                style={[
                  styles.snore,
                  {
                    left: size * 0.66,
                    top: size * 0.22,
                    fontSize: size * 0.1,
                    opacity: phase.interpolate({
                      inputRange: [0, 0.2, 0.8, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: phase.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -size * 0.2],
                        }),
                      },
                      {
                        translateX: phase.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, size * 0.08],
                        }),
                      },
                      { scale: phase.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) },
                    ],
                  },
                ]}
              >
                z
              </Animated.Text>
            );
          })}
        </View>
      ) : null}

      {hearts.map((value, index) => {
        const config = HEARTS[index];
        const heart = heartSize * config.scale;
        return (
          <Animated.View
            key={index}
            pointerEvents="none"
            style={[
              styles.heart,
              {
                width: heart,
                height: heart,
                left: size * config.x,
                top: size * config.y,
                opacity: value.interpolate({
                  inputRange: [0, 0.15, 0.7, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -size * 0.25],
                    }),
                  },
                  {
                    translateX: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, size * config.drift],
                    }),
                  },
                  {
                    scale: value.interpolate({
                      inputRange: [0, 0.3, 1],
                      outputRange: [0.4, 1.1, 0.9],
                    }),
                  },
                ],
              },
            ]}
          >
            <SvgXml xml={HEART} width={heart} height={heart} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(58, 42, 35, 0.12)',
  },
  heart: {
    position: 'absolute',
  },
  snore: {
    position: 'absolute',
    fontFamily: fonts.extrabold,
    color: colors.textMuted,
  },
});
