import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Notice } from '@/shared/ui/notice';
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
      <TextField
        label="Tu nombre"
        maxLength={40}
        value={displayName}
        onChangeText={setDisplayName}
      />
      {updateProfile.isError && (
        <Notice message="No se pudo guardar tu nombre. Revisa tu conexión e inténtalo de nuevo." />
      )}
      {hasChanges && (
        <Button
          title="Guardar nombre"
          icon={Check}
          size="sm"
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
