import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useSignedUrl } from '@/shared/hooks/use-signed-url';
import { colors } from '@/shared/theme';

import { Text } from './text';

type AvatarProps = {
  path: string | null | undefined;
  name: string;
  size?: number;
};

export function Avatar({ path, name, size = 48 }: AvatarProps) {
  const signedUrl = useSignedUrl('avatars', path);
  const dimensions = { width: size, height: size, borderRadius: size / 2 };
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (path && signedUrl.data) {
    return (
      <Image
        source={{ uri: signedUrl.data, cacheKey: path }}
        style={[styles.image, dimensions]}
        contentFit="cover"
        transition={150}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimensions]}>
      <Text tone="primary" style={{ fontSize: size * 0.4, fontWeight: '700' }}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.border,
  },
  fallback: {
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
