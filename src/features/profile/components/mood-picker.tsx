import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { Notice } from '@/shared/ui/notice';
import { TextField } from '@/shared/ui/text-field';

import { useUpdateMood } from '../hooks';
import { MOOD_SUGGESTIONS, MOOD_TEXT_MAX } from '../moods';

type MoodPickerProps = {
  userId: string;
  emoji: string | null;
  text: string | null;
  onChange?: () => void;
};

export function MoodPicker({ userId, emoji, text, onChange }: MoodPickerProps) {
  const updateMood = useUpdateMood();
  const [draftEmoji, setDraftEmoji] = useState(emoji ?? '');
  const [draftText, setDraftText] = useState(text ?? '');

  function save(nextEmoji: string | null, nextText: string | null) {
    updateMood.mutate(
      { userId, emoji: nextEmoji, text: nextText },
      { onSuccess: () => onChange?.() },
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.options}>
        {MOOD_SUGGESTIONS.map((option) => {
          const selected = option.emoji === draftEmoji && option.text === draftText;
          return (
            <Chip
              key={option.text}
              emoji={option.emoji}
              label={option.text}
              selected={selected}
              onPress={() => {
                setDraftEmoji(option.emoji);
                setDraftText(option.text);
                save(option.emoji, option.text);
              }}
            />
          );
        })}
      </View>
      <TextField
        label="Emoji"
        placeholder="Elige un emoji"
        value={draftEmoji}
        onChangeText={setDraftEmoji}
        maxLength={8}
      />
      <TextField
        label="Cómo te sientes"
        placeholder="En pocas palabras"
        value={draftText}
        onChangeText={(value) => setDraftText(value.slice(0, MOOD_TEXT_MAX))}
        maxLength={MOOD_TEXT_MAX}
      />
      <Button
        title="Guardar"
        onPress={() => save(draftEmoji.trim() || null, draftText.trim() || null)}
        loading={updateMood.isPending}
        disabled={!draftEmoji.trim() && !draftText.trim()}
      />
      <Button
        title="Quitar estado"
        variant="ghost"
        onPress={() => {
          setDraftEmoji('');
          setDraftText('');
          save(null, null);
        }}
      />
      {updateMood.isError && (
        <Notice message="No se pudo guardar tu estado. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md - spacing.xs,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
