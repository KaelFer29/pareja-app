import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
import { TextField } from '@/shared/ui/text-field';

import { useAuth } from '../auth-provider';
import { getAuthErrorMessage } from '../errors';
import { useUpdatePassword } from '../hooks';

export function ResetPasswordForm() {
  const { clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const updatePassword = useUpdatePassword();
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <View style={styles.form}>
      <TextField
        label="Nueva contraseña"
        placeholder="Al menos 6 caracteres"
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        secureTextEntry
        autoComplete="new-password"
        value={confirm}
        onChangeText={setConfirm}
      />
      {mismatch && <Notice message="Las contraseñas no coinciden." />}
      {updatePassword.isError && <Notice message={getAuthErrorMessage(updatePassword.error)} />}
      {updatePassword.isSuccess && (
        <Notice tone="info" message="Tu contraseña quedó actualizada." />
      )}
      <View style={styles.action}>
        <Button
          title="Guardar contraseña"
          onPress={() => {
            updatePassword.mutate(
              { password },
              {
                onSuccess: () => {
                  clearPasswordRecovery();
                  router.replace('/');
                },
              },
            );
          }}
          loading={updatePassword.isPending}
          disabled={password.length < 6 || password !== confirm}
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
