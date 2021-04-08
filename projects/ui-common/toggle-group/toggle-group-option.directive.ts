import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, Input, Output } from '@angular/core'

@Directive({
  selector: '[seamToggleGroupOption]',
  exportAs: 'seamToggleGroupOption'
})
export class ToggleGroupOptionDirective {

  @Input() seamToggleGroupOption: string | undefined | null

  @Input()
  get selected(): boolean { return this._selected }
  set selected(value: boolean) {
    if (!this._canUnselect && !value) { return }
    this._selected = coerceBooleanProperty(value)
    this.selectionChange.emit(this._selected)
    this._cdr.markForCheck()
  }
  private _selected = false

  /** Internal use only for now. */
  _canUnselect = true

  @Output() selectionChange = new EventEmitter<boolean>()

  @HostBinding('class.lib-toggle-group-option-selected') get _checkioSelectedClass() {
    return this._selected
  }

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _cdr: ChangeDetectorRef
  ) { }

  get value(): string | undefined | null {
    return this.seamToggleGroupOption
  }

}
