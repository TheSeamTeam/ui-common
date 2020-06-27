import { animate, AnimationEvent, state, style, transition, trigger } from '@angular/animations'
import { FocusTrapFactory } from '@angular/cdk/a11y'
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  HostListener,
  Inject,
  OnDestroy,
  Optional,
  ViewChild
} from '@angular/core'
import { Subject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

import { ModalConfig } from '../modal-config'

export function throwDialogContentAlreadyAttachedError() {
  throw Error('Attempting to attach dialog content after content is already attached')
}

/**
 * Internal component that wraps user-provided dialog content.
 * @docs-private
 */
@Component({
  selector: 'seam-modal-container',
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss'],
  animations: [
    trigger('dialog', [
      state('enter', style({opacity: 1})),
      state('exit, void', style({opacity: 0})),
      transition('* => enter', animate('{{enterAnimationDuration}}')),
      transition('* => exit, * => void', animate('{{exitAnimationDuration}}')),
    ])
  ],
  // tslint:disable:use-host-property-decorator
  host: {
    '[@dialog]': `{
      value: _state,
      params: {
        enterAnimationDuration: _config.enterAnimationDuration,
        exitAnimationDuration: _config.exitAnimationDuration
      }
    }`,
    '(@dialog.start)': '_onAnimationStart($event)',
    '(@dialog.done)': '_animationDone.next($event)',
  },
  // tslint:enable:use-host-property-decorator
})
export class ModalContainerComponent extends BasePortalOutlet implements OnDestroy {

  @HostBinding('attr.id') get _idAttr() { return this._id }

  // @HostBinding is used in the class as it is expected to be extended.  Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable:no-host-decorator-in-concrete
  @HostBinding('attr.aria-label') get _ariaLabel() { return this._config.ariaLabel || null }

  @HostBinding('attr.aria-describedby')
  get _ariaDescribedBy() { return this._config.ariaDescribedBy }

  @HostBinding('attr.role') get _role() { return this._config.role }

  // @HostBinding('attr.tabindex') get _tabindex() { return -1 }

  @HostBinding('class.seam-modal-container') _seamModalContainer = true

  _id: string

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _focusTrapFactory: FocusTrapFactory,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(DOCUMENT) private _document: any,
    /** The dialog configuration. */
    public _config: ModalConfig) {
    super()

    // We use a Subject with a distinctUntilChanged, rather than a callback attached to .done,
    // because some browsers fire the done event twice and we don't want to emit duplicate events.
    // See: https://github.com/angular/angular/issues/24084
    this._animationDone.pipe(distinctUntilChanged((x, y) => {
      return x.fromState === y.fromState && x.toState === y.toState
    })).subscribe(event => {
      // Emit lifecycle events based on animation `done` callback.
      if (event.toState === 'enter') {
        this._autoFocusFirstTabbableElement()
        this._afterEnter.next()
        this._afterEnter.complete()
      }

      if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
        this._returnFocusAfterDialog()
        this._afterExit.next()
        this._afterExit.complete()
      }
    })
  }

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'exit' = 'enter'

  /** Element that was focused before the dialog was opened. Save this to restore upon close. */
  private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null

   /** The class that traps and manages focus within the dialog. */
  private _focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement, false)
  // tslint:disable:no-host-decorator-in-concrete

  @HostBinding('class.modal-dialog') _modalDialog = true
  @HostBinding('class.modal-dialog-centered') _modalDialogCentered = true

  @HostBinding('class.modal-sm') get _modalDialogSm() { return this._config.modalSize === 'sm' }
  @HostBinding('class.modal-lg') get _modalDialogLg() { return this._config.modalSize === 'lg' }
  @HostBinding('class.modal-xl') get _modalDialogXl() { return this._config.modalSize === 'xl' }

  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(CdkPortalOutlet /*, { static: true }*/, { static: true }) _portalHost: CdkPortalOutlet

  /** A subject emitting before the dialog enters the view. */
  _beforeEnter: Subject<void> = new Subject()

  /** A subject emitting after the dialog enters the view. */
  _afterEnter: Subject<void> = new Subject()

  /** A subject emitting before the dialog exits the view. */
  _beforeExit: Subject<void> = new Subject()

  /** A subject emitting after the dialog exits the view. */
  _afterExit: Subject<void> = new Subject()

  /** Stream of animation `done` events. */
  _animationDone = new Subject<AnimationEvent>()

  // NOTE: For current bootstrap style modal
  @HostListener('click', [ '$event' ])
  _onClick(event) {
    event.stopPropagation()
  }

  /** Destroy focus trap to place focus back to the element focused before the dialog opened. */
  ngOnDestroy() {
    this._focusTrap.destroy()
    this._animationDone.complete()
  }

  /**
   * Attach a ComponentPortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throwDialogContentAlreadyAttachedError()
    }

    this._savePreviouslyFocusedElement()
    return this._portalHost.attachComponentPortal(portal)
  }

  /**
   * Attach a TemplatePortal as content to this dialog container.
   * @param portal Portal to be attached as the dialog content.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalHost.hasAttached()) {
      throwDialogContentAlreadyAttachedError()
    }

    this._savePreviouslyFocusedElement()
    return this._portalHost.attachTemplatePortal(portal)
  }

  /** Emit lifecycle events based on animation `start` callback. */
  _onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._beforeEnter.next()
      this._beforeEnter.complete()
    }
    if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
      this._beforeExit.next()
      this._beforeExit.complete()
    }
  }

  /** Starts the dialog exit animation. */
  _startExiting(): void {
    this._state = 'exit'

    // Mark the container for check so it can react if the
    // view container is using OnPush change detection.
    this._changeDetectorRef.markForCheck()
  }

  /** Saves a reference to the element that was focused before the dialog was opened. */
  private _savePreviouslyFocusedElement() {
    if (this._document) {
      this._elementFocusedBeforeDialogWasOpened = this._document.activeElement as HTMLElement

      // Move focus onto the dialog immediately in order to prevent the user from accidentally
      // opening multiple dialogs at the same time. Needs to be async, because the element
      // may not be focusable immediately.
      Promise.resolve().then(() => this._elementRef.nativeElement.focus())
    }
  }

  /**
   * Autofocus the first tabbable element inside of the dialog, if there is not a tabbable element,
   * focus the dialog instead.
   */
  private _autoFocusFirstTabbableElement() {
    // If were to attempt to focus immediately, then the content of the dialog would not yet be
    // ready in instances where change detection has to run first. To deal with this, we simply
    // wait for the microtask queue to be empty.
    if (this._config.autoFocus) {
      this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
        // If we didn't find any focusable elements inside the dialog, focus the
        // container so the user can't tab into other elements behind it.
        if (!hasMovedFocus) {
          this._elementRef.nativeElement.focus()
        }
      })
    }
  }

  /** Returns the focus to the element focused before the dialog was open. */
  private _returnFocusAfterDialog() {
    const toFocus = this._elementFocusedBeforeDialogWasOpened
    // We need the extra check, because IE can set the `activeElement` to null in some cases.
    if (toFocus && typeof toFocus.focus === 'function') {
      toFocus.focus()
    }
  }

}
