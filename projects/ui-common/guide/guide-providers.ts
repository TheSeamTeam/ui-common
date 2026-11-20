import {
  EnvironmentProviders,
  InjectionToken,
  makeEnvironmentProviders,
  Type,
} from '@angular/core'

import {
  THE_SEAM_GUIDE_ADAPTER,
  TheSeamGuideAdapter,
} from './adapter/guide-adapter'
import { DriverJsGuideAdapter } from './adapter/driver-js/driver-js-guide.adapter'
import { TheSeamGuidePopover } from './models/guide-step'

/**
 * Application-wide popover defaults — the outermost of the three content
 * layers. Always provided by {@link provideTheSeamGuide}, defaulting to `{}`.
 */
export const THE_SEAM_GUIDE_POPOVER_DEFAULTS =
  new InjectionToken<TheSeamGuidePopover>('THE_SEAM_GUIDE_POPOVER_DEFAULTS')

export interface TheSeamGuideProviderOptions {
  /** Replace the presentation engine. Defaults to the driver.js adapter. */
  adapter?: Type<TheSeamGuideAdapter>

  /**
   * Popover defaults for every guide in the application. This layer decorates
   * slots that a guide or a step supplies; it never creates one.
   */
  popover?: TheSeamGuidePopover
}

/**
 * Wires the guide's presentation engine.
 *
 * The engine is named only here — no consumer imports driver.js — so replacing
 * it is a change to this call, not to application code.
 */
export function provideTheSeamGuide(
  options: TheSeamGuideProviderOptions = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: THE_SEAM_GUIDE_ADAPTER,
      useClass: options.adapter ?? DriverJsGuideAdapter,
    },
    {
      provide: THE_SEAM_GUIDE_POPOVER_DEFAULTS,
      useValue: options.popover ?? {},
    },
  ])
}
