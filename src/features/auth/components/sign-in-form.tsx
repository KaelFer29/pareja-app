import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
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
        label="Correo"
        placeholder="tu@correo.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Contraseña"
        placeholder="Tu contraseña"
        secureTextEntry
        autoComplete="current-password"
        value={password}
        onChangeText={setPassword}
      />
      {signIn.isError && <Notice message={getAuthErrorMessage(signIn.error)} />}
      <View style={styles.action}>
        <Button
          title="Entrar"
          onPress={() => signIn.mutate({ email: email.trim(), password })}
          loading={signIn.isPending}
          disabled={!email.trim() || !password}
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
