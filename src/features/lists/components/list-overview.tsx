import { router } from 'expo-router';
import { ChevronRight, ListChecks, ListTodo } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { AddField } from '@/shared/ui/add-field';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Icon } from '@/shared/ui/icon';
import { Notice } from '@/shared/ui/notice';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { ErrorState, LoadingState } from '@/shared/ui/states';
import { Text } from '@/shared/ui/text';

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
      <AddField
        placeholder="Nueva lista, por ejemplo Viajes"
        accessibilityLabel="Crear lista"
        maxLength={60}
        value={title}
        onChangeText={setTitle}
        onSubmit={create}
        loading={createList.isPending}
      />
      {createList.isError && (
        <Notice message="No se pudo crear la lista. Revisa tu conexión e inténtalo de nuevo." />
      )}
    </View>
  );

  if (lists.isPending) {
    return <LoadingState />;
  }

  if (lists.isError) {
    return <ErrorState title="No se pudieron cargar las listas" onRetry={() => lists.refetch()} />;
  }

  return (
    <FlatList
      data={lists.data}
      keyExtractor={(list) => list.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
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
        <EmptyState
          icon={ListTodo}
          title="Aún no hay listas"
          description="Crea una para sus planes, deseos o pendientes."
        />
      }
    />
  );
}

function ListCard({ list }: { list: ListSummary }) {
  const isComplete = list.total > 0 && list.done === list.total;
  const progress =
    list.total === 0
      ? 'Sin elementos'
      : isComplete
        ? 'Todo listo'
        : `${list.done} de ${list.total} hechos`;

  return (
    <Card onPress={() => router.push({ pathname: '/lists/[id]', params: { id: list.id } })}>
      <View style={styles.row}>
        <View style={[styles.iconBox, isComplete && styles.iconBoxComplete]}>
          <Icon icon={ListChecks} size={20} color={isComplete ? colors.primary : colors.accent} />
        </View>
        <View style={styles.texts}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {list.title}
          </Text>
          <Text variant="caption" tone={isComplete ? 'primary' : 'muted'}>
            {progress}
          </Text>
        </View>
        <Icon icon={ChevronRight} size={20} color={colors.textMuted} />
      </View>
      {list.total > 0 && <ProgressBar value={list.done / list.total} />}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md - spacing.xs,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxComplete: {
    backgroundColor: colors.primarySoft,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
