import { Heart } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, shadows } from '@/shared/theme';
import { Avatar } from '@/shared/ui/avatar';
import { Icon } from '@/shared/ui/icon';

type Person = {
  name: string;
  avatarPath: string | null | undefined;
};

type CoupleAvatarsProps = {
  me: Person;
  partner: Person;
  size?: number;
};

export function CoupleAvatars({ me, partner, size = 56 }: CoupleAvatarsProps) {
  const overlap = size * 0.22;
  const badge = Math.round(size * 0.42);

  return (
    <View style={styles.container}>
      <View style={shadows.card}>
        <Avatar path={me.avatarPath} name={me.name} size={size} ringColor={colors.surface} />
      </View>
      <View style={[styles.badge, { width: badge, height: badge, marginHorizontal: -overlap }]}>
        <Icon icon={Heart} size={badge * 0.5} color={colors.primary} fill={colors.primary} />
      </View>
      <View style={shadows.card}>
        <Avatar
          path={partner.avatarPath}
          name={partner.name}
          size={size}
          ringColor={colors.surface}
        />
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
});
