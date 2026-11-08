import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { getAuthErrorMessage } from '../errors';
import { useRequestPasswordReset } from '../hooks';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const reset = useRequestPasswordReset();

  if (reset.isSuccess) {
    return (
      <View style={styles.form}>
        <Notice
          tone="info"
          message="Te enviamos un correo para restablecer tu contraseña. Abre el enlace desde este teléfono."
        />
      </View>
    );
  }

  return (
    <View style={styles.form}>
      <Text tone="muted">
        Escribe el correo de tu cuenta. Te enviaremos un enlace para elegir una contraseña nueva.
      </Text>
      <TextField
        label="Correo"
        placeholder="tu@correo.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {reset.isError && <Notice message={getAuthErrorMessage(reset.error)} />}
      <View style={styles.action}>
        <Button
          title="Enviar enlace"
          onPress={() => reset.mutate({ email: email.trim() })}
          loading={reset.isPending}
          disabled={!email.trim()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  action: {
    marginTop: spacing.sm,
  },
});
