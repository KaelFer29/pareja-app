import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { SignInForm } from '@/features/auth/components/sign-in-form';
import { colors, spacing, typography } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function SignInScreen() {
  return (
    <Screen style={styles.container} avoidKeyboard>
      <Text variant="title" align="center" style={styles.title}>
        Pareja
      </Text>
      <SignInForm />
      <Link href="/sign-up" replace style={styles.link}>
        ¿No tienes cuenta? Créala aquí
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  title: {
    marginBottom: spacing.xl,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
