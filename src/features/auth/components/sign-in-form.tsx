import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { getAuthErrorMessage } from '../errors';
import { useSignIn } from '../hooks';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signIn = useSignIn();

  return (
    <View style={styles.form}>
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
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
      />
      {signIn.isError && (
        <Text variant="caption" tone="danger">
          {getAuthErrorMessage(signIn.error)}
        </Text>
      )}
      <Button
        title="Entrar"
        onPress={() => signIn.mutate({ email: email.trim(), password })}
        loading={signIn.isPending}
        disabled={!email.trim() || !password}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
});
