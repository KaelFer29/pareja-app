import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fonts, spacing } from '@/shared/theme';
import { BrandMark } from '@/shared/ui/brand-mark';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
import { TextField } from '@/shared/ui/text-field';

import { getCoupleErrorMessage } from '../errors';
import { useJoinCouple } from '../hooks';

const CODE_LENGTH = 6;

export function JoinCoupleForm() {
  const [code, setCode] = useState('');
  const joinCouple = useJoinCouple();

  return (
    <View style={styles.form}>
      <BrandMark
        title="Ingresa el código"
        subtitle="Pídele a tu pareja el código de 6 caracteres que aparece en su app."
      />
      <View style={styles.fields}>
        <TextField
          placeholder="ABC123"
          accessibilityLabel="Código de pareja"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          maxLength={CODE_LENGTH}
          value={code}
          onChangeText={(value) => setCode(value.toUpperCase())}
          style={styles.code}
        />
        {joinCouple.isError && <Notice message={getCoupleErrorMessage(joinCouple.error)} />}
        <Button
          title="Unirme"
          onPress={() => joinCouple.mutate(code.trim())}
          loading={joinCouple.isPending}
          disabled={code.trim().length !== CODE_LENGTH}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.xl,
  },
  fields: {
    gap: spacing.md,
  },
  code: {
    textAlign: 'center',
    letterSpacing: 10,
    fontSize: 26,
    lineHeight: 32,
    fontFamily: fonts.extrabold,
    minHeight: 64,
  },
});
