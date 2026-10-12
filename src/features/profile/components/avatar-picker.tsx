import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Avatar } from '@/shared/ui/avatar';
import { requestImage } from '@/shared/ui/request-image';
import { Text } from '@/shared/ui/text';

import { useUpdateAvatar } from '../hooks';
import type { Profile } from '../types';

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
    <Pressable onPress={changeAvatar} disabled={updateAvatar.isPending} style={styles.container}>
      <Avatar path={profile.avatar_path} name={profile.display_name} size={72} />
      <View>
        <Text tone="primary">{updateAvatar.isPending ? 'Subiendo...' : 'Cambiar foto'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
