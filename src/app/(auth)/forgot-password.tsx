import { ScrollView, StyleSheet } from 'react-native';

import { AuthFooterLink } from '@/features/auth/components/auth-footer-link';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Screen } from '@/shared/ui/screen';

export default function ForgotPasswordScreen() {
  return (
    <Screen avoidKeyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark title="Recuperar acceso" subtitle="Te ayudamos a elegir una contraseña nueva." />
        <ForgotPasswordForm />
        <AuthFooterLink question="¿Ya la recordaste?" action="Volver a entrar" href="/sign-in" />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
});
