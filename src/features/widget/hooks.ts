import { useEffect } from 'react';
import { AppState } from 'react-native';

import { widgetRuntime } from './native';

function refreshWidgets() {
  widgetRuntime?.refreshWidgets().catch(() => undefined);
}

export function useWidgetsSync(signature: string) {
  useEffect(() => {
    refreshWidgets();
  }, [signature]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background') refreshWidgets();
    });
    return () => subscription.remove();
  }, []);
}
