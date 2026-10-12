import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';
import { formatDayWithoutYear, formatMonthShort } from '@/shared/utils/date';
import { formatDaysLeft, formatYears } from '@/shared/utils/occurrence';

import type { WidgetNextDate } from './types';
import { color, WIDGET_RADIUS, WidgetRowMessage } from './widget-ui';

type NextDateWidgetProps = {
  next: WidgetNextDate | null;
  height: number;
};

export function NextDateWidget({ next, height }: NextDateWidgetProps) {
  const slim = height < 90;
  const badge = slim ? 34 : 42;
  if (!next) {
    return (
      <WidgetRowMessage
        title="Sin fechas próximas"
        description="Agrega fechas importantes en Pareja."
      />
    );
  }

  const isToday = next.daysLeft === 0;
  const isSoon = next.daysLeft <= 7;
  const years = formatYears(next.years);
  const subtitle = [formatDayWithoutYear(next.date), years].filter(Boolean).join(' · ');

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `pareja://dates/${next.id}` }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: slim ? 8 : 12,
        borderRadius: slim ? Math.min(height / 2, 32) : WIDGET_RADIUS,
        backgroundColor: color(colors.surface),
      }}
    >
      <FlexWidget
        style={{
          width: badge,
          height: badge,
          borderRadius: slim ? badge / 2 : 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color(isToday ? colors.primary : colors.accentSoft),
        }}
      >
        <TextWidget
          text={formatMonthShort(next.date)}
          style={{
            fontSize: slim ? 8 : 9,
            fontFamily: fonts.bold,
            color: color(isToday ? colors.primaryText : colors.primary),
          }}
        />
        <TextWidget
          text={String(next.date.getDate())}
          style={{
            fontSize: slim ? 14 : 17,
            fontFamily: fonts.extrabold,
            color: color(isToday ? colors.primaryText : colors.accent),
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
        <TextWidget
          text={next.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 14, fontFamily: fonts.bold, color: color(colors.text) }}
        />
        <TextWidget
          text={subtitle}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 12, fontFamily: fonts.semibold, color: color(colors.textMuted) }}
        />
      </FlexWidget>
      <FlexWidget
        style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: color(isSoon ? colors.primary : colors.primarySoft),
        }}
      >
        <TextWidget
          text={formatDaysLeft(next.daysLeft)}
          style={{
            fontSize: 12,
            fontFamily: fonts.bold,
            color: color(isSoon ? colors.primaryText : colors.primary),
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
