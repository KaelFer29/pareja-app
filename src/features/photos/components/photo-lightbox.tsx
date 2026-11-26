import { X } from 'lucide-react-native';
import { Modal, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/shared/theme';
import { IconButton } from '@/shared/ui/icon-button';

import { ZoomablePhoto } from './zoomable-photo';

type PhotoLightboxProps = {
  uri: string | null;
  cacheKey: string;
  visible: boolean;
  onClose: () => void;
};

export function PhotoLightbox({ uri, cacheKey, visible, onClose }: PhotoLightboxProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <ZoomablePhoto uri={uri} cacheKey={cacheKey} width={width} height={height} />
        <View style={[styles.close, { top: insets.top + spacing.sm }]}>
          <IconButton icon={X} accessibilityLabel="Cerrar foto" onPress={onClose} />
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.photoBackdrop,
  },
  close: {
    position: 'absolute',
    right: spacing.md,
  },
});
