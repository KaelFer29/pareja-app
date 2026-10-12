import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

import { useNow, usePet } from '../hooks';
import { getPetStats, MOOD_MESSAGES } from '../stats';
import { PetAvatar } from './pet-avatar';

type PetCardProps = {
  coupleId: string;
};

export function PetCard({ coupleId }: PetCardProps) {
  const pet = usePet(coupleId);
  const now = useNow();

  if (pet.isPending || pet.isError) return null;

  if (!pet.data) {
    return (
      <Card tone="primary" onPress={() => router.push('/pet')} style={styles.card}>
        <PetAvatar mood="happy" size={72} animated={false} />
        <View style={styles.texts}>
          <Text variant="bodyStrong">Adopten una mascota</Text>
          <Text variant="caption" tone="muted">
            La cuidan entre los dos y crece con ustedes.
          </Text>
        </View>
      </Card>
    );
  }

  const stats = getPetStats(pet.data, now);

  return (
    <Card onPress={() => router.push('/pet')} style={styles.card}>
      <PetAvatar mood={stats.mood} size={76} />
      <View style={styles.texts}>
        <View style={styles.title}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.flex}>
            {pet.data.name}
          </Text>
          <Text variant="caption" tone="accent">
            Nivel {stats.level}
          </Text>
        </View>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          {MOOD_MESSAGES[stats.mood](pet.data.name)}
        </Text>
        <View style={styles.bars}>
          <View style={styles.flex}>
            <ProgressBar value={stats.fullness / 100} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <ProgressBar value={stats.happiness / 100} color={colors.primary} />
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  texts: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xxs,
  },
});
