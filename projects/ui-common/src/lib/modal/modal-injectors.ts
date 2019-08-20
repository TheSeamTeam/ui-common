import {
  ComponentType,
  Overlay,
  ScrollStrategy,
} from '@angular/cdk/overlay'
import { InjectionToken } from '@angular/core'

import { ModalConfig } from './modal-config'
import { ModalContainerComponent } from './modal-container/modal-container.component'
import { ModalRef } from './modal-ref'

/** Injection token for the Dialog's ScrollStrategy. */
export const MODAL_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('ModalScrollStrategy')

/** Injection token for the Dialog's Data. */
export const MODAL_DATA = new InjectionToken<any>('ModalData')

/** Injection token for the DialogRef constructor. */
export const MODAL_REF = new InjectionToken<ModalRef<any>>('ModalRef')

/** Injection token for the DialogConfig. */
export const MODAL_CONFIG = new InjectionToken<ModalConfig>('ModalConfig')

/** Injection token for the Dialog's DialogContainer component. */
export const MODAL_CONTAINER =
    new InjectionToken<ComponentType<ModalContainerComponent>>('ModalContainer')

/** @docs-private */
export function THESEAM_MODAL_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => ScrollStrategy {
  return () => overlay.scrollStrategies.block()
}

/** @docs-private */
export const THESEAM_MODAL_SCROLL_STRATEGY_PROVIDER = {
  provide: MODAL_SCROLL_STRATEGY,
  deps: [ Overlay ],
  useFactory: THESEAM_MODAL_SCROLL_STRATEGY_PROVIDER_FACTORY,
}
