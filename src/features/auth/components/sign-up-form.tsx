import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { getAuthErrorMessage } from '../errors';
import { useSignUp } from '../hooks';

export function SignUpForm() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signUp = useSignUp();

  if (signUp.data?.needsEmailConfirmation) {
    return (
      <Card>
        <Text variant="subtitle">Revisa tu correo</Text>
        <Text tone="muted">
          Te enviamos un enlace a {email.trim()}. Ábrelo para confirmar tu cuenta y luego inicia
          sesión.
        </Text>
      </Card>
    );
  }

  const canSubmit = displayName.trim() && email.trim() && password;

  return (
    <View style={styles.form}>
      <TextField
        placeholder="Tu nombre"
        autoComplete="name"
        maxLength={40}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextField
        placeholder="Correo"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        placeholder="Contraseña"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />
      {signUp.isError && (
        <Text variant="caption" tone="danger">
          {getAuthErrorMessage(signUp.error)}
        </Text>
      )}
      <Button
        title="Crear cuenta"
        onPress={() =>
          signUp.mutate({ displayName: displayName.trim(), email: email.trim(), password })
        }
        loading={signUp.isPending}
        disabled={!canSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
