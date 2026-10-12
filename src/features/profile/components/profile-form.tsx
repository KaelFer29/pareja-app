import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useUpdateProfile } from '../hooks';
import type { Profile } from '../types';

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const updateProfile = useUpdateProfile();
  const trimmed = displayName.trim();
  const hasChanges = trimmed !== profile.display_name;

  return (
    <View style={styles.form}>
      <Text variant="caption" tone="muted">
        Tu nombre
      </Text>
      <TextField maxLength={40} value={displayName} onChangeText={setDisplayName} />
      {updateProfile.isError && (
        <Text variant="caption" tone="danger">
          No se pudo guardar tu nombre. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
      {hasChanges && (
        <Button
          title="Guardar"
          onPress={() => updateProfile.mutate({ userId: profile.id, displayName: trimmed })}
          loading={updateProfile.isPending}
          disabled={!trimmed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.sm,
  },
});
