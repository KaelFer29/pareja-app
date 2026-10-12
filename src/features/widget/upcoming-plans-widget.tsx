import { FlexWidget, TextWidget } from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';
import { formatMonthShort, formatTime } from '@/shared/utils/date';
import { formatYears } from '@/shared/utils/occurrence';

import type { WidgetAgendaItem } from './types';
import { color, HeartsMark, WIDGET_RADIUS, WidgetRowMessage } from './widget-ui';

export const PLAN_ROW_HEIGHT = 46;
export const PLANS_HEADER_HEIGHT = 48;

type UpcomingPlansWidgetProps = {
  items: WidgetAgendaItem[];
};

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function dayLabel(item: WidgetAgendaItem) {
  if (item.daysLeft === 0) return 'Hoy';
  if (item.daysLeft === 1) return 'Mañana';
  return `${WEEKDAYS[item.date.getDay()]} ${item.date.getDate()}`;
}

function detailLabel(item: WidgetAgendaItem) {
  if (item.kind === 'special') return formatYears(item.years) ?? 'Fecha importante';
  if (item.outingStreak) return `🔥 Racha de ${item.outingStreak} días`;
  if (!item.startTime) return 'Todo el día';
  return item.endTime
    ? `${formatTime(item.startTime)} a ${formatTime(item.endTime)}`
    : formatTime(item.startTime);
}

function PlanRow({ item }: { item: WidgetAgendaItem }) {
  const isToday = item.daysLeft === 0;
  const isSpecial = item.kind === 'special';
  const uri = isSpecial ? `pareja://dates/${item.id}` : `pareja://calendar/${item.id}`;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri }}
      style={{
        height: PLAN_ROW_HEIGHT,
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <FlexWidget
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color(
            isToday ? colors.primary : isSpecial ? colors.accentSoft : colors.primarySoft,
          ),
        }}
      >
        <TextWidget
          text={formatMonthShort(item.date)}
          style={{
            fontSize: 8,
            fontFamily: fonts.bold,
            color: color(isToday ? colors.primaryText : colors.primary),
          }}
        />
        <TextWidget
          text={String(item.date.getDate())}
          style={{
            fontSize: 15,
            fontFamily: fonts.extrabold,
            color: color(isToday ? colors.primaryText : isSpecial ? colors.accent : colors.text),
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 1, marginLeft: 10 }}>
        <TextWidget
          text={item.title}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, fontFamily: fonts.bold, color: color(colors.text) }}
        />
        <TextWidget
          text={`${dayLabel(item)} · ${detailLabel(item)}`}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 11, fontFamily: fonts.semibold, color: color(colors.textMuted) }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

export function UpcomingPlansWidget({ items }: UpcomingPlansWidgetProps) {
  if (items.length === 0) {
    return (
      <WidgetRowMessage
        title="Sin planes próximos"
        description="Agrega un plan en el calendario."
      />
    );
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: WIDGET_RADIUS,
        backgroundColor: color(colors.surface),
      }}
    >
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'pareja://calendar' }}
        style={{
          height: PLANS_HEADER_HEIGHT - 16,
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <HeartsMark size={22} cutColor={colors.surface} />
        <TextWidget
          text="Próximos planes"
          style={{
            marginLeft: 6,
            fontSize: 14,
            fontFamily: fonts.extrabold,
            color: color(colors.text),
          }}
        />
      </FlexWidget>
      {items.map((item) => (
        <PlanRow key={item.key} item={item} />
      ))}
    </FlexWidget>
  );
}
