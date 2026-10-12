import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useSignedUrl } from '@/shared/hooks/use-signed-url';
import { colors, fonts } from '@/shared/theme';

import { Text } from './text';

type AvatarProps = {
  path: string | null | undefined;
  name: string;
  size?: number;
  ringColor?: string;
};

export function Avatar({ path, name, size = 48, ringColor }: AvatarProps) {
  const signedUrl = useSignedUrl('avatars', path);
  const ringWidth = ringColor ? Math.max(2, Math.round(size / 24)) : 0;
  const inner = size - ringWidth * 4;
  const dimensions = { width: inner, height: inner, borderRadius: inner / 2 };
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  const content =
    path && signedUrl.data ? (
      <Image
        source={{ uri: signedUrl.data, cacheKey: path }}
        style={[styles.image, dimensions]}
        contentFit="cover"
        transition={150}
      />
    ) : (
      <View style={[styles.fallback, dimensions]}>
        <Text style={[styles.initial, { fontSize: inner * 0.4, lineHeight: inner * 0.52 }]}>
          {initial}
        </Text>
      </View>
    );

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
          borderColor: ringColor ?? 'transparent',
        },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  image: {
    backgroundColor: colors.surfaceMuted,
  },
  fallback: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: fonts.extrabold,
    color: colors.accent,
  },
});
