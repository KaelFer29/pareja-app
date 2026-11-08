export const NOTIFICATION_PREF_KEYS = [
  'photos',
  'notes',
  'nudges',
  'edits',
  'events',
  'places',
  'pet',
  'reactions',
] as const;

export type NotificationPrefKey = (typeof NOTIFICATION_PREF_KEYS)[number];

export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  photos: true,
  notes: true,
  nudges: true,
  edits: true,
  events: true,
  places: true,
  pet: true,
  reactions: true,
};

export const NOTIFICATION_PREF_LABELS: Record<
  NotificationPrefKey,
  { title: string; description: string }
> = {
  photos: { title: 'Fotos', description: 'Cuando tu pareja sube una foto' },
  notes: { title: 'Notas', description: 'Notas nuevas y respuestas' },
  nudges: { title: 'Toques', description: 'Pienso en ti, te extraño y más' },
  edits: { title: 'Ediciones', description: 'Cambios en fotos, notas, planes o lugares' },
  events: { title: 'Planes', description: 'Planes nuevos en el calendario' },
  places: { title: 'Lugares', description: 'Lugares nuevos en el mapa' },
  pet: { title: 'Perrito', description: 'Propuestas de salida por la racha' },
  reactions: { title: 'Reacciones', description: 'Emojis en tus fotos y notas' },
};

export function parseNotificationPrefs(value: unknown): NotificationPrefs {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return NOTIFICATION_PREF_KEYS.reduce((prefs, key) => {
    prefs[key] = typeof source[key] === 'boolean' ? source[key] : DEFAULT_NOTIFICATION_PREFS[key];
    return prefs;
  }, {} as NotificationPrefs);
}
