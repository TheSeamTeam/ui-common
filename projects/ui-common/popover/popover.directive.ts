import { FocusMonitor, FocusOrigin, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y'
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import { ESCAPE } from '@angular/cdk/keycodes'
import { ConnectionPositionPair, Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay'
import { normalizePassiveListenerOptions } from '@angular/cdk/platform'
import { ComponentPortal } from '@angular/cdk/portal'
import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core'
import { BehaviorSubject, fromEvent, merge, of, Subject, Subscription } from 'rxjs'
import { switchMap, takeUntil } from 'rxjs/operators'

import { PopoverComponent } from './popover/popover.component'

/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true})

@Directive({
  selector: '[seamPopover]',
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    'aria-haspopup': 'true',
    '[attr.aria-expanded]': 'popoverOpen() || null'
  },
  exportAs: 'seamPopover'
})
export class TheSeamPopoverDirective implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  @Input() seamPopover?: TemplateRef<any> | null

  /**
   * Defines a width for a popover that will scale down if the window innerWidth is
   * smaller than the value.
   */
  @Input()
  get seamPopoverBaseWidth() { return this._seamPopoverBaseWidth.value }
  set seamPopoverBaseWidth(value: number | null) {
    const _val = coerceNumberProperty(value, null)
    if (_val !== this._seamPopoverBaseWidth.value) {
      this._seamPopoverBaseWidth.next(_val)
    }
  }
  private _seamPopoverBaseWidth = new BehaviorSubject<number | null>(null)

  @Input()
  get seamPopoverDisabled() { return this._seamPopoverDisabled.value }
  set seamPopoverDisabled(val: boolean) { this._seamPopoverDisabled.next(coerceBooleanProperty(val)) }
  private _seamPopoverDisabled = new BehaviorSubject<boolean>(false)


  // ngOnInit() {
  //   this._seamPopoverDisabled.pipe(
  //     switchMap(disabled => {
  //       if (disabled) {
  //         this.close()
  //         return of(undefined)
  //       }

  //       if (!(this._elementRef && this._elementRef.nativeElement)) {
  //         return of(undefined)
  //       }

  //       return fromEvent(this._elementRef.nativeElement, 'click')
  //     })
  //   ).subscribe()
  // }


  private _active = false
  private _closing = false
  private _overlayRef: OverlayRef | undefined | null
  private _compRef: ComponentRef<PopoverComponent> | undefined | null
  private _popoverClosedSubscription = Subscription.EMPTY
  private _closingActionsSubscription = Subscription.EMPTY

  public restoreFocus = true

  // Tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  _openedBy: 'mouse' | 'touch' | null = null

  @HostListener('mousedown', [ '$event' ])
  _onMouseDown(event: MouseEvent) {
    if (!isFakeMousedownFromScreenReader(event)) {
      // Since right or middle button clicks won't trigger the `click` event,
      // we shouldn't consider the menu as opened by mouse in those cases.
      this._openedBy = event.button === 0 ? 'mouse' : null
    }
  }

  @HostListener('click', [ '$event' ])
  _onClick(event: any) {
    this.toggle()
  }

  @HostListener('document:keydown', [ '$event' ])
  _onDocumentKeydown(event: any) {
    if (event.keyCode === ESCAPE) {
      this.closePopover()
    }
  }

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
    private _focusMonitor: FocusMonitor
  ) {
    this._elementRef.nativeElement.addEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)

    this._seamPopoverBaseWidth
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe(w => {
        if (this._compRef && this._compRef.instance) {
          this._compRef.instance.baseWidth = w
          this._compRef.changeDetectorRef.markForCheck()
        }
      })
  }

  ngOnDestroy() {
    this.closePopover()

    this._elementRef.nativeElement.removeEventListener('touchstart', this._handleTouchStart,
        passiveEventListenerOptions)

    this._popoverClosedSubscription.unsubscribe()
    this._closingActionsSubscription.unsubscribe()

    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  /**
   * Handles touch start events on the trigger.
   * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
   */
  private _handleTouchStart = () => this._openedBy = 'touch'

  public toggle(): void {
    if (this._active || this.seamPopoverDisabled) {
      this.closePopover()
    } else {
      this.openPopover()
    }
  }

  public openPopover(): void {
    if (this._active || !this.seamPopover) { return }
    this._active = true

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'transparent',
      positionStrategy: this.getOverlayPosition(this._elementRef.nativeElement),
    })

    this._compRef = this._overlayRef.attach(new ComponentPortal(PopoverComponent, this._viewContainerRef))

    this._closingActionsSubscription = this._popoverClosingActions().subscribe(() => this.closePopover())

    this._compRef.instance.template = this.seamPopover
    this._compRef.instance.baseWidth = this.seamPopoverBaseWidth
    this._compRef.changeDetectorRef.markForCheck()

    this._popoverClosedSubscription = this._compRef.instance._afterExit.subscribe(v => {
      // console.log('closed', v)
      if (this._overlayRef?.hasAttached()) {
        this._overlayRef.detach()
      }

      this._resetPopover()

      this._popoverClosedSubscription.unsubscribe()
      this._closingActionsSubscription.unsubscribe()

      this._active = false
      this._closing = false
    })
  }

  public closePopover(): void {
    if (!this._active) { return }

    if (!this._closing) {
      if (this._compRef && this._compRef.instance) {
        this._closing = true
        this._compRef.instance._startExiting()
      }
    }
  }

  public popoverOpen(): boolean {
    return this._overlayRef?.hasAttached() ?? false
  }

  private getOverlayPosition(origin: HTMLElement): PositionStrategy {
    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions(this.getPositions())
      .withFlexibleDimensions(false)
      .withPush(true)

    return positionStrategy
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top'
      },
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom'
      },
      {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
      },
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
      },
    ]
  }

  /**
   * Focuses the popover trigger.
   * @param origin Source of the popover trigger's focus.
   */
  focus(origin: FocusOrigin = 'program') {
    if (this._focusMonitor) {
      this._focusMonitor.focusVia(this._elementRef, origin)
    } else {
      this._elementRef.nativeElement.focus()
    }
  }

  /**
   * This method resets the popover when it's closed, most importantly restoring
   * focus to the popover trigger if the popover was opened via the keyboard.
   */
  private _resetPopover(): void {
    // We should reset focus if the user is navigating using a keyboard or
    // if we have a top-level trigger which might cause focus to be lost
    // when clicking on the backdrop.
    if (this.restoreFocus) {
      if (!this._openedBy) {
        // Note that the focus style will show up both for `program` and
        // `keyboard` so we don't have to specify which one it is.
        this.focus()
      }
    }

    this._openedBy = null
  }

  /** Returns a stream that emits whenever an action that should close the popover occurs. */
  private _popoverClosingActions() {
    const backdrop = this._overlayRef?.backdropClick() ?? of()
    const detachments = this._overlayRef?.detachments() ?? of()
    const hover = of()

    return merge(backdrop, hover, detachments)
  }

}
