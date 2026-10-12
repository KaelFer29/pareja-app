import { Share2 } from 'lucide-react-native';
import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';

import { colors, fonts, radius, spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';

type InviteCodeCardProps = {
  code: string;
};

export function InviteCodeCard({ code }: InviteCodeCardProps) {
  function share() {
    Share.share({ message: `Únete a nuestra pareja en la app con este código: ${code}` });
  }

  return (
    <View style={styles.container}>
      <BrandMark
        title="Comparte este código"
        subtitle={'Tu pareja debe crear su cuenta y elegir "Tengo un código".'}
      />
      <Card style={styles.card}>
        <Text variant="label" tone="muted">
          Código de pareja
        </Text>
        <View style={styles.codeRow}>
          {code.split('').map((char, index) => (
            <View key={index} style={styles.codeCell}>
              <Text style={styles.codeChar} selectable>
                {char}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <Button title="Compartir código" icon={Share2} onPress={share} />
      <View style={styles.waiting}>
        <ActivityIndicator color={colors.primary} size="small" />
        <Text variant="caption" tone="muted">
          Esperando a tu pareja
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    alignItems: 'center',
    gap: spacing.md,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.xs + spacing.xxs,
  },
  codeCell: {
    width: 42,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.accent,
  },
  waiting: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
