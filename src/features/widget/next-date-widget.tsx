import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';
import { formatDayWithoutYear, formatMonthShort } from '@/shared/utils/date';
import { formatDaysLeft, formatYears } from '@/shared/utils/occurrence';

import type { WidgetNextDate } from './types';
import { color, WIDGET_RADIUS, WidgetMessage } from './widget-ui';

type NextDateWidgetProps = {
  next: WidgetNextDate | null;
};

export function NextDateWidget({ next }: NextDateWidgetProps) {
  if (!next) {
    return (
      <WidgetMessage
        title="Sin fechas próximas"
        description="Agrega aniversarios y cumpleaños en Pareja."
      />
    );
  }

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
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: WIDGET_RADIUS,
        backgroundColor: color(colors.surface),
      }}
    >
      <FlexWidget
        style={{
          width: 52,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color(next.daysLeft === 0 ? colors.primary : colors.accentSoft),
        }}
      >
        <TextWidget
          text={formatMonthShort(next.date)}
          style={{
            fontSize: 10,
            fontFamily: fonts.bold,
            color: color(next.daysLeft === 0 ? colors.primaryText : colors.primary),
          }}
        />
        <TextWidget
          text={String(next.date.getDate())}
          style={{
            fontSize: 22,
            fontFamily: fonts.extrabold,
            color: color(next.daysLeft === 0 ? colors.primaryText : colors.accent),
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <TextWidget
          text="PRÓXIMA FECHA"
          style={{
            fontSize: 10,
            fontFamily: fonts.bold,
            letterSpacing: 0.1,
            color: color(colors.textMuted),
          }}
        />
        <TextWidget
          text={next.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 15, fontFamily: fonts.bold, color: color(colors.text) }}
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
