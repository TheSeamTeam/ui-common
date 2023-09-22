import { InjectionToken } from '@angular/core'

import { IWidgetRegistryRecord } from './widget-registry.models'
import { TheSeamWidgetData, TheSeamWidgetDefaults } from './widget.models'

export const THESEAM_WIDGETS = new InjectionToken<IWidgetRegistryRecord>('TheSeamWidgets')

export const THESEAM_WIDGET_DATA = new InjectionToken<TheSeamWidgetData>('TheSeamWidgetData')

export const THESEAM_WIDGET_DEFAULTS = new InjectionToken<TheSeamWidgetDefaults>('TheSeamWidgetDefaults')
