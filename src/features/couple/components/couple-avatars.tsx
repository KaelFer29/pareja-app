import { Heart } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/shared/theme';
import { Avatar } from '@/shared/ui/avatar';
import { ViewableAvatar } from '@/shared/ui/avatar-viewer';
import { Icon } from '@/shared/ui/icon';

type Person = {
  name: string;
  avatarPath: string | null | undefined;
  badge?: ReactNode;
};

type CoupleAvatarsProps = {
  me: Person;
  partner: Person;
  size?: number;
  onPressMe?: () => void;
  pressMeLabel?: string;
};

function AvatarBadge({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <View style={styles.corner}>{children}</View>;
}

export function CoupleAvatars({
  me,
  partner,
  size = 56,
  onPressMe,
  pressMeLabel,
}: CoupleAvatarsProps) {
  const overlap = size * 0.22;
  const badge = Math.round(size * 0.42);

  return (
    <View style={styles.container}>
      <View style={shadows.card}>
        {onPressMe ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={pressMeLabel}
            onPress={onPressMe}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Avatar path={me.avatarPath} name={me.name} size={size} ringColor={colors.surface} />
          </Pressable>
        ) : (
          <ViewableAvatar
            path={me.avatarPath}
            name={me.name}
            size={size}
            ringColor={colors.surface}
          />
        )}
        <AvatarBadge>{me.badge}</AvatarBadge>
      </View>
      <View style={[styles.badge, { width: badge, height: badge, marginHorizontal: -overlap }]}>
        <Icon icon={Heart} size={badge * 0.5} color={colors.primary} fill={colors.primary} />
      </View>
      <View style={shadows.card}>
        <ViewableAvatar
          path={partner.avatarPath}
          name={partner.name}
          size={size}
          ringColor={colors.surface}
        />
        <AvatarBadge>{partner.badge}</AvatarBadge>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    zIndex: 1,
    elevation: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    zIndex: 2,
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
