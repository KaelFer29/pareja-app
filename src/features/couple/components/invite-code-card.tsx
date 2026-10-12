import { ActivityIndicator, Share, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
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
      <Text variant="title" align="center">
        Comparte este código
      </Text>
      <Text tone="muted" align="center">
        Tu pareja debe crear su cuenta y elegir &quot;Tengo un código&quot;.
      </Text>
      <Card style={styles.card}>
        <Text variant="title" tone="primary" align="center" style={styles.code} selectable>
          {code}
        </Text>
      </Card>
      <Button title="Compartir código" onPress={share} />
      <View style={styles.waiting}>
        <ActivityIndicator color={colors.primary} />
        <Text variant="caption" tone="muted">
          Esperando a tu pareja
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    alignItems: 'center',
  },
  code: {
    letterSpacing: 8,
  },
  waiting: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
