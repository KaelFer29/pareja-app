import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

import { MoodPicker } from './mood-picker';

type MoodSheetProps = {
  userId: string;
  mood: string | null;
  partnerName: string;
  visible: boolean;
  onClose: () => void;
};

export function MoodSheet({ userId, mood, partnerName, visible, onClose }: MoodSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <View style={styles.texts}>
          <Text variant="heading">¿Cómo te sientes?</Text>
          <Text variant="caption" tone="muted">
            {partnerName} lo verá en su inicio.
          </Text>
        </View>
        <MoodPicker userId={userId} mood={mood} onChange={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  texts: {
    gap: spacing.xxs,
  },
});
