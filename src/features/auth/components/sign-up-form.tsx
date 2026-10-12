import { MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Notice } from '@/shared/ui/notice';
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
      <EmptyState
        icon={MailCheck}
        title="Revisa tu correo"
        description={`Te enviamos un enlace a ${email.trim()}. Ábrelo para confirmar tu cuenta y luego inicia sesión.`}
      />
    );
  }

  const canSubmit = displayName.trim() && email.trim() && password;

  return (
    <View style={styles.form}>
      <TextField
        label="Tu nombre"
        placeholder="Como te llama tu pareja"
        autoComplete="name"
        maxLength={40}
        value={displayName}
        onChangeText={setDisplayName}
      />
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
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />
      {signUp.isError && <Notice message={getAuthErrorMessage(signUp.error)} />}
      <View style={styles.action}>
        <Button
          title="Crear cuenta"
          onPress={() =>
            signUp.mutate({ displayName: displayName.trim(), email: email.trim(), password })
          }
          loading={signUp.isPending}
          disabled={!canSubmit}
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
