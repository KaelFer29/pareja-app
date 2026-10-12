import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';
import { daysBetween, parseDay, startOfToday } from '@/shared/utils/date';

import type { WidgetCouple } from './types';
import { color, HeartsMark, WIDGET_RADIUS, WidgetMessage } from './widget-ui';

type DaysTogetherWidgetProps = {
  couple: WidgetCouple | null;
  width: number;
};

export function DaysTogetherWidget({ couple, width }: DaysTogetherWidgetProps) {
  if (!couple) {
    return <WidgetMessage title="Pareja" description="Inicia sesión para ver sus días juntos." />;
  }

  if (!couple.startedOn) {
    return (
      <WidgetMessage title="¿Desde cuándo están juntos?" description="Elige la fecha en Pareja." />
    );
  }

  const days = daysBetween(parseDay(couple.startedOn), startOfToday());
  const numberSize = Math.max(30, Math.min(52, Math.round(width * 0.28)));

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        padding: 14,
        justifyContent: 'space-between',
        borderRadius: WIDGET_RADIUS,
        backgroundGradient: {
          from: color(colors.primarySoft),
          to: color(colors.accentSoft),
          orientation: 'TL_BR',
        },
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TextWidget
          text="JUNTOS"
          style={{
            fontSize: 11,
            fontFamily: fonts.bold,
            letterSpacing: 0.1,
            color: color(colors.textMuted),
          }}
        />
        <HeartsMark size={30} cutColor={colors.primarySoft} />
      </FlexWidget>
      <FlexWidget style={{ width: 'match_parent' }}>
        <TextWidget
          text={days.toLocaleString('es')}
          maxLines={1}
          style={{
            fontSize: numberSize,
            fontFamily: fonts.extrabold,
            color: color(colors.accent),
          }}
        />
        <TextWidget
          text={days === 1 ? 'día juntos' : 'días juntos'}
          style={{ fontSize: 14, fontFamily: fonts.bold, color: color(colors.primary) }}
        />
      </FlexWidget>
      <TextWidget
        text={`${couple.myName} y ${couple.partnerName}`}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 12, fontFamily: fonts.semibold, color: color(colors.textMuted) }}
      />
    </FlexWidget>
  );
}
