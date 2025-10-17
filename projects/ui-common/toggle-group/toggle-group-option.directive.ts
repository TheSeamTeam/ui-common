import { coerceBooleanProperty } from '@angular/cdk/coercion'
import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  Output,
} from '@angular/core'

@Directive({
  selector: '[seamToggleGroupOption]',
  exportAs: 'seamToggleGroupOption',
})
export class ToggleGroupOptionDirective {
  private readonly _cdr = inject(ChangeDetectorRef)

  @Input() seamToggleGroupOption: string | undefined | null

  @Input()
  get selected(): boolean {
    return this._selected
  }
  set selected(value: boolean) {
    if (!this._canUnselect && !value) {
      return
    }
    this._selected = coerceBooleanProperty(value)
    this.selectionChange.emit(this._selected)
    this._cdr.markForCheck()
  }
  private _selected = false

  /** Internal use only for now. */
  _canUnselect = true

  @Output() selectionChange = new EventEmitter<boolean>()

  @HostBinding('class.lib-toggle-group-option-selected')
  get _checkioSelectedClass() {
    return this._selected
  }

  get value(): string | undefined | null {
    return this.seamToggleGroupOption
  }
}
