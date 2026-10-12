import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/features/auth/auth-provider';
import { useCouple } from '@/features/couple/couple-provider';
import { PhotoViewer } from '@/features/photos/components/photo-viewer';
import { usePhoto } from '@/features/photos/hooks';
import { colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

export default function PhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photo = usePhoto(id);
  const { session } = useAuth();
  const { couple } = useCouple();

  if (photo.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (photo.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudo cargar la foto. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      </View>
    );
  }

  if (!photo.data) {
    return (
      <View style={styles.message}>
        <Text tone="muted" align="center">
          Esta foto ya no existe.
        </Text>
      </View>
    );
  }

  const author = couple?.members.find((member) => member.user_id === photo.data?.uploaded_by);

  return (
    <PhotoViewer
      photo={photo.data}
      authorName={author?.profile?.display_name || 'Alguien'}
      canDelete={photo.data.uploaded_by === session?.user.id}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    padding: spacing.lg,
  },
});
