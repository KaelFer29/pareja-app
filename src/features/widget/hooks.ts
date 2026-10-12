import { useEffect } from 'react';
import { AppState } from 'react-native';

import { widgetRuntime } from './native';

function refreshLatestPhotoWidget() {
  widgetRuntime?.refreshLatestPhotoWidget().catch(() => undefined);
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
