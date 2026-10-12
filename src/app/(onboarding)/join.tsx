import { ScrollView, StyleSheet } from 'react-native';

import { JoinCoupleForm } from '@/features/couple/components/join-couple-form';
import { spacing } from '@/shared/theme';
import { Screen } from '@/shared/ui/screen';

export default function JoinScreen() {
  return (
    <Screen avoidKeyboard withTopInset={false}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <JoinCoupleForm />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingVertical: spacing.lg,
  },
});
