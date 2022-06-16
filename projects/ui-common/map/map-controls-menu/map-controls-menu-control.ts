import { ComponentType } from '@angular/cdk/portal'
import { InjectionToken } from '@angular/core'

import { SeamIcon } from '@theseam/ui-common/icon'
import { hasProperty, isNullOrUndefined } from '@theseam/ui-common/utils'

export interface TheSeamMapControlMenuControlManifest {
  component: ComponentType<{}>
  name: string
  icon: SeamIcon
  label: string
  order?: number
}

export type TheSeamMapControlMenuControlIdentifierInput = string | ComponentType<{}>
export type TheSeamMapControlMenuControlInput = TheSeamMapControlMenuControlIdentifierInput | TheSeamMapControlMenuControlManifest

export const THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST = new InjectionToken<TheSeamMapControlMenuControlManifest>('THESEAM_MAP_CONTROL_MENU_CONTROL_MANIFEST')

export function isMapControlsMenuControlManifest(value: any): value is TheSeamMapControlMenuControlManifest {
  if (isNullOrUndefined(value)) {
    return false
  }

  return hasProperty(value, 'component') &&
    hasProperty(value, 'name') &&
    hasProperty(value, 'icon') &&
    hasProperty(value, 'label')
}

export function getManifestOrder(manifest: TheSeamMapControlMenuControlManifest): number {
  return (manifest.order === undefined) ? 0 : manifest.order
}
