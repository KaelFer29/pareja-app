import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSignedUrl } from '@/shared/hooks/use-signed-url';
import { colors, radius, spacing } from '@/shared/theme';

import { Avatar } from './avatar';
import { IconButton } from './icon-button';
import { Text } from './text';

type AvatarViewerProps = {
  path: string | null | undefined;
  name: string;
  visible: boolean;
  onClose: () => void;
};

export function AvatarViewer({ path, name, visible, onClose }: AvatarViewerProps) {
  const signedUrl = useSignedUrl('avatars', visible ? path : null);
  const { width } = useWindowDimensions();
  const size = Math.min(width - spacing.xl * 2, 420);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar foto">
        <SafeAreaView style={styles.content}>
          <View style={styles.close}>
            <IconButton icon={X} accessibilityLabel="Cerrar" onPress={onClose} />
          </View>
          <View style={styles.center}>
            <View style={[styles.frame, { width: size, height: size }]}>
              {signedUrl.data && (
                <Image
                  source={{ uri: signedUrl.data, cacheKey: path ?? undefined }}
                  style={styles.image}
                  contentFit="cover"
                  transition={150}
                />
              )}
            </View>
            <Text variant="title" tone="inverse" align="center">
              {name}
            </Text>
          </View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

type ViewableAvatarProps = React.ComponentProps<typeof Avatar>;

export function ViewableAvatar(props: ViewableAvatarProps) {
  const [open, setOpen] = useState(false);

  if (!props.path) return <Avatar {...props} />;

  return (
    <>
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={`Ver foto de ${props.name}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <Avatar {...props} />
      </Pressable>
      <AvatarViewer
        path={props.path}
        name={props.name}
        visible={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 16, 0.92)',
  },
  content: {
    flex: 1,
  },
  close: {
    alignItems: 'flex-end',
    padding: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  frame: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
});
