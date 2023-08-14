import { Component, Input, HostBinding } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BehaviorSubject, Observable } from 'rxjs'

export const FILTER_VALUES: string[] = [
  'A', 'B', 'C', 'D',
  'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X',
  'Y', 'Z'
]

@Component({
  selector: 'seam-vertical-list-filter',
  templateUrl: './vertical-list-filter.component.html',
  styleUrls: ['./vertical-list-filter.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
  ]
})
export class TheSeamVerticalListFilterComponent {

  readonly _values = FILTER_VALUES

  @Input() showClearOption = true

  @Input()
  get filterValue(): string | undefined { return this._filterValue.value }
  set filterValue(value: string | undefined) { this._filterValue.next(value) }
  private readonly _filterValue = new BehaviorSubject<string | undefined>(undefined)
  public readonly filterValue$: Observable<string | undefined>

  @HostBinding('attr.data-filter-value')
  get _filterValueAttr(): string | undefined { return this.filterValue }

  constructor() {
    this.filterValue$ = this._filterValue.asObservable()
  }

  characterClick(character: string) {
    if (this.filterValue === character) {
      this.filterValue = undefined
    } else {
      this.filterValue = character
    }
  }

  clearFilter() {
    this.filterValue = undefined
  }

}
