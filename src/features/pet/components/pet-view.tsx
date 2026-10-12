import { Check, Cookie, HandHeart, Pencil, Volleyball, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { formatRelative } from '@/shared/utils/date';

import { useCareForPet, useNow, useRenamePet } from '../hooks';
import { describeLastCare, getPetStats, isPetAction, MOOD_MESSAGES } from '../stats';
import type { Pet, PetAction } from '../types';
import { PetAvatar } from './pet-avatar';

type PetViewProps = {
  pet: Pet;
  userId: string;
  names: Record<string, string>;
};

const ACTIONS: { action: PetAction; label: string; icon: LucideIcon }[] = [
  { action: 'feed', label: 'Alimentar', icon: Cookie },
  { action: 'pet', label: 'Mimar', icon: HandHeart },
  { action: 'play', label: 'Jugar', icon: Volleyball },
];

export function PetView({ pet, userId, names }: PetViewProps) {
  const now = useNow();
  const stats = getPetStats(pet, now);
  const care = useCareForPet();
  const rename = useRenamePet();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet.name);

  function act(action: PetAction) {
    care.mutate(action, {
      onError: () =>
        Alert.alert(`No se pudo cuidar a ${pet.name}`, 'Revisa tu conexión e inténtalo de nuevo.'),
    });
  }

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
        <PetAvatar mood={stats.mood} size={200} />
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
        <Text tone="muted" align="center">
          {MOOD_MESSAGES[stats.mood](pet.name)}
        </Text>
      </Card>

      <Card style={styles.stats}>
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Nivel {stats.level}</Text>
          </View>
          <View style={styles.flex}>
            <ProgressBar value={stats.progress} color={colors.accent} height={8} />
          </View>
        </View>
        <Stat label="Pancita" value={stats.fullness} color={colors.accent} />
        <Stat label="Ánimo" value={stats.happiness} color={colors.primary} />
      </Card>

      <View style={styles.actions}>
        {ACTIONS.map(({ action, label, icon }) => (
          <Pressable
            key={action}
            accessibilityRole="button"
            accessibilityLabel={label}
            disabled={care.isPending}
            onPress={() => act(action)}
            style={({ pressed }) => [
              styles.action,
              (pressed || (care.isPending && care.variables === action)) && styles.actionPressed,
            ]}
          >
            <View style={styles.actionIcon}>
              <Icon icon={icon} size={24} color={colors.primary} strokeWidth={2.1} />
            </View>
            <Text variant="caption" style={styles.actionLabel}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {lastAction && (
        <Text variant="caption" tone="muted" align="center">
          {lastAction}
        </Text>
      )}
    </ScrollView>
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
  actions: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    transform: [{ scale: 0.97 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.text,
  },
});
