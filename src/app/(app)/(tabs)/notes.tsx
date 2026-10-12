import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useCouple } from '@/features/couple/couple-provider';
import { NoteList } from '@/features/notes/components/note-list';
import { spacing } from '@/shared/theme';
import { Fab } from '@/shared/ui/fab';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

export default function NotesScreen() {
  const { couple } = useCouple();

  const authorNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const member of couple?.members ?? []) {
      if (member.profile) names[member.user_id] = member.profile.display_name || 'Alguien';
    }
    return names;
  }, [couple]);

  return (
    <Screen>
      <Text variant="title" style={styles.title}>
        Notas
      </Text>
      {couple && <NoteList coupleId={couple.id} authorNames={authorNames} />}
      <Fab accessibilityLabel="Nueva nota" onPress={() => router.push('/notes/new')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.md,
  },
});
