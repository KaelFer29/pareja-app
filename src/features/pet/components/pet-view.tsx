import { Check, Flame, Pencil, Sparkles, Trophy } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { formatRelative } from '@/shared/utils/date';

import { useNow, useRenamePet } from '../hooks';
import { describeLastCare, getPetStats, isPetAction, MOOD_MESSAGES, stageLabel } from '../stats';
import type { Pet } from '../types';
import { PetActions, useCare } from './pet-actions';
import { PetAvatar, type PetAvatarHandle } from './pet-avatar';
import { LevelBadge, StreakBadge } from './streak-badge';

type PetViewProps = {
  pet: Pet;
  userId: string;
  names: Record<string, string>;
};

export function PetView({ pet, userId, names }: PetViewProps) {
  const now = useNow();
  const stats = getPetStats(pet, now);
  const rename = useRenamePet();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet.name);
  const avatar = useRef<PetAvatarHandle>(null);
  const cheer = () => avatar.current?.cheer();
  const { act } = useCare(pet.name, cheer);

  function saveName() {
    if (name.trim() === '' || name.trim() === pet.name) {
      setEditing(false);
      setName(pet.name);
      return;
    }
    rename.mutate(
      { coupleId: pet.couple_id, name },
      {
        onSuccess: () => setEditing(false),
        onError: () =>
          Alert.alert('No se pudo cambiar el nombre', 'Revisa tu conexión e inténtalo de nuevo.'),
      },
    );
  }

  const lastAction =
    pet.last_actor && isPetAction(pet.last_action)
      ? `${describeLastCare(
          pet.last_action,
          pet.name,
          pet.last_actor === userId ? null : (names[pet.last_actor] ?? 'Alguien'),
        )} ${formatRelative(pet.updated_at, now)}.`
      : null;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card tone="primary" style={styles.hero}>
        <View style={styles.badges}>
          <StreakBadge streak={stats.streak} caredToday={stats.caredToday} />
          <LevelBadge level={stats.level} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Hacerle mimos a ${pet.name}`}
          onPress={() => act('pet')}
        >
          <PetAvatar ref={avatar} mood={stats.mood} stage={stats.stage} size={210} />
        </Pressable>
        {editing ? (
          <View style={styles.rename}>
            <View style={styles.flex}>
              <TextField
                value={name}
                onChangeText={setName}
                maxLength={24}
                autoFocus
                autoCapitalize="words"
                onSubmitEditing={saveName}
                returnKeyType="done"
              />
            </View>
            <IconButton
              icon={Check}
              tone="primary"
              accessibilityLabel="Guardar nombre"
              onPress={saveName}
              disabled={rename.isPending}
            />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar nombre"
            onPress={() => setEditing(true)}
            style={styles.nameRow}
            hitSlop={8}
          >
            <Text variant="title">{pet.name}</Text>
            <Icon icon={Pencil} size={16} color={colors.textMuted} />
          </Pressable>
        )}
        <Text variant="caption" tone="accent">
          {stageLabel(stats.stage)}
        </Text>
        <Text tone="muted" align="center">
          {MOOD_MESSAGES[stats.mood](pet.name)}
        </Text>
      </Card>

      <PetActions petName={pet.name} onCare={cheer} />

      <Card style={styles.stats}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nivel {stats.level}</Text>
          </View>
          <View style={styles.flex}>
            <ProgressBar value={stats.progress} color={colors.accent} height={8} />
          </View>
        </View>
        <InfoRow
          icon={Sparkles}
          text={
            stats.nextStageLevel
              ? `Evoluciona en el nivel ${stats.nextStageLevel}.`
              : 'Ya es un dragón adulto. ¡Lo lograron!'
          }
        />
        <Stat label="Pancita" value={stats.fullness} color={colors.accent} />
        <Stat label="Ánimo" value={stats.happiness} color={colors.primary} />
      </Card>

      <Card style={styles.stats}>
        <InfoRow
          icon={Flame}
          text={
            stats.streak > 0
              ? `Racha de ${stats.streak === 1 ? '1 día' : `${stats.streak} días`}.${stats.caredToday ? '' : ' Cuídenlo hoy para no perderla.'}`
              : 'Cuídenlo hoy para empezar una racha.'
          }
        />
        <InfoRow
          icon={Trophy}
          text={`Mejor racha: ${pet.best_streak === 1 ? '1 día' : `${pet.best_streak} días`}.`}
        />
      </Card>

      {lastAction && (
        <Text variant="caption" tone="muted" align="center">
          {lastAction}
        </Text>
      )}
    </ScrollView>
  );
}

function InfoRow({ icon, text }: { icon: typeof Flame; text: string }) {
  return (
    <View style={styles.info}>
      <Icon icon={icon} size={18} color={colors.primary} />
      <Text variant="caption" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statHeader}>
        <Text variant="bodyStrong">{label}</Text>
        <Text variant="caption" tone="muted">
          {Math.round(value)}%
        </Text>
      </View>
      <ProgressBar value={value / 100} color={color} height={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rename: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  stats: {
    gap: spacing.md,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: spacing.md - spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  levelText: {
    fontFamily: fonts.extrabold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.accent,
  },
  stat: {
    gap: spacing.xs + spacing.xxs,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
