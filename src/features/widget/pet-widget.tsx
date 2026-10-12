import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

import { PET_ART } from '@/shared/lib/pet-art';
import { colors, fonts } from '@/shared/theme';
import { MOOD_SHORT } from '@/shared/utils/pet';

import type { WidgetPet } from './types';
import { color, WIDGET_RADIUS } from './widget-ui';

type PetWidgetProps = {
  pet: WidgetPet | null;
  width: number;
  height: number;
};

const background = {
  from: color(colors.primarySoft),
  to: color(colors.accentSoft),
  orientation: 'TL_BR',
} as const;

function StreakChip({ pet }: { pet: WidgetPet }) {
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: color(pet.caredToday ? colors.primary : colors.surface),
      }}
    >
      <TextWidget
        text={`🔥 ${pet.streak}`}
        style={{
          fontSize: 12,
          fontFamily: fonts.bold,
          color: color(pet.caredToday ? colors.primaryText : colors.textMuted),
        }}
      />
    </FlexWidget>
  );
}

function PetImage({ pet, size }: { pet: WidgetPet | null; size: number }) {
  return (
    <ImageWidget
      image={PET_ART[pet?.stage ?? 'baby'][pet?.mood ?? 'happy']}
      imageWidth={size}
      imageHeight={size}
    />
  );
}

export function PetWidget({ pet, width, height }: PetWidgetProps) {
  const wide = width >= 250 && width > height * 1.4;

  if (!pet) {
    const size = Math.max(48, Math.min(width - 24, height - 56));
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'pareja://pet' }}
        style={{
          height: 'match_parent',
          width: 'match_parent',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          borderRadius: WIDGET_RADIUS,
          backgroundGradient: background,
        }}
      >
        <PetImage pet={null} size={size} />
        <TextWidget
          text="Adopten un perrito"
          maxLines={1}
          truncate="END"
          style={{ marginTop: 4, fontSize: 13, fontFamily: fonts.bold, color: color(colors.text) }}
        />
      </FlexWidget>
    );
  }

  if (wide) {
    const size = Math.max(56, Math.min(height - 16, width * 0.45));
    return (
      <FlexWidget
        clickAction="OPEN_URI"
        clickActionData={{ uri: 'pareja://pet' }}
        style={{
          height: 'match_parent',
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          borderRadius: WIDGET_RADIUS,
          backgroundGradient: background,
        }}
      >
        <PetImage pet={pet} size={size} />
        <FlexWidget style={{ flex: 1, marginLeft: 10 }}>
          <TextWidget
            text={pet.name}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 18, fontFamily: fonts.extrabold, color: color(colors.text) }}
          />
          <TextWidget
            text={MOOD_SHORT[pet.mood]}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 13, fontFamily: fonts.semibold, color: color(colors.textMuted) }}
          />
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <StreakChip pet={pet} />
            <TextWidget
              text={`Nivel ${pet.level}`}
              style={{
                marginLeft: 8,
                fontSize: 12,
                fontFamily: fonts.bold,
                color: color(colors.accent),
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    );
  }

  const size = Math.max(48, Math.min(width - 20, height - 64));
  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'pareja://pet' }}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: WIDGET_RADIUS,
        backgroundGradient: background,
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
          text={pet.name}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 14, fontFamily: fonts.extrabold, color: color(colors.text) }}
        />
        <StreakChip pet={pet} />
      </FlexWidget>
      <PetImage pet={pet} size={size} />
      <TextWidget
        text={MOOD_SHORT[pet.mood]}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 12, fontFamily: fonts.semibold, color: color(colors.textMuted) }}
      />
    </FlexWidget>
  );
}
