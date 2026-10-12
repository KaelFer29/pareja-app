import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { colors, spacing } from '@/shared/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { useCreateList, useLists } from '../hooks';
import type { ListSummary } from '../types';

type ListOverviewProps = {
  coupleId: string;
};

export function ListOverview({ coupleId }: ListOverviewProps) {
  const lists = useLists(coupleId);
  const createList = useCreateList();
  const [title, setTitle] = useState('');

  function create() {
    if (title.trim() === '') return;
    createList.mutate(
      { coupleId, title },
      {
        onSuccess: (list) => {
          setTitle('');
          router.push({ pathname: '/lists/[id]', params: { id: list.id } });
        },
      },
    );
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.form}>
        <TextField
          placeholder="Nueva lista, por ejemplo Viajes"
          maxLength={60}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={create}
          returnKeyType="done"
          style={styles.input}
        />
        <Button
          title="Crear"
          onPress={create}
          loading={createList.isPending}
          disabled={title.trim() === ''}
        />
      </View>
      {createList.isError && (
        <Text variant="caption" tone="danger">
          No se pudo crear la lista. Revisa tu conexión e inténtalo de nuevo.
        </Text>
      )}
    </View>
  );

  if (lists.isPending) {
    return <ActivityIndicator color={colors.primary} style={styles.loader} />;
  }

  if (lists.isError) {
    return (
      <View style={styles.message}>
        <Text tone="danger" align="center">
          No se pudieron cargar las listas. Revisa tu conexión e inténtalo de nuevo.
        </Text>
        <Button title="Reintentar" onPress={() => lists.refetch()} />
      </View>
    );
  }

  return (
    <FlatList
      data={lists.data}
      keyExtractor={(list) => list.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      renderItem={({ item }) => <ListCard list={item} />}
      refreshControl={
        <RefreshControl
          refreshing={lists.isRefetching}
          onRefresh={() => lists.refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={
        <Text tone="muted" align="center" style={styles.empty}>
          Aún no hay listas. Crea una para sus planes, deseos o pendientes.
        </Text>
      }
    />
  );
}

function ListCard({ list }: { list: ListSummary }) {
  const progress = list.total === 0 ? 'Sin elementos' : `${list.done} de ${list.total} hechos`;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/lists/[id]', params: { id: list.id } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card>
        <Text variant="subtitle">{list.title}</Text>
        <Text variant="caption" tone="muted">
          {progress}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: spacing.xl,
  },
  message: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  empty: {
    marginTop: spacing.xl,
  },
});
