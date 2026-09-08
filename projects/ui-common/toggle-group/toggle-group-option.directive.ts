import { Directive, HostBinding, inject, Input } from '@angular/core'

import { THESEAM_TOGGLE_GROUP_PARENT } from './toggle-group-parent'

@Directive({
  selector: '[seamToggleGroupOption]',
  exportAs: 'seamToggleGroupOption',
})
export class ToggleGroupOptionDirective {
  private readonly _group = inject(THESEAM_TOGGLE_GROUP_PARENT, {
    optional: true,
  })

  @Input() seamToggleGroupOption: string | undefined | null

  @HostBinding('class.lib-toggle-group-option-selected')
  get _checkioSelectedClass() {
    return this._group?.isSelected(this.value) || false
  }

  get value(): string | undefined | null {
    return this.seamToggleGroupOption
  }
}
