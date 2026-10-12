import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, fonts, shadows, spacing } from '@/shared/theme';

import { Text } from './text';

const VISIBLE_TABS = 5;
const MIN_TAB_WIDTH = 72;

export function ScrollableTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const fits = state.routes.length <= VISIBLE_TABS;
  const tabWidth = fits
    ? width / state.routes.length
    : Math.max(MIN_TAB_WIDTH, (width - spacing.md) / (VISIBLE_TABS + 0.4));

  useEffect(() => {
    if (fits) return;
    const x = state.index * tabWidth - (width - tabWidth) / 2;
    scroll.current?.scrollTo({ x: Math.max(0, x), animated: true });
  }, [fits, state.index, tabWidth, width]);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <ScrollView
        ref={scroll}
        horizontal
        scrollEnabled={!fits}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.textMuted;
          const label = typeof options.title === 'string' ? options.title : route.name;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={[styles.tab, { width: tabWidth }]}
            >
              {focused && <View style={styles.indicator} />}
              {options.tabBarIcon?.({ focused, color, size: 23 })}
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    ...shadows.card,
  },
  content: {
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  indicator: {
    position: 'absolute',
    top: -spacing.sm,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
  },
});
