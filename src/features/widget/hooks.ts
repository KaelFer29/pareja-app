import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { LATEST_PHOTO_WIDGET } from './latest-photo-widget';
import { renderLatestPhotoWidget } from './render';

function refreshLatestPhotoWidget() {
  if (Platform.OS !== 'android') return;
  requestWidgetUpdate({
    widgetName: LATEST_PHOTO_WIDGET,
    renderWidget: renderLatestPhotoWidget,
  }).catch(() => undefined);
}

export function useLatestPhotoWidgetSync(latestPhotoId: string | null) {
  useEffect(() => {
    refreshLatestPhotoWidget();
  }, [latestPhotoId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') refreshLatestPhotoWidget();
    });
    return () => subscription.remove();
  }, []);
}
