import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { getCoupleErrorMessage } from '../errors';
import { useJoinCouple } from '../hooks';

const CODE_LENGTH = 6;

export function JoinCoupleForm() {
  const [code, setCode] = useState('');
  const joinCouple = useJoinCouple();

  return (
    <View style={styles.form}>
      <Text variant="title">Ingresa el código</Text>
      <Text tone="muted">Pídele a tu pareja el código de 6 caracteres que aparece en su app.</Text>
      <TextField
        placeholder="ABC123"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={CODE_LENGTH}
        value={code}
        onChangeText={(value) => setCode(value.toUpperCase())}
        style={styles.code}
      />
      {joinCouple.isError && (
        <Text variant="caption" tone="danger">
          {getCoupleErrorMessage(joinCouple.error)}
        </Text>
      )}
      <Button
        title="Unirme"
        onPress={() => joinCouple.mutate(code.trim())}
        loading={joinCouple.isPending}
        disabled={code.trim().length !== CODE_LENGTH}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  code: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
  },
});
