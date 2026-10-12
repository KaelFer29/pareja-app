import { PawPrint } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useAdoptPet } from '../hooks';
import { PetAvatar } from './pet-avatar';

export function AdoptPet() {
  const [name, setName] = useState('');
  const adopt = useAdoptPet();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <PetAvatar mood="happy" size={190} />
      <View style={styles.texts}>
        <Text variant="title" align="center">
          Adopten una mascota
        </Text>
        <Text tone="muted" align="center">
          Es de los dos. Aliméntenla, mímenla y jueguen con ella para que suba de nivel.
        </Text>
      </View>
      <Card style={styles.card}>
        <TextField
          label="¿Cómo se va a llamar?"
          placeholder="Por ejemplo, Mochi"
          maxLength={24}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        {adopt.isError && (
          <Notice message="No se pudo adoptar. Revisa tu conexión e inténtalo de nuevo." />
        )}
        <Button
          title="Adoptar"
          icon={PawPrint}
          onPress={() => adopt.mutate(name)}
          loading={adopt.isPending}
          disabled={name.trim() === ''}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  texts: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  card: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
