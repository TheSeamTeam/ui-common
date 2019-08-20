import { Direction } from '@angular/cdk/bidi'
import { ComponentType } from '@angular/cdk/overlay'
import { InjectionToken, ViewContainerRef } from '@angular/core'

import { ModalContainerComponent } from './modal-container/modal-container.component'

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog'

/** Possible overrides for a dialog's position. */
export interface IModalPosition {
  top?: string
  bottom?: string
  left?: string
  right?: string
}

// tslint:disable:no-inferrable-types
export class ModalConfig<D = any> {
  /** Component to use as the container for the dialog. */
  containerComponent?: ComponentType<ModalContainerComponent>

  /**
   * Where the attached component should live in Angular's *logical* component tree.
   * This affects what is available for injection and the change detection order for the
   * component instantiated inside of the dialog. This does not affect where the dialog
   * content will be rendered.
   */
  viewContainerRef?: ViewContainerRef

  /** The id of the dialog. */
  id?: string

  /** The ARIA role of the dialog. */
  role?: DialogRole = 'dialog'

  /** Custom class(es) for the overlay panel. */
  panelClass?: string | string[] = ''

  /** Whether the dialog has a background. */
  hasBackdrop?: boolean = true

  /** Custom class(es) for the backdrop. */
  backdropClass?: string | undefined = ''

  /** Whether the dialog can be closed by user interaction. */
  disableClose?: boolean = false

  /** The width of the dialog. */
  width?: string = '100%'

  /** The height of the dialog. */
  height?: string = ''

  /** The minimum width of the dialog. */
  minWidth?: string | number = ''

  /** The minimum height of the dialog. */
  minHeight?: string | number = ''

  /** The maximum width of the dialog. */
  maxWidth?: string | number = ''

  /** The maximum height of the dialog. */
  maxHeight?: string | number = ''

  /** The position of the dialog. */
  position?: IModalPosition

  /** Data to be injected into the dialog content. */
  data?: D | null = null

  /** The layout direction for the dialog content. */
  direction?: Direction

  /** ID of the element that describes the dialog. */
  ariaDescribedBy?: string | null = null

  /** Aria label to assign to the dialog element */
  ariaLabel?: string | null = null

  /** Whether the dialog should focus the first focusable element on open. */
  autoFocus?: boolean = true

  /** Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms). */
  enterAnimationDuration?: string = '225ms'

  /** Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms). */
  exitAnimationDuration?: string = '225ms'

  /** Bootstrap modal sizes */
  modalSize?: 'sm' | 'lg' | 'xl'
}
// tslint:enable:no-inferrable-types

export function mergeModalConfigs(a: ModalConfig, b: ModalConfig) {
  return { ...a, ...b }
}


/** Injection token that can be used to specify modal options. */
export const LIB_MODAL_CONFIG = new InjectionToken<ModalConfig>('seamModalConfig')
