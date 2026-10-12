import Constants, { ExecutionEnvironment } from 'expo-constants';

type MapLibreModule = typeof import('@maplibre/maplibre-react-native');

const isMapAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

export const mapLibre: MapLibreModule | null = isMapAvailable
  ? require('@maplibre/maplibre-react-native')
  : null;

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
