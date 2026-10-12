import { ScrollView, StyleSheet } from 'react-native';

import { AuthFooterLink } from '@/features/auth/components/auth-footer-link';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Screen } from '@/shared/ui/screen';

export default function SignInScreen() {
  return (
    <Screen avoidKeyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark title="Pareja" subtitle="Su espacio para compartir lo de todos los días." />
        <SignInForm />
        <AuthFooterLink question="¿No tienes cuenta?" action="Créala aquí" href="/sign-up" />
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
