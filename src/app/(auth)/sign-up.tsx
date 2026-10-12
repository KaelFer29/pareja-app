import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { colors, spacing, typography } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function SignUpScreen() {
  return (
    <Screen style={styles.container} avoidKeyboard>
      <Text variant="title" align="center" style={styles.title}>
        Crea tu cuenta
      </Text>
      <SignUpForm />
      <Link href="/sign-in" replace style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
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
