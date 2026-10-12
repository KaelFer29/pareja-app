import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import {
  useAddItem,
  useDeleteItem,
  useDeleteList,
  useListItems,
  useRenameList,
  useToggleItem,
} from '../hooks';
import type { List, ListItem } from '../types';

const CHECK_SIZE = 26;

type ListDetailProps = {
  list: List;
};

export function ListDetail({ list }: ListDetailProps) {
  const items = useListItems(list.id);
  const addItem = useAddItem();
  const renameList = useRenameList();
  const deleteList = useDeleteList();
  const [title, setTitle] = useState(list.title);
  const [content, setContent] = useState('');

  const sorted = [...(items.data ?? [])].sort((a, b) => Number(a.done) - Number(b.done));

  function add() {
    if (content.trim() === '') return;
    addItem.mutate(
      { listId: list.id, coupleId: list.couple_id, content },
      { onSuccess: () => setContent('') },
    );
  }

  function rename() {
    if (title.trim() === '' || title.trim() === list.title) {
      setTitle(list.title);
      return;
    }
    renameList.mutate({ id: list.id, title });
  }

  function confirmDelete() {
    Alert.alert(
      'Eliminar lista',
      'La lista y sus elementos se eliminarán para los dos. No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            deleteList.mutate(list.id, {
              onSuccess: () => router.back(),
              onError: () =>
                Alert.alert(
                  'No se pudo eliminar la lista',
                  'Revisa tu conexión e inténtalo de nuevo.',
                ),
            }),
        },
      ],
    );
  }

  const header = (
    <View style={styles.header}>
      <TextField
        value={title}
        onChangeText={setTitle}
        onEndEditing={rename}
        maxLength={60}
        style={styles.title}
      />
      <View style={styles.form}>
        <TextField
          placeholder="Agregar elemento"
          maxLength={200}
          value={content}
          onChangeText={setContent}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          style={styles.input}
        />
        <Button
          title="Agregar"
          onPress={add}
          loading={addItem.isPending}
          disabled={content.trim() === ''}
        />
      </View>
      {(addItem.isError || renameList.isError) && (
        <Text variant="caption" tone="danger">
          No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      renderItem={({ item }) => <ItemRow item={item} />}
      ListEmptyComponent={
        items.isPending ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text tone="muted" align="center">
            Esta lista está vacía. Agrega el primer elemento.
          </Text>
        )
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text variant="caption" tone="muted" align="center">
            Mantén presionado un elemento para eliminarlo.
          </Text>
          <Button
            title="Eliminar lista"
            variant="secondary"
            onPress={confirmDelete}
            loading={deleteList.isPending}
          />
        </View>
      }
    />
  );
}

function ItemRow({ item }: { item: ListItem }) {
  const toggleItem = useToggleItem();
  const deleteItem = useDeleteItem();

  function confirmDelete() {
    Alert.alert('Eliminar elemento', item.content, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          deleteItem.mutate(item.id, {
            onError: () =>
              Alert.alert(
                'No se pudo eliminar el elemento',
                'Revisa tu conexión e inténtalo de nuevo.',
              ),
          }),
      },
    ]);
  }

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.done }}
      onPress={() => toggleItem.mutate({ id: item.id, listId: item.list_id, done: !item.done })}
      onLongPress={confirmDelete}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.check, item.done && styles.checked]}>
        {item.done && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text
        tone={item.done ? 'muted' : 'default'}
        style={[styles.itemText, item.done && styles.done]}
      >
        {item.content}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontWeight: '600',
  },
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: CHECK_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.primary,
  },
  checkMark: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  itemText: {
    flex: 1,
  },
  done: {
    textDecorationLine: 'line-through',
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
