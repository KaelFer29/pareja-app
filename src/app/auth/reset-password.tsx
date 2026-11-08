import { ScrollView, StyleSheet } from 'react-native';

import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Screen } from '@/shared/ui/screen';

export default function ResetPasswordScreen() {
  return (
    <Screen avoidKeyboard>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMark title="Nueva contraseña" subtitle="Elige una contraseña que solo tú conozcas." />
        <ResetPasswordForm />
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
