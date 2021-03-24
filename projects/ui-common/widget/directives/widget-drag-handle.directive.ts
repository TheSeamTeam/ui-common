import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { AfterViewInit, Directive, DoCheck, ElementRef, Input, NgZone, OnDestroy, OnInit, Optional } from '@angular/core'
import { BehaviorSubject, Subject } from 'rxjs'
import { auditTime, filter, switchMap, take, takeUntil } from 'rxjs/operators'

import { getClosestWidgetCdkDrag } from '../../framework/dashboard/dashboard-widgets/dashboard-widgets-utils'
import { DashboardWidgetsComponent } from '../../framework/dashboard/dashboard-widgets/dashboard-widgets.component'


//
// NOTE: This will probably NOT be used long term, unless more of the
// CdkDragDrop code is rewritten.
//
// This directive is meant to be a HACK replacement directive for CdkDragHandle.
// The reason this was made is because CdkDragHandle doesn't work in child
// components, since it uses ContentChildren to query for the handles.
//
// This could easily break, because I am forcing the handles query list to emit
// changes manually. So, if the query list actually changes, then my changes
// will be broken.
//



// Helper type that ignores `readonly` properties. This is used in
// `extendStyles` to ignore the readonly properties on CSSStyleDeclaration
// since we won't be touching those anyway.
type Writeable<T> = { -readonly [P in keyof T]-?: T[P] }

/**
 * Extended CSSStyleDeclaration that includes a couple of drag-related
 * properties that aren't in the built-in TS typings.
 */
interface DragCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitUserDrag: string
  MozUserSelect: string // For some reason the Firefox property is in PascalCase.
  msScrollSnapType: string
  scrollSnapType: string
  msUserSelect: string
}

export function extendStyles(
  dest: Writeable<CSSStyleDeclaration>,
  source: Partial<DragCSSStyleDeclaration>
) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // tslint:disable-next-line: no-non-null-assertion
      dest[key] = source[key]!
    }
  }

  return dest
}

export function toggleNativeDragInteractions(element: HTMLElement, enable: boolean) {
  const userSelect = enable ? '' : 'none'

  extendStyles(element.style, {
    touchAction: enable ? '' : 'none',
    webkitUserDrag: enable ? '' : 'none',
    webkitTapHighlightColor: enable ? '' : 'transparent',
    userSelect: userSelect,
    msUserSelect: userSelect,
    webkitUserSelect: userSelect,
    MozUserSelect: userSelect
  })
}

@Directive({
  selector: '[seamWidgetDragHandle]',
  host: {
    'class': 'cdk-drag-handle'
  }
})
export class WidgetDragHandleDirective implements OnInit, OnDestroy, AfterViewInit, DoCheck {

  private readonly _ngUnsubscribe = new Subject()

  private _attachedToDom = new BehaviorSubject<boolean>(false)
  private _doneCheckingAttached = false
  private _knownParentDrag: any /* CdkDrag | undefined */

  /** Needed because CdkDrag reads this variable */
  get _parentDrag() { return this.getParentCdkDrag() }

  /** Emits when the state of the handle has changed. */
  _stateChanges = new Subject<CdkDragHandle>()

  /** Whether starting to drag through this handle is disabled. */
  @Input('cdkDragHandleDisabled')
  get disabled(): boolean { return this._disabled }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value)
    this._stateChanges.next(<any>this)
  }
  private _disabled = false

  constructor(
    public element: ElementRef<HTMLElement>,
    private _ngZone: NgZone,
    @Optional() private _dashboardWidgets?: DashboardWidgetsComponent,
    @Optional() private __parentDrag?: CdkDrag
  ) {
    toggleNativeDragInteractions(element.nativeElement, false)
  }

  ngOnInit() {
    if (this._dashboardWidgets) {
      this._dashboardWidgets.widgetsChange.pipe(
        auditTime(0),
        takeUntil(this._ngUnsubscribe)
      ).subscribe(() => {
        if (this._knownParentDrag) {
          const isAttached = this.isAttachedToDom()
          if (isAttached) {
            const parent = <any>this.getParentCdkDrag()
            if (this._knownParentDrag !== parent) {
              this._attachedToDom.next(isAttached)
            }
          }

        }
      })
    }
  }

  ngAfterViewInit() {
    if (this.__parentDrag || this._dashboardWidgets) {
      // FIXME: This only works until the widget is moved to another template
      // outlet. Now that the component isn't reinitialized when moving between
      // lists the handle needs to now reflex that change to its new CdkDrag
      // parent and possibly tell its previous parent to forget it.

      // HACK: This is a hack to allow the `CdkDrag` directive to manage a
      // handle that is not visible to `ContentChildren` query.
      this._ngZone.onStable.asObservable()
        // .pipe(take(1), untilDestroyed(this))
        .pipe(
          take(1),
          // With the weird trick being done to keep widgets initialized when switching columns
          switchMap(() => this._attachedToDom.pipe(filter(v => v === true))),
          // take(1)
          takeUntil(this._ngUnsubscribe)
        )
        .subscribe(() => {
          const parent = <any>this.getParentCdkDrag()

          if (this._knownParentDrag && this._knownParentDrag !== parent) {
            this._knownParentDrag._dragRef.disableHandle(this.element.nativeElement)
            this._knownParentDrag = undefined
          }

          if (parent) {
            this._knownParentDrag = parent
            parent._handles.reset([ ...parent._handles._results, this ])
            parent._handles.notifyOnChanges()
            parent._dragRef.enableHandle(this.element.nativeElement)
          }
        })
    }
  }

  ngOnDestroy() {
    this._stateChanges.complete()
    this._attachedToDom.complete()

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  ngDoCheck() {
    // The attached observable only emits once, so we can stop checking if
    // attached.
    if (this._doneCheckingAttached) { return }

    const isAttached = this.isAttachedToDom()
    if (isAttached !== this._attachedToDom.value) {
      this._attachedToDom.next(isAttached)
      this._doneCheckingAttached = true
    }
  }

  public isAttachedToDom(): boolean {
    return document.body.contains(this.element.nativeElement)
  }

  /** Closest parent draggable instance. */
  public getParentCdkDrag(): CdkDrag | undefined {
    if (this.__parentDrag) {
      return this.__parentDrag
    } else if (this._dashboardWidgets && this._dashboardWidgets.cdkDragDirectives) {
      const dragsArr = this._dashboardWidgets.cdkDragDirectives.toArray()
      const closest = getClosestWidgetCdkDrag(this.element, dragsArr)
      return (closest !== undefined && closest !== null) ? closest : undefined
    }
  }

}
