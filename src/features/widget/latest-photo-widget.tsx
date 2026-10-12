import { FlexWidget, ImageWidget, OverlapWidget, TextWidget } from 'react-native-android-widget';

import { colors, radius, spacing, typography } from '@/shared/theme';

import type { WidgetPhoto } from './types';

export const LATEST_PHOTO_WIDGET = 'LatestPhoto';

type LatestPhotoWidgetProps = {
  photo: WidgetPhoto | null;
  width: number;
  height: number;
};

export function LatestPhotoWidget({ photo, width, height }: LatestPhotoWidgetProps) {
  if (!photo) {
    return (
      <FlexWidget
        clickAction="OPEN_APP"
        style={{
          height: 'match_parent',
          width: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.md,
          backgroundColor: colors.background,
          borderRadius: radius.lg,
        }}
      >
        <TextWidget
          text="Aún no hay fotos. Abre Pareja y comparte la primera."
          style={{
            fontSize: typography.caption.fontSize,
            color: colors.textMuted,
            textAlign: 'center',
          }}
        />
      </FlexWidget>
    );
  }

  return (
    <OverlapWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: `pareja://photos/${photo.id}` }}
      style={{ height: 'match_parent', width: 'match_parent', borderRadius: radius.lg }}
    >
      <ImageWidget
        image={photo.url as `https:${string}`}
        imageWidth={width}
        imageHeight={height}
        resizeMode="cover"
        radius={radius.lg}
      />
      {photo.caption ? (
        <FlexWidget
          style={{
            height: 'match_parent',
            width: 'match_parent',
            justifyContent: 'flex-end',
          }}
        >
          <FlexWidget
            style={{
              width: 'match_parent',
              padding: spacing.sm,
              backgroundColor: colors.overlay,
              borderBottomLeftRadius: radius.lg,
              borderBottomRightRadius: radius.lg,
            }}
          >
            <TextWidget
              text={photo.caption}
              maxLines={2}
              truncate="END"
              style={{ fontSize: typography.caption.fontSize, color: colors.primaryText }}
            />
          </FlexWidget>
        </FlexWidget>
      ) : null}
    </OverlapWidget>
  );
}
