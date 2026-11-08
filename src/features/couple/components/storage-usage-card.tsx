import { HardDrive } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { SectionHeader } from '@/shared/ui/section-header';
import { Text } from '@/shared/ui/text';

import {
  STORAGE_LIMIT_BYTES,
  STORAGE_WARN_RATIO,
  formatStorageBytes,
  getStorageUsage,
} from '../storage-api';

export function StorageUsageCard() {
  const usage = useQuery({
    queryKey: ['storage', 'usage'],
    queryFn: getStorageUsage,
  });

  const used = usage.data ?? 0;
  const ratio = used / STORAGE_LIMIT_BYTES;
  const warn = ratio >= STORAGE_WARN_RATIO;

  return (
    <View style={styles.section}>
      <SectionHeader title="Almacenamiento" />
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Icon icon={HardDrive} size={19} color={colors.accent} />
          </View>
          <View style={styles.texts}>
            <Text variant="bodyStrong">Fotos y avatares</Text>
            <Text variant="caption" tone="muted">
              {usage.isPending
                ? 'Calculando uso'
                : usage.isError
                  ? 'No se pudo calcular el uso'
                  : `${formatStorageBytes(used)} de ${formatStorageBytes(STORAGE_LIMIT_BYTES)}`}
            </Text>
          </View>
        </View>
        {!usage.isError && (
          <ProgressBar value={ratio} color={warn ? colors.danger : colors.primary} height={8} />
        )}
        {warn && !usage.isError && (
          <Notice message="Se están acercando al límite gratis de 1 GB. Borren fotos que ya no necesiten." />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md - spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
