import { InjectionToken } from '@angular/core'

import { IOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

export const _OverlayScrollbarDefaults: IOverlayScrollbarsConfig = {
  className: 'os-theme-dark os-theme-no-hover',
  sizeAutoCapable: false,
  paddingAbsolute: true,
  autoUpdate: true
}

export function mergeOverlayScrollbarsConfigs(a: IOverlayScrollbarsConfig, b: IOverlayScrollbarsConfig) {
  return { ...a, ...b }
}

/** Injection token that can be used to specify overlayscrollbars options. */
export const LIB_OVERLAY_SCROLLBARS_CONFIG = new InjectionToken<IOverlayScrollbarsConfig>('seamOverlayScrollbarsConfig')
