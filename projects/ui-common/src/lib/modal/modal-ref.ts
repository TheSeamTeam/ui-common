import { ESCAPE } from '@angular/cdk/keycodes'
import { GlobalPositionStrategy, OverlayRef, OverlaySizeConfig } from '@angular/cdk/overlay'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { IModalPosition } from './modal-config'
import { ModalContainerComponent } from './modal-container/modal-container.component'

/** Unique id for the created dialog. */
let uniqueId = 0

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class ModalRef<T, R = any> {
  /** The instance of the component in the dialog. */
  componentInstance: T | null

  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined

  /** Result to be passed to afterClosed. */
  private _result: R | undefined

  constructor(
    public _overlayRef: OverlayRef,
    protected _containerInstance: ModalContainerComponent,
    readonly id: string = `seam-modal-${uniqueId++}`) {
    // Pass the id along to the container.
    _containerInstance._id = id

    const _bootstrapBackdropClickListener = (e) => {
      if (!this.disableClose) {
        this.close()
      }
    }

    // If the dialog has a backdrop, handle clicks from the backdrop.
    if (_containerInstance._config.hasBackdrop) {
      _overlayRef.backdropClick().subscribe(() => {
        if (!this.disableClose) {
          this.close()
        }
      })

      // NOTE: For current bootstrap style modal
      _overlayRef.overlayElement.addEventListener('click', _bootstrapBackdropClickListener)
    }

    this.beforeClosed().subscribe(() => {
      this._overlayRef.detachBackdrop()
    })

    this.afterClosed().subscribe(() => {
      if (this._containerInstance._config.hasBackdrop) {
        this._overlayRef.overlayElement.removeEventListener('click', _bootstrapBackdropClickListener)
      }
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
