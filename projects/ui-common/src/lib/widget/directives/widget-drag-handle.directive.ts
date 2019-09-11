import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CdkDragHandle, ɵb as CDK_DRAG_PARENT } from '@angular/cdk/drag-drop'
import { AfterViewInit, Directive, ElementRef, Inject, Input, NgZone, OnDestroy, OnInit, Optional } from '@angular/core'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { Subject } from 'rxjs'
import { take } from 'rxjs/operators'


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
}

export function extendStyles(
  dest: Writeable<CSSStyleDeclaration>,
  source: Partial<DragCSSStyleDeclaration>
) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      dest[key as keyof CSSStyleDeclaration] = source[key as keyof CSSStyleDeclaration]
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
export class WidgetDragHandleDirective implements OnDestroy, AfterViewInit {

  /** Closest parent draggable instance. */
  _parentDrag: {} | undefined

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
    @Inject(CDK_DRAG_PARENT) @Optional() parentDrag?: any
  ) {
    this._parentDrag = parentDrag
    toggleNativeDragInteractions(element.nativeElement, false)
  }

  ngAfterViewInit() {
    if (this._parentDrag) {
      // HACK: This is a hack to allow the `CdkDrag` directive to manage a
      // handle that is not visible to `ContentChildren` query.
      this._ngZone.onStable.asObservable()
        .pipe(take(1), untilDestroyed(this))
        .subscribe(() => {
          const parent = <any>this._parentDrag
          parent._handles.reset([ ...parent._handles._results, this ])
          parent._handles.notifyOnChanges()
          parent._dragRef.enableHandle(this.element.nativeElement)
        })
    }
  }

  ngOnDestroy() {
    this._stateChanges.complete()
  }

}
