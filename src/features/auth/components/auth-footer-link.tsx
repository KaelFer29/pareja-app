import { Link, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { colors, fonts, spacing, typography } from '@/shared/theme';
import { Text } from '@/shared/ui/text';

type AuthFooterLinkProps = {
  question: string;
  action: string;
  href: Href;
};

export function AuthFooterLink({ question, action, href }: AuthFooterLinkProps) {
  return (
    <Text tone="muted" align="center" style={styles.container}>
      {question}{' '}
      <Link href={href} replace style={styles.link}>
        {action}
      </Link>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  link: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
});
