import type { CameraRef, InitialViewState } from '@maplibre/maplibre-react-native';
import { Heart, MapPinOff } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/shared/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { getKnownLocation } from '../location';
import { MAP_STYLE, mapLibre } from '../native';
import type { Coordinates } from '../types';

export type MapPoint = Coordinates & {
  id: string;
  name: string;
};

type PlaceMapProps = {
  points: MapPoint[];
  onPressPoint?: (id: string) => void;
  onLongPress?: (coordinates: Coordinates) => void;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
};

const WORLD: InitialViewState = { center: [-60, -20], zoom: 1.6 };

function initialView(points: MapPoint[]): InitialViewState {
  if (points.length === 0) return WORLD;
  if (points.length === 1) {
    return { center: [points[0].longitude, points[0].latitude], zoom: 14 };
  }
  const longitudes = points.map((point) => point.longitude);
  const latitudes = points.map((point) => point.latitude);
  return {
    bounds: [
      Math.min(...longitudes),
      Math.min(...latitudes),
      Math.max(...longitudes),
      Math.max(...latitudes),
    ],
    padding: { top: 60, bottom: 60, left: 50, right: 50 },
  };
}

export function PlaceMap({
  points,
  onPressPoint,
  onLongPress,
  interactive = true,
  style,
}: PlaceMapProps) {
  const camera = useRef<CameraRef>(null);
  const isEmpty = points.length === 0;

  useEffect(() => {
    if (!isEmpty || !interactive) return;
    getKnownLocation()
      .then((location) => {
        if (location) {
          camera.current?.flyTo({ center: [location.longitude, location.latitude], zoom: 12 });
        }
      })
      .catch(() => undefined);
  }, [isEmpty, interactive]);

  if (!mapLibre) {
    return (
      <View style={[styles.frame, styles.unavailable, style]}>
        <Icon icon={MapPinOff} size={28} color={colors.textMuted} />
        <Text variant="caption" tone="muted" align="center">
          El mapa funciona en la app instalada, no en Expo Go.
        </Text>
      </View>
    );
  }

  const { Camera, Map, Marker } = mapLibre;

  return (
    <View style={[styles.frame, style]}>
      <Map
        mapStyle={MAP_STYLE}
        androidView="texture"
        logo={false}
        compass={false}
        dragPan={interactive}
        touchZoom={interactive}
        doubleTapZoom={interactive}
        touchRotate={false}
        touchPitch={false}
        onLongPress={
          onLongPress
            ? (event) => {
                const [longitude, latitude] = event.nativeEvent.lngLat;
                onLongPress({ latitude, longitude });
              }
            : undefined
        }
      >
        <Camera ref={camera} initialViewState={initialView(points)} />
        {points.map((point) => (
          <Marker
            key={point.id}
            id={point.id}
            lngLat={[point.longitude, point.latitude]}
            anchor="bottom"
            onPress={onPressPoint ? () => onPressPoint(point.id) : undefined}
          >
            <View style={styles.pin} accessibilityLabel={point.name}>
              <View style={styles.pinHead}>
                <Icon icon={Heart} size={14} color={colors.primaryText} fill={colors.primaryText} />
              </View>
              <View style={styles.pinTip} />
            </View>
          </Marker>
        ))}
      </Map>
    </View>
  );
}

const PIN = 30;

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  unavailable: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  pin: {
    alignItems: 'center',
  },
  pinHead: {
    width: PIN,
    height: PIN,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  pinTip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
});
