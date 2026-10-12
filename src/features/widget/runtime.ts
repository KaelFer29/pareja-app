import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { WIDGET_NAMES } from './names';
import { widgetRenderers } from './render';
import { widgetTaskHandler } from './task-handler';

export function registerWidgets() {
  registerWidgetTaskHandler(widgetTaskHandler);
}

export function refreshWidgets() {
  return Promise.all(
    Object.values(WIDGET_NAMES).map((widgetName) =>
      requestWidgetUpdate({ widgetName, renderWidget: widgetRenderers[widgetName] }),
    ),
  );
}
