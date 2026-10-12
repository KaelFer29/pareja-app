import { registerWidgetTaskHandler, requestWidgetUpdate } from 'react-native-android-widget';

import { LATEST_PHOTO_WIDGET } from './latest-photo-widget';
import { renderLatestPhotoWidget } from './render';
import { widgetTaskHandler } from './task-handler';

export function registerWidgets() {
  registerWidgetTaskHandler(widgetTaskHandler);
}

export function refreshLatestPhotoWidget() {
  return requestWidgetUpdate({
    widgetName: LATEST_PHOTO_WIDGET,
    renderWidget: renderLatestPhotoWidget,
  });
}
