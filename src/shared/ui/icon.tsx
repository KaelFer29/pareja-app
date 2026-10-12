import type { LucideIcon } from 'lucide-react-native';
import type { ColorValue } from 'react-native';

import { colors } from '@/shared/theme';

type IconProps = {
  icon: LucideIcon;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
  fill?: string;
};

export function Icon({
  icon: Component,
  size = 22,
  color = colors.text,
  strokeWidth = 1.9,
  fill = 'none',
}: IconProps) {
  return <Component size={size} color={color} strokeWidth={strokeWidth} fill={fill} />;
}
