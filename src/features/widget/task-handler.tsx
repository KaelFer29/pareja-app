import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { LATEST_PHOTO_WIDGET } from './latest-photo-widget';
import { renderLatestPhotoWidget } from './render';

export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (widgetInfo.widgetName !== LATEST_PHOTO_WIDGET) return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(await renderLatestPhotoWidget(widgetInfo));
      break;
    default:
      break;
  }
}
