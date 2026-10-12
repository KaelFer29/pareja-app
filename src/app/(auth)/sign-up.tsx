import { ScrollView, StyleSheet } from 'react-native';

import { AuthFooterLink } from '@/features/auth/components/auth-footer-link';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Screen } from '@/shared/ui/screen';

export default function SignUpScreen() {
  return (
    <Screen avoidKeyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark title="Crea tu cuenta" subtitle="Después podrás vincularte con tu pareja." />
        <SignUpForm />
        <AuthFooterLink question="¿Ya tienes cuenta?" action="Inicia sesión" href="/sign-in" />
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
