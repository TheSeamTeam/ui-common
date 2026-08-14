import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  Type,
} from '@angular/core'

import {
  THE_SEAM_GUIDE_ADAPTER,
  TheSeamGuideAdapter,
} from './adapter/guide-adapter'
import { DriverJsGuideAdapter } from './adapter/driver-js/driver-js-guide.adapter'

export interface TheSeamGuideProviderOptions {
  /** Replace the presentation engine. Defaults to the driver.js adapter. */
  adapter?: Type<TheSeamGuideAdapter>
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
  ])
}
