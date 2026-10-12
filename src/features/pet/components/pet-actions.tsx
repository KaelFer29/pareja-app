import { Cookie, HandHeart, Volleyball, type LucideIcon } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { useCareForPet } from '../hooks';
import type { PetAction } from '../types';

const ACTIONS: { action: PetAction; label: string; icon: LucideIcon }[] = [
  { action: 'feed', label: 'Alimentar', icon: Cookie },
  { action: 'pet', label: 'Mimar', icon: HandHeart },
  { action: 'play', label: 'Jugar', icon: Volleyball },
];

export function useCare(petName: string, onCare?: (action: PetAction) => void) {
  const care = useCareForPet();

  function act(action: PetAction) {
    onCare?.(action);
    care.mutate(action, {
      onError: () =>
        Alert.alert(`No se pudo cuidar a ${petName}`, 'Revisa tu conexión e inténtalo de nuevo.'),
    });
  }

  return { act, care };
}

type PetActionsProps = {
  petName: string;
  onCare?: (action: PetAction) => void;
  size?: 'sm' | 'md';
};

export function PetActions({ petName, onCare, size = 'md' }: PetActionsProps) {
  const { act, care } = useCare(petName, onCare);
  const small = size === 'sm';

  return (
    <View style={[styles.row, small && styles.rowSmall]}>
      {ACTIONS.map(({ action, label, icon }) => (
        <Pressable
          key={action}
          accessibilityRole="button"
          accessibilityLabel={label}
          disabled={care.isPending}
          onPress={() => act(action)}
          style={({ pressed }) => [
            styles.action,
            small ? styles.actionSmall : styles.actionLarge,
            (pressed || (care.isPending && care.variables === action)) && styles.pressed,
          ]}
        >
          <View style={[styles.icon, small && styles.iconSmall]}>
            <Icon icon={icon} size={small ? 20 : 24} color={colors.primary} strokeWidth={2.1} />
          </View>
          <Text variant="caption" style={styles.label}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  rowSmall: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  action: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLarge: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionSmall: {
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
  },
});
