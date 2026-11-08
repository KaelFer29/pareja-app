import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Notice } from '@/shared/ui/notice';
import { SectionHeader } from '@/shared/ui/section-header';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { getAuthErrorMessage } from '../errors';
import { useUpdateEmail, useUpdatePassword } from '../hooks';

type AccountSecurityCardProps = {
  currentEmail: string;
};

export function AccountSecurityCard({ currentEmail }: AccountSecurityCardProps) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const updateEmail = useUpdateEmail();
  const updatePassword = useUpdatePassword();
  const passwordMismatch = confirm.length > 0 && password !== confirm;
  const emailChanged = email.trim().toLowerCase() !== currentEmail.toLowerCase();

  return (
    <View style={styles.section}>
      <SectionHeader title="Cuenta y seguridad" />
      <Card style={styles.card}>
        <Text variant="bodyStrong">Cambiar correo</Text>
        <Text variant="caption" tone="muted">
          Te enviaremos un enlace al correo nuevo para confirmarlo.
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
        {updateEmail.isError && <Notice message={getAuthErrorMessage(updateEmail.error)} />}
        {updateEmail.isSuccess && (
          <Notice
            tone="info"
            message="Revisa el correo nuevo y confirma el cambio. Hasta entonces sigue valiendo el actual."
          />
        )}
        <Button
          title="Actualizar correo"
          onPress={() => updateEmail.mutate({ email: email.trim() })}
          loading={updateEmail.isPending}
          disabled={!emailChanged || !email.trim()}
        />

        <View style={styles.divider} />

        <Text variant="bodyStrong">Cambiar contraseña</Text>
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
        {passwordMismatch && <Notice message="Las contraseñas no coinciden." />}
        {updatePassword.isError && <Notice message={getAuthErrorMessage(updatePassword.error)} />}
        {updatePassword.isSuccess && (
          <Notice tone="info" message="Tu contraseña quedó actualizada." />
        )}
        <Button
          title="Actualizar contraseña"
          onPress={() =>
            updatePassword.mutate(
              { password },
              {
                onSuccess: () => {
                  setPassword('');
                  setConfirm('');
                },
              },
            )
          }
          loading={updatePassword.isPending}
          disabled={password.length < 6 || password !== confirm}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md - spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
