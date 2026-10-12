import { FlexWidget, SvgWidget, TextWidget, type ColorProp } from 'react-native-android-widget';

import { colors, fonts } from '@/shared/theme';

export function color(value: string) {
  return value as ColorProp;
}

export const WIDGET_RADIUS = 24;

const HEART =
  'M50 90 C47 88 6 63 6 33 C6 18 17 7 31 7 C39 7 46 11 50 18 C54 11 61 7 69 7 C83 7 94 18 94 33 C94 63 53 88 50 90 Z';

function heart(cx: number, cy: number, rotate: number, attributes: string) {
  return `<path d="${HEART}" transform="translate(${cx} ${cy}) rotate(${rotate}) scale(0.9) translate(-50 -48)" ${attributes}/>`;
}

export function heartsSvg(cutColor: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">${heart(
    58,
    56,
    -14,
    `fill="${colors.accent}"`,
  )}${heart(
    102,
    64,
    14,
    `fill="${colors.primary}" stroke="${cutColor}" stroke-width="10" stroke-linejoin="round"`,
  )}</svg>`;
}

export function HeartsMark({ size, cutColor }: { size: number; cutColor: string }) {
  return <SvgWidget svg={heartsSvg(cutColor)} style={{ width: size, height: size * 0.75 }} />;
}

type WidgetMessageProps = {
  title: string;
  description: string;
};

export function WidgetMessage({ title, description }: WidgetMessageProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: WIDGET_RADIUS,
        backgroundGradient: {
          from: color(colors.primarySoft),
          to: color(colors.accentSoft),
          orientation: 'TL_BR',
        },
      }}
    >
      <HeartsMark size={44} cutColor={colors.primarySoft} />
      <TextWidget
        text={title}
        maxLines={2}
        truncate="END"
        style={{
          marginTop: 10,
          fontSize: 14,
          fontFamily: fonts.bold,
          color: color(colors.text),
          textAlign: 'center',
        }}
      />
      <TextWidget
        text={description}
        maxLines={2}
        truncate="END"
        style={{
          marginTop: 2,
          fontSize: 12,
          fontFamily: fonts.semibold,
          color: color(colors.textMuted),
          textAlign: 'center',
        }}
      />
    </FlexWidget>
  );
}
