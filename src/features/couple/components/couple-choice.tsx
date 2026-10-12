import { router } from 'expo-router';
import { ChevronRight, KeyRound, UserPlus, type LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';

import { getCoupleErrorMessage } from '../errors';
import { useCreateCouple } from '../hooks';

export function CoupleChoice() {
  const createCouple = useCreateCouple();

  return (
    <View style={styles.container}>
      <BrandMark
        title="Vincula tu pareja"
        subtitle="Una persona crea la pareja y comparte el código. La otra lo ingresa para unirse."
      />
      <View style={styles.options}>
        <ChoiceOption
          icon={UserPlus}
          tone="primary"
          title="Crear pareja"
          description="Recibirás un código para compartir."
          loading={createCouple.isPending}
          onPress={() => createCouple.mutate()}
        />
        <ChoiceOption
          icon={KeyRound}
          tone="accent"
          title="Tengo un código"
          description="Únete con el código de tu pareja."
          onPress={() => router.push('/join')}
        />
      </View>
      {createCouple.isError && <Notice message={getCoupleErrorMessage(createCouple.error)} />}
    </View>
  );
}

type ChoiceOptionProps = {
  icon: LucideIcon;
  tone: 'primary' | 'accent';
  title: string;
  description: string;
  loading?: boolean;
  onPress: () => void;
};

function ChoiceOption({ icon, tone, title, description, loading, onPress }: ChoiceOptionProps) {
  const color = tone === 'primary' ? colors.primary : colors.accent;
  const background = tone === 'primary' ? colors.primarySoft : colors.accentSoft;

  return (
    <Card onPress={loading ? undefined : onPress} accessibilityLabel={title} style={styles.option}>
      <View style={[styles.optionIcon, { backgroundColor: background }]}>
        <Icon icon={icon} size={22} color={color} />
      </View>
      <View style={styles.optionTexts}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" tone="muted">
          {description}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Icon icon={ChevronRight} size={20} color={colors.textMuted} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  options: {
    gap: spacing.md - spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  optionIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTexts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
