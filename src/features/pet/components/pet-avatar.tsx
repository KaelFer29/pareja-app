import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { colors } from '@/shared/theme';

import type { PetMood } from '../types';

const BODY = '#F4D3C4';
const BODY_SHADE = '#E9BBA6';
const BELLY = '#FFF4EE';
const INK = colors.text;

type PetAvatarProps = {
  mood: PetMood;
  size?: number;
  animated?: boolean;
};

function Eyes({ mood }: { mood: PetMood }) {
  if (mood === 'happy') {
    return (
      <G stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <Path d="M66 106 Q76 94 86 106" />
        <Path d="M114 106 Q124 94 134 106" />
      </G>
    );
  }

  if (mood === 'sleepy') {
    return (
      <G stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <Path d="M66 104 Q76 112 86 104" />
        <Path d="M114 104 Q124 112 134 104" />
      </G>
    );
  }

  const sad = mood === 'hungry' || mood === 'lonely';

  return (
    <G>
      <Ellipse cx={76} cy={104} rx={8} ry={sad ? 9 : 10} fill={INK} />
      <Ellipse cx={124} cy={104} rx={8} ry={sad ? 9 : 10} fill={INK} />
      <Circle cx={79} cy={100} r={3} fill={colors.surface} />
      <Circle cx={127} cy={100} r={3} fill={colors.surface} />
      {sad && (
        <G stroke={INK} strokeWidth={4} strokeLinecap="round">
          <Path d="M64 88 L84 92" />
          <Path d="M136 88 L116 92" />
        </G>
      )}
    </G>
  );
}

function Mouth({ mood }: { mood: PetMood }) {
  if (mood === 'hungry') {
    return (
      <G>
        <Ellipse cx={100} cy={130} rx={7} ry={8} fill={INK} />
        <Ellipse cx={100} cy={134} rx={4} ry={3} fill={colors.primary} />
      </G>
    );
  }

  if (mood === 'lonely') {
    return (
      <Path
        d="M90 132 Q100 124 110 132"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  if (mood === 'sleepy') {
    return <Ellipse cx={100} cy={128} rx={4} ry={3} fill={INK} />;
  }

  return (
    <Path
      d="M88 124 Q94 132 100 124 Q106 132 112 124"
      stroke={INK}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
}

export function PetAvatar({ mood, size = 180, animated = true }: PetAvatarProps) {
  const [bounce] = useState(() => new Animated.Value(0));

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
  const translateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, lift] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Ellipse cx={100} cy={186} rx={52} ry={7} fill={colors.shadow} opacity={0.12} />
        <Path
          d="M150 150 Q190 150 182 112 Q178 96 166 102"
          stroke={BODY_SHADE}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M46 84 L54 34 Q58 26 66 32 L96 62 Z" fill={BODY} />
        <Path d="M154 84 L146 34 Q142 26 134 32 L104 62 Z" fill={BODY} />
        <Path d="M56 70 L60 44 L80 62 Z" fill={colors.primary} opacity={0.45} />
        <Path d="M144 70 L140 44 L120 62 Z" fill={colors.primary} opacity={0.45} />
        <Ellipse cx={100} cy={118} rx={74} ry={64} fill={BODY} />
        <Ellipse cx={100} cy={150} rx={42} ry={28} fill={BELLY} />
        <Ellipse cx={58} cy={176} rx={16} ry={9} fill={BODY_SHADE} />
        <Ellipse cx={142} cy={176} rx={16} ry={9} fill={BODY_SHADE} />
        <Circle cx={60} cy={122} r={11} fill={colors.primary} opacity={0.3} />
        <Circle cx={140} cy={122} r={11} fill={colors.primary} opacity={0.3} />
        <Eyes mood={mood} />
        <Path d="M96 116 L104 116 L100 121 Z" fill={colors.primary} />
        <Mouth mood={mood} />
        {mood === 'happy' && (
          <Path
            d="M160 46 C158 44 146 37 146 28 C146 23 150 20 154 20 C157 20 159 22 160 24 C161 22 163 20 166 20 C170 20 174 23 174 28 C174 37 162 44 160 46 Z"
            fill={colors.primary}
          />
        )}
        {mood === 'sleepy' && (
          <G fill={colors.accent} opacity={0.7}>
            <Path d="M150 40 h14 l-14 14 h14" stroke={colors.accent} strokeWidth={3} fill="none" />
            <Path d="M170 22 h9 l-9 9 h9" stroke={colors.accent} strokeWidth={2.5} fill="none" />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
}
