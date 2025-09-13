import { InjectionToken } from '@angular/core'

import { TheSeamOverlayScrollbarsConfig } from './overlay-scrollbars-config-model'

export const _OverlayScrollbarDefaults: TheSeamOverlayScrollbarsConfig = {
  className: 'os-theme-dark os-theme-no-hover',
  sizeAutoCapable: false,
  paddingAbsolute: true,
  autoUpdate: true,
}

export function mergeOverlayScrollbarsConfigs(a: TheSeamOverlayScrollbarsConfig, b: TheSeamOverlayScrollbarsConfig) {
  return { ...a, ...b }
}

/** Injection token that can be used to specify overlayscrollbars options. */
export const THESEAM_OVERLAY_SCROLLBARS_CONFIG = new InjectionToken<TheSeamOverlayScrollbarsConfig>(
  'seamOverlayScrollbarsConfig',
  {
    providedIn: 'root',
    factory: () => {
      return _OverlayScrollbarDefaults
    },
  },
)
