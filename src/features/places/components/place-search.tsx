import { MapPin, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { Text } from '@/shared/ui/text';

import { getKnownLocation } from '../location';
import { searchAddress, type AddressResult } from '../search';

type PlaceSearchProps = {
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
};

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: AddressResult[] }
  | { status: 'error' };

export function PlaceSearch({
  onSelect,
  placeholder = 'Busca una dirección o un lugar',
}: PlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ status: 'idle' });

  async function search() {
    if (query.trim().length < 3) return;
    setState({ status: 'loading' });
    try {
      const near = await getKnownLocation().catch(() => null);
      setState({ status: 'done', results: await searchAddress(query, near) });
    } catch {
      setState({ status: 'error' });
    }
  }

  function clear() {
    setQuery('');
    setState({ status: 'idle' });
  }

  function select(result: AddressResult) {
    setState({ status: 'idle' });
    setQuery(result.name);
    onSelect(result);
  }

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Icon icon={Search} size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          returnKeyType="search"
          autoCorrect={false}
          style={styles.input}
        />
        {state.status === 'loading' ? (
          <ActivityIndicator color={colors.primary} />
        ) : query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Borrar búsqueda"
            onPress={clear}
            hitSlop={8}
          >
            <Icon icon={X} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {state.status === 'error' && (
        <Notice message="No se pudo buscar. Revisa tu conexión e inténtalo de nuevo." />
      )}

      {state.status === 'done' && (
        <View style={styles.results}>
          {state.results.length === 0 ? (
            <Text variant="caption" tone="muted" style={styles.empty}>
              No encontramos ese lugar. Prueba agregando la ciudad o el país.
            </Text>
          ) : (
            state.results.map((result) => (
              <Pressable
                key={result.id}
                accessibilityRole="button"
                accessibilityLabel={`${result.name}, ${result.address}`}
                onPress={() => select(result)}
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}
              >
                <Icon icon={MapPin} size={18} color={colors.primary} />
                <View style={styles.texts}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {result.name}
                  </Text>
                  <Text variant="caption" tone="muted" numberOfLines={2}>
                    {result.address}
                  </Text>
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md - spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm + spacing.xxs,
  },
  results: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + spacing.xxs,
    paddingHorizontal: spacing.md - spacing.xs,
    paddingVertical: spacing.sm + spacing.xxs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.primarySoft,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  empty: {
    padding: spacing.md - spacing.xs,
  },
});
