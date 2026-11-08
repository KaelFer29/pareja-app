import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { notificationsModule } from '@/features/notifications/native';
import { colors, spacing } from '@/shared/theme';
import { Card } from '@/shared/ui/card';
import { Notice } from '@/shared/ui/notice';
import { SectionHeader } from '@/shared/ui/section-header';
import { Text } from '@/shared/ui/text';

import { useUpdateNotificationPrefs } from '../hooks';
import {
  NOTIFICATION_PREF_KEYS,
  NOTIFICATION_PREF_LABELS,
  parseNotificationPrefs,
  type NotificationPrefKey,
} from '../notification-prefs';
import type { Profile } from '../types';

type NotificationPrefsCardProps = {
  profile: Profile;
};

export function NotificationPrefsCard({ profile }: NotificationPrefsCardProps) {
  const updatePrefs = useUpdateNotificationPrefs();
  const prefs = parseNotificationPrefs(profile.notification_prefs);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPermission() {
      const Notifications = notificationsModule;
      if (!Notifications) {
        if (active) setPermissionGranted(true);
        return;
      }

      const current = await Notifications.getPermissionsAsync();
      if (active) setPermissionGranted(current.granted);
    }

    void loadPermission();
    return () => {
      active = false;
    };
  }, []);

  function toggle(key: NotificationPrefKey, value: boolean) {
    updatePrefs.mutate({
      userId: profile.id,
      prefs: { ...prefs, [key]: value },
    });
  }

  return (
    <View style={styles.section}>
      <SectionHeader title="Notificaciones" />
      <Card style={styles.card}>
        {permissionGranted === false && (
          <View style={styles.noticeBlock}>
            <Notice message="El teléfono tiene las notificaciones apagadas. Actívalas en los ajustes del sistema." />
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openSettings()}
              style={styles.link}
            >
              <Text variant="bodyStrong" style={styles.linkText}>
                Abrir ajustes del sistema
              </Text>
            </Pressable>
          </View>
        )}
        {NOTIFICATION_PREF_KEYS.map((key) => {
          const label = NOTIFICATION_PREF_LABELS[key];
          return (
            <View key={key} style={styles.row}>
              <View style={styles.texts}>
                <Text variant="bodyStrong">{label.title}</Text>
                <Text variant="caption" tone="muted">
                  {label.description}
                </Text>
              </View>
              <Switch
                value={prefs[key]}
                onValueChange={(value) => toggle(key, value)}
                disabled={updatePrefs.isPending}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.surface}
              />
            </View>
          );
        })}
        {updatePrefs.isError && (
          <Notice message="No se pudieron guardar las preferencias. Revisa tu conexión e inténtalo de nuevo." />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md - spacing.xs,
  },
  card: {
    gap: spacing.md,
  },
  noticeBlock: {
    gap: spacing.sm,
  },
  link: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - spacing.xs,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
});
