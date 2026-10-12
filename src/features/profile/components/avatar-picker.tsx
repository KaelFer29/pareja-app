import { Camera } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/shared/theme';
import { Avatar } from '@/shared/ui/avatar';
import { Icon } from '@/shared/ui/icon';
import { requestImage } from '@/shared/ui/request-image';
import { Text } from '@/shared/ui/text';

import { useUpdateAvatar } from '../hooks';
import type { Profile } from '../types';

const SIZE = 96;

type AvatarPickerProps = {
  profile: Profile;
};

export function AvatarPicker({ profile }: AvatarPickerProps) {
  const updateAvatar = useUpdateAvatar();

  async function changeAvatar() {
    const image = await requestImage({ title: 'Foto de perfil', square: true });
    if (!image) return;

    updateAvatar.mutate(
      { userId: profile.id, image, previousPath: profile.avatar_path },
      {
        onError: () =>
          Alert.alert('No se pudo cambiar tu foto', 'Revisa tu conexión e inténtalo de nuevo.'),
      },
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cambiar foto de perfil"
      onPress={changeAvatar}
      disabled={updateAvatar.isPending}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View>
        <Avatar
          path={profile.avatar_path}
          name={profile.display_name}
          size={SIZE}
          ringColor={colors.primarySoft}
        />
        <View style={styles.badge}>
          {updateAvatar.isPending ? (
            <ActivityIndicator size="small" color={colors.primaryText} />
          ) : (
            <Icon icon={Camera} size={16} color={colors.primaryText} strokeWidth={2.2} />
          )}
        </View>
      </View>
      <Text variant="caption" tone="primary">
        {updateAvatar.isPending ? 'Subiendo foto' : 'Cambiar foto'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});
