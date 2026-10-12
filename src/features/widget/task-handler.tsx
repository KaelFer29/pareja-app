import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import { isWidgetName, widgetRenderers } from './render';

export async function widgetTaskHandler({
  widgetInfo,
  widgetAction,
  renderWidget,
}: WidgetTaskHandlerProps) {
  if (!isWidgetName(widgetInfo.widgetName)) return;

  switch (widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      renderWidget(await widgetRenderers[widgetInfo.widgetName](widgetInfo));
      break;
    default:
      break;
  }
}
