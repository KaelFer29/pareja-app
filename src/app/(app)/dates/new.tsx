import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { DateForm } from '@/features/dates/components/date-form';

export default function NewDateScreen() {
  const { couple } = useCouple();

  if (!couple) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DateForm coupleId={couple.id} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
