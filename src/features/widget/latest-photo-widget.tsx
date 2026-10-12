import {
  FlexWidget,
  ImageWidget,
  OverlapWidget,
  SvgWidget,
  TextWidget,
} from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';
import { formatDayWithoutYear } from '@/shared/utils/date';

import type { WidgetPhoto } from './types';
import { color, heartsSvg, WIDGET_RADIUS, WidgetMessage } from './widget-ui';

type LatestPhotoWidgetProps = {
  photo: WidgetPhoto | null;
  width: number;
  height: number;
};

export function LatestPhotoWidget({ photo, width, height }: LatestPhotoWidgetProps) {
  const compact = Math.min(width, height) < 150;

  if (!photo) {
    return (
      <WidgetMessage
        title="Aún no hay fotos"
        description="Comparte la primera desde Pareja."
        compact={compact}
      />
    );
  }

  const caption = compact ? null : photo.caption;
  const badge = compact ? 24 : 30;
  const meta = [photo.authorName, formatDayWithoutYear(new Date(photo.createdAt))]
    .filter(Boolean)
    .join(' · ');

  return (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `pareja://photos/${photo.id}` }}
      style={{ height: 'match_parent', width: 'match_parent', borderRadius: WIDGET_RADIUS }}
    >
      <ImageWidget
        image={photo.url as `https:${string}`}
        imageWidth={width}
        imageHeight={height}
        resizeMode="cover"
        radius={WIDGET_RADIUS}
      />
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          justifyContent: 'space-between',
        }}
      >
        <FlexWidget
          style={{ width: 'match_parent', alignItems: 'flex-end', padding: compact ? 8 : 10 }}
        >
          <FlexWidget
            style={{
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: color(colors.surface),
            }}
          >
            <SvgWidget
              svg={heartsSvg(colors.surface)}
              style={{ width: badge * 0.72, height: badge * 0.56 }}
            />
          </FlexWidget>
        </FlexWidget>
        <FlexWidget
          style={{
            width: 'match_parent',
            paddingTop: compact ? 18 : 28,
            paddingBottom: compact ? 9 : 12,
            paddingHorizontal: compact ? 10 : 14,
            borderBottomLeftRadius: WIDGET_RADIUS,
            borderBottomRightRadius: WIDGET_RADIUS,
            backgroundGradient: {
              from: 'rgba(58, 42, 35, 0)',
              to: 'rgba(58, 42, 35, 0.72)',
              orientation: 'TOP_BOTTOM',
            },
          }}
        >
          {caption ? (
            <TextWidget
              text={caption}
              maxLines={2}
              truncate="END"
              style={{ fontSize: 14, fontFamily: fonts.bold, color: color(colors.primaryText) }}
            />
          ) : null}
          <TextWidget
            text={meta}
            maxLines={1}
            truncate="END"
            style={{
              marginTop: caption ? 2 : 0,
              fontSize: 11,
              fontFamily: fonts.semibold,
              color: 'rgba(255, 255, 255, 0.85)',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </OverlapWidget>
  );
}
