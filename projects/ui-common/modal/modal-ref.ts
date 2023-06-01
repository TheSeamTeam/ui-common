import { ESCAPE } from '@angular/cdk/keycodes'
import { GlobalPositionStrategy, OverlayRef, OverlaySizeConfig } from '@angular/cdk/overlay'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { IModalPosition } from './modal-config'
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

  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined

  /** Result to be passed to afterClosed. */
  private _result: R | undefined

  private _clickOutsideCleanup: (() => void) | null = null

  constructor(
    public _overlayRef: OverlayRef,
    protected _containerInstance: ModalContainerComponent,
    readonly id: string = `seam-modal-${uniqueId++}`) {
    // Pass the id along to the container.
    _containerInstance._id = id

    // If the dialog has a backdrop, handle clicks from the backdrop.
    if (_containerInstance._config.hasBackdrop) {
      _overlayRef.backdropClick().subscribe(() => {
        if (!this.disableClose) {
          this.close()
        }
      })

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
    _overlayRef.keydownEvents()
      // tslint:disable-next-line:deprecation
      .pipe(filter(event => event.keyCode === ESCAPE && !this.disableClose))
      .subscribe(() => this.close())
  }

  private _initCloseOnClickOutside(): () => void {
    const close = () => {
      if (!this.disableClose) {
        this.close()
      }
    }

    const isInContainer = (target: HTMLElement | null) => {
      return this._containerInstance.getNativeElement().contains(target)
    }

    const getPosition = (event: MouseEvent | PointerEvent): { x: number, y: number } => {
      return { x: event.clientX, y: event.clientY }
    }

    const dist = (x1: number, y1: number, x2: number, y2: number): number => {
      return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
    }

    let pressed = false
    let pressedPosition: { x: number, y: number } | null = null
    const _handlePressDown = (event: MouseEvent | PointerEvent) => {
      pressed = true
      pressedPosition = getPosition(event)
    }

    const _handlePressUp = (event: MouseEvent | PointerEvent) => {
      if (pressedPosition) {
        const target = event.target as HTMLElement | null
        if (target && !isInContainer(target)) {
          const currentPosition = getPosition(event)
          const d = dist(currentPosition.x, currentPosition.y, pressedPosition.x, pressedPosition.y)
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

    this._overlayRef.overlayElement.addEventListener('mousedown', _handlePressDown)
    this._overlayRef.overlayElement.addEventListener('pointerdown', _handlePressDown)

    this._overlayRef.overlayElement.addEventListener('mouseup', _handlePressUp)
    this._overlayRef.overlayElement.addEventListener('pointerup', _handlePressUp)

    return () => {
      this._overlayRef.overlayElement.removeEventListener('mousedown', _handlePressDown)
      this._overlayRef.overlayElement.removeEventListener('pointerdown', _handlePressDown)

      this._overlayRef.overlayElement.removeEventListener('mouseup', _handlePressUp)
      this._overlayRef.overlayElement.removeEventListener('pointerup', _handlePressUp)
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
    this._result = dialogResult
    this._containerInstance._startExiting()
    if (this._clickOutsideCleanup) { this._clickOutsideCleanup() }
  }

  /**
   * Updates the dialog's position.
   * @param position New dialog position.
   */
  updatePosition(position?: IModalPosition): this {
    const strategy = this._getPositionStrategy()

    if (position && (position.left || position.right)) {
      position.left ? strategy.left(position.left) : strategy.right(position.right)
    } else {
      strategy.centerHorizontally()
    }

    if (position && (position.top || position.bottom)) {
      position.top ? strategy.top(position.top) : strategy.bottom(position.bottom)
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
      // tslint:disable-next-line:deprecation
      this._getPositionStrategy().width(size.width.toString())
    }
    if (size.height) {
      // tslint:disable-next-line:deprecation
      this._getPositionStrategy().height(size.height.toString())
    }
    this._overlayRef.updateSize(size)
    this._overlayRef.updatePosition()
    return this
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy
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
