import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';

import { useNow, usePet } from '../hooks';
import { getPetStats, MOOD_MESSAGES } from '../stats';
import type { Pet } from '../types';
import { PetActions, useCare } from './pet-actions';
import { PetAvatar, type PetAvatarHandle } from './pet-avatar';
import { OutingProposal } from './outing-proposal';
import { LevelBadge, StreakBadge, StreakHint } from './streak-badge';

type PetHomeProps = {
  coupleId: string;
};

export function PetHome({ coupleId }: PetHomeProps) {
  const pet = usePet(coupleId);

  if (pet.isPending || pet.isError) return null;
  if (!pet.data) return <AdoptInvite />;
  return <PetCorner pet={pet.data} />;
}

function AdoptInvite() {
  return (
    <View style={styles.container}>
      <PetAvatar mood="happy" stage="baby" size={150} />
      <View style={styles.texts}>
        <Text variant="heading" align="center">
          Un perrito los espera
        </Text>
        <Text variant="caption" tone="muted" align="center">
          Adóptenlo y cuídenlo entre los dos para que crezca.
        </Text>
      </View>
      <Button title="Adoptar" size="sm" onPress={() => router.push('/pet')} />
    </View>
  );
}

function PetCorner({ pet }: { pet: Pet }) {
  const now = useNow();
  const stats = getPetStats(pet, now);
  const avatar = useRef<PetAvatarHandle>(null);
  const cheer = () => avatar.current?.cheer();
  const { act } = useCare(pet.name, cheer);

  return (
    <View style={styles.container}>
      <View style={styles.badges}>
        <StreakBadge streak={stats.streak} caredToday={stats.caredToday} />
        <LevelBadge level={stats.level} />
      </View>

      <OutingProposal coupleId={pet.couple_id} petName={pet.name} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Hacerle mimos a ${pet.name}`}
        onPress={() => act('pet')}
      >
        <PetAvatar ref={avatar} mood={stats.mood} stage={stats.stage} size={170} />
      </Pressable>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Ver a ${pet.name}`}
        onPress={() => router.push('/pet')}
        style={styles.texts}
        hitSlop={6}
      >
        <View style={styles.nameRow}>
          <Text variant="heading">{pet.name}</Text>
          <Icon icon={ChevronRight} size={18} color={colors.textMuted} />
        </View>
        <Text variant="caption" tone="muted" align="center">
          {MOOD_MESSAGES[stats.mood](pet.name)}
        </Text>
      </Pressable>

      <StreakHint streak={stats.streak} caredToday={stats.caredToday} />

      <View style={styles.bars}>
        <MiniBar label="Pancita" value={stats.fullness} color={colors.accent} />
        <MiniBar label="Ánimo" value={stats.happiness} color={colors.primary} />
      </View>

      <PetActions petName={pet.name} onCare={cheer} size="sm" />
    </View>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.bar}>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <ProgressBar value={value / 100} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  texts: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  bars: {
    flexDirection: 'row',
    gap: spacing.md,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xl,
  },
  bar: {
    flex: 1,
    gap: spacing.xxs,
  },
});
