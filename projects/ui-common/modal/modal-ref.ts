import { ESCAPE } from '@angular/cdk/keycodes'
import {
  GlobalPositionStrategy,
  OverlayRef,
  OverlaySizeConfig,
} from '@angular/cdk/overlay'
import { firstValueFrom, isObservable, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import {
  IModalPosition,
  TheSeamModalCanCloseFn,
  TheSeamModalCloseReason,
} from './modal-config'
import { ModalContainerComponent } from './modal-container/modal-container.component'

const DRAG_CLOSE_THRESHOLD = 5

/** Unique id for the created dialog. */
let uniqueId = 0

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class ModalRef<T, R = any> {
  /** The instance of the component in the dialog. */
  componentInstance: T | null = null

  /** See `ModalConfig.disableClose`. */
  disableClose: boolean | undefined

  /** See `ModalConfig.canClose`. */
  canClose: TheSeamModalCanCloseFn<R> | null | undefined

  /**
   * Temporarily ignores clicks outside of the dialog, without touching the
   * user's `disableClose` setting. Used while a scrollbar is being dragged.
   * @docs-private
   */
  _suppressOutsideClose = false

  /** Result to be passed to afterClosed. */
  private _result: R | undefined

  /** Whether `close()` has been called. */
  private _closing = false

  /** Whether a `canClose` guard is still deciding. */
  private _closeRequestPending = false

  private _clickOutsideCleanup: (() => void) | null = null

  constructor(
    public _overlayRef: OverlayRef,
    protected _containerInstance: ModalContainerComponent,
    readonly id: string = `seam-modal-${uniqueId++}`,
  ) {
    // Pass the id along to the container.
    _containerInstance._id = id

    // Set before the content is attached, so the content component can
    // override them from its constructor.
    this.disableClose = _containerInstance._config.disableClose
    this.canClose = _containerInstance._config.canClose

    // If the dialog has a backdrop, handle clicks from the backdrop.
    if (_containerInstance._config.hasBackdrop) {
      _overlayRef.backdropClick().subscribe(() => this._requestOutsideClose())

      this._clickOutsideCleanup = this._initCloseOnClickOutside()
    }

    this.beforeClosed().subscribe(() => {
      this._overlayRef.detachBackdrop()
    })

    this.afterClosed().subscribe(() => {
      this._overlayRef.detach()
      this._overlayRef.dispose()
      this.componentInstance = null
    })

    // Close when escape keydown event occurs
    _overlayRef
      .keydownEvents()
      .pipe(filter((event) => event.keyCode === ESCAPE))
      .subscribe(() => this.requestClose('escape'))
  }

  private _requestOutsideClose(): void {
    if (!this._suppressOutsideClose) {
      this.requestClose('backdrop')
    }
  }

  private _initCloseOnClickOutside(): () => void {
    const close = () => this._requestOutsideClose()

    const isInContainer = (target: HTMLElement | null) => {
      return this._containerInstance.getNativeElement().contains(target)
    }

    const getPosition = (
      event: MouseEvent | PointerEvent,
    ): { x: number; y: number } => {
      return { x: event.clientX, y: event.clientY }
    }

    const dist = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    }

    let pressed = false
    let pressedPosition: { x: number; y: number } | null = null
    const _handlePressDown = (event: MouseEvent | PointerEvent) => {
      pressed = true
      pressedPosition = getPosition(event)
    }

    const _handlePressUp = (event: MouseEvent | PointerEvent) => {
      if (pressedPosition) {
        const target = event.target as HTMLElement | null
        if (target && !isInContainer(target)) {
          const currentPosition = getPosition(event)
          const d = dist(
            currentPosition.x,
            currentPosition.y,
            pressedPosition.x,
            pressedPosition.y,
          )
          if (d < DRAG_CLOSE_THRESHOLD) {
            close()
          }
        }

        pressedPosition = null
      } else if (pressed) {
        close()
      }
      pressed = false
    }

    this._overlayRef.overlayElement.addEventListener(
      'mousedown',
      _handlePressDown,
    )
    this._overlayRef.overlayElement.addEventListener(
      'pointerdown',
      _handlePressDown,
    )

    this._overlayRef.overlayElement.addEventListener('mouseup', _handlePressUp)
    this._overlayRef.overlayElement.addEventListener(
      'pointerup',
      _handlePressUp,
    )

    return () => {
      this._overlayRef.overlayElement.removeEventListener(
        'mousedown',
        _handlePressDown,
      )
      this._overlayRef.overlayElement.removeEventListener(
        'pointerdown',
        _handlePressDown,
      )

      this._overlayRef.overlayElement.removeEventListener(
        'mouseup',
        _handlePressUp,
      )
      this._overlayRef.overlayElement.removeEventListener(
        'pointerup',
        _handlePressUp,
      )
    }
  }

  /** Gets an observable that emits when the overlay's backdrop has been clicked. */
  backdropClick(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick()
  }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: R): void {
    if (this._closing) {
      return
    }
    this._closing = true

    this._result = dialogResult
    this._containerInstance._startExiting()
    if (this._clickOutsideCleanup) {
      this._clickOutsideCleanup()
    }
  }

  /**
   * Closes the dialog if `disableClose` and `canClose` allow it, as if the
   * user had requested the close.
   *
   * Resolves to whether this request closed the dialog. Requests made while
   * the dialog is closing, or while a `canClose` guard is still deciding,
   * resolve to `false`. Rejects if `canClose` throws or rejects, in which case
   * the dialog stays open.
   *
   * @param reason The user interaction that requested the close.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  requestClose(
    reason: TheSeamModalCloseReason,
    dialogResult?: R,
  ): Promise<boolean> {
    if (this._closing || this._closeRequestPending) {
      return Promise.resolve(false)
    }

    // `disableClose` only covers interactions that are easy to trigger by
    // accident. A `seamModalClose` button is always a deliberate request.
    if (this.disableClose && reason !== 'close-directive') {
      return Promise.resolve(false)
    }

    if (!this.canClose) {
      this.close(dialogResult)
      return Promise.resolve(true)
    }

    let allowed: ReturnType<TheSeamModalCanCloseFn<R>>
    try {
      allowed = this.canClose(reason, dialogResult)
    } catch (error) {
      return Promise.reject(error)
    }

    // Close synchronously when possible, like an unguarded close.
    if (typeof allowed === 'boolean') {
      if (allowed) {
        this.close(dialogResult)
      }
      return Promise.resolve(allowed)
    }

    this._closeRequestPending = true
    const decision = isObservable(allowed)
      ? firstValueFrom(allowed)
      : Promise.resolve(allowed)
    return decision.then(
      (canClose) => {
        this._closeRequestPending = false
        if (canClose !== true || this._closing) {
          return false
        }
        this.close(dialogResult)
        return true
      },
      (error) => {
        this._closeRequestPending = false
        throw error
      },
    )
  }

  /**
   * Updates the dialog's position.
   * @param position New dialog position.
   */
  updatePosition(position?: IModalPosition): this {
    const strategy = this._getPositionStrategy()

    if (position && (position.left || position.right)) {
      if (position.left) {
        strategy.left(position.left)
      } else {
        strategy.right(position.right)
      }
    } else {
      strategy.centerHorizontally()
    }

    if (position && (position.top || position.bottom)) {
      if (position.top) {
        strategy.top(position.top)
      } else {
        strategy.bottom(position.bottom)
      }
    } else {
      strategy.centerVertically()
    }

    this._overlayRef.updatePosition()

    return this
  }

  /**
   * Gets an observable that emits when keydown events are targeted on the overlay.
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents()
  }

  /**
   * Updates the dialog's width and height, defined, min and max.
   * @param size New size for the overlay.
   */
  updateSize(size: OverlaySizeConfig): this {
    if (size.width) {
      this._getPositionStrategy().width(size.width.toString())
    }
    if (size.height) {
      this._getPositionStrategy().height(size.height.toString())
    }
    this._overlayRef.updateSize(size)
    this._overlayRef.updatePosition()
    return this
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig()
      .positionStrategy as GlobalPositionStrategy
  }

  /** Gets an observable that emits when dialog begins opening. */
  beforeOpened(): Observable<void> {
    return this._containerInstance._beforeEnter.asObservable()
  }

  /** Gets an observable that emits when dialog is finished opening. */
  afterOpened(): Observable<void> {
    return this._containerInstance._afterEnter.asObservable()
  }

  /** Gets an observable that emits when dialog begins closing. */
  beforeClosed(): Observable<R | undefined> {
    return this._containerInstance._beforeExit.pipe(map(() => this._result))
  }

  /** Gets an observable that emits when dialog is finished closing. */
  afterClosed(): Observable<R | undefined> {
    return this._containerInstance._afterExit.pipe(map(() => this._result))
  }
}
