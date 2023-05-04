import { coerceNumberProperty } from '@angular/cdk/coercion'
import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnDestroy } from '@angular/core'
import { fromEvent, Subject } from 'rxjs'
import { filter, takeUntil, tap } from 'rxjs/operators'

import { QuillEditorComponent } from 'ngx-quill'

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'quill-editor'
})
export class NgxQuillExtraDirective implements OnDestroy, AfterViewInit {

  private readonly _ngUnsubscribe = new Subject<void>()

  private _tabIndex = -1

  /**
   * Set the tab index to `-1` to allow the root element of the
   * component to receive `focus` event from javascript, but not get focused by
   * keyboard navigation.
   */
  @Input()
  set tabIndex(value: number) { this._tabIndex = coerceNumberProperty(value) }
  get tabIndex(): number { return this._tabIndex }

  @HostBinding('attr.tabindex')
  get _attrTabIndex() { return this._quillEditor.disabled ? -1 : (this.tabIndex || 0) }

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _quillEditor: QuillEditorComponent
  ) { }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngAfterViewInit() {
    const parent = this._getParentElementForLabelFocusIssue()
    if (parent) {
      // NOTE: This is a hack to avoid an issue letting a label with "for"
      // attribute focus the control.
      fromEvent(parent, 'click').pipe(
        takeUntil(this._ngUnsubscribe),
        filter(e => (e.target as HTMLElement)?.getAttribute('for') === this._elementRef.nativeElement.id),
        tap(() => this._quillEditor.quillEditor.focus())
      ).subscribe()
    }
  }

  private _getParentElementForLabelFocusIssue(): HTMLElement | undefined {
    const findElem = (elem: HTMLElement): any => {
      if (elem.nodeName.toLowerCase() === 'seam-form-field') {
        return elem
      }

      if (elem.parentElement) {
        return findElem(elem.parentElement)
      }

      return elem
    }

    return findElem(this._elementRef.nativeElement)
  }

}
