import { router } from 'expo-router';
import { Check, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, fonts, radius, shadows, spacing } from '@/shared/theme';
import { AddField } from '@/shared/ui/add-field';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { SCREEN_PADDING } from '@/shared/ui/screen';
import { LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';

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
  const doneCount = sorted.filter((item) => item.done).length;

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
      <TextInput
        accessibilityLabel="Nombre de la lista"
        value={title}
        onChangeText={setTitle}
        onEndEditing={rename}
        maxLength={60}
        selectionColor={colors.primary}
        cursorColor={colors.primary}
        style={styles.title}
      />
      {sorted.length > 0 && (
        <View style={styles.progress}>
          <Text variant="caption" tone="muted">
            {doneCount} de {sorted.length} hechos
          </Text>
          <ProgressBar value={doneCount / sorted.length} />
        </View>
      )}
      <AddField
        placeholder="Agregar elemento"
        accessibilityLabel="Agregar elemento"
        maxLength={200}
        value={content}
        onChangeText={setContent}
        onSubmit={add}
        loading={addItem.isPending}
      />
      {(addItem.isError || renameList.isError) && (
        <Notice message="No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      renderItem={({ item }) => <ItemRow item={item} />}
      ListEmptyComponent={
        items.isPending ? (
          <LoadingState />
        ) : (
          <Text tone="muted" align="center" style={styles.empty}>
            Esta lista está vacía. Agrega el primer elemento.
          </Text>
        )
      }
      ListFooterComponent={
        <View style={styles.footer}>
          {sorted.length > 0 && (
            <Text variant="caption" tone="muted" align="center">
              Mantén presionado un elemento para eliminarlo.
            </Text>
          )}
          <Button
            title="Eliminar lista"
            variant="danger"
            icon={Trash2}
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
      style={({ pressed }) => [styles.row, item.done && styles.rowDone, pressed && styles.pressed]}
    >
      <View style={[styles.check, item.done && styles.checked]}>
        {item.done && <Icon icon={Check} size={16} color={colors.primaryText} strokeWidth={3} />}
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
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.md - spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 26,
    lineHeight: 34,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  progress: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
    paddingVertical: spacing.md - spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  rowDone: {
    backgroundColor: colors.surfaceMuted,
    shadowOpacity: 0,
    elevation: 0,
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
  itemText: {
    flex: 1,
  },
  done: {
    textDecorationLine: 'line-through',
  },
  empty: {
    marginTop: spacing.lg,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
