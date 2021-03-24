import { InjectionToken } from '@angular/core'

import { IWidgetRegistryRecord } from './widget-registry.models'

export const THESEAM_WIDGETS = new InjectionToken<IWidgetRegistryRecord>('TheSeamWidgets')
