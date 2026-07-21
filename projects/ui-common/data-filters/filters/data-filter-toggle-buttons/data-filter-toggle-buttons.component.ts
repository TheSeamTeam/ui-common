import { coerceArray } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import {
  hasProperty,
  isNullOrUndefined,
  notNullOrUndefined,
} from '@theseam/ui-common/utils'

import {
  DataFilterState,
  IDataFilter,
  THESEAM_DATA_FILTER,
  THESEAM_DATA_FILTER_OPTIONS,
} from '../../data-filter'
import { THESEAM_DATA_FILTER_CONTAINER } from '../../data-filter-container'
import type { DataFilterContainer } from '../../data-filter-container'
import { textDataFilter } from '../data-filter-text/data-filter-text.component'
import { ITextFilterOptions } from '../data-filter-text/text-filter-options'

export const DATA_FILTER_TOGGLE_BUTTON_DROPDOWN_TEXT = 'Select Filter'

export const DATA_FILTER_TOGGLE_BUTTON: any = {
  provide: THESEAM_DATA_FILTER,
  useExisting: forwardRef(() => DataFilterToggleButtonsComponent),
  multi: true,
}

export interface IToggleButton {
  name: string
  value: string
  comparator?: (value: any, row: any, index: number) => -1 | 0 | 1
}

export interface IToggleButtonsFilterOptions extends ITextFilterOptions {
  selectionToggleable: boolean
  multiple: boolean
  buttons: IToggleButton[]
  initialValue?: any
  /** The maximum width a button row can grow to before collapsing. If not set, the button row will grow until it overflows, then collapse. */
  maxWidth?: number
  /** The text shown when the button row is in the collapsed state and no filter is selected. */
  filterDropdownLabel?: string
  /** When true, will prevent the button row from collapsing into a dropdown on smaller screen sizes. */
  disableCollapse?: boolean
}

export const DefaultToggleButtonsFilterOptions: IToggleButtonsFilterOptions = {
  properties: undefined,
  omitProperties: undefined,
  multiple: false,
  selectionToggleable: false,
  buttons: [],
  exact: false,
  caseSensitive: false,
  maxWidth: undefined,
  filterDropdownLabel: DATA_FILTER_TOGGLE_BUTTON_DROPDOWN_TEXT,
  disableCollapse: undefined,
}

export function toggleButtonsFilter(
  data: any[],
  values: string[],
  options = DefaultToggleButtonsFilterOptions,
) {
  if (!data || !values) {
    return data
  }

  const customComparatorBtns: IToggleButton[] = []
  for (const btn of options.buttons) {
    if (btn.comparator) {
      customComparatorBtns.push(btn)
    }
  }

  let _data = data
  for (const val of values) {
    if (val === '') {
      continue
    }

    let cmp
    for (const btn of customComparatorBtns) {
      if (btn.value === val) {
        cmp = btn.comparator
      }
    }
    if (cmp) {
      const filtered: any[] = []
      for (let i = 0; i < _data.length; i++) {
        if (cmp(val, _data[i], i) !== -1) {
          filtered.push(_data[i])
        }
      }
      _data = filtered
    } else {
      _data = textDataFilter(_data, val, {
        properties: options.properties,
        omitProperties: options.omitProperties,
        exact: options.exact,
        caseSensitive: options.caseSensitive,
      })
    }
  }
  return _data
}

let _uid = 0

@Component({
  selector: 'seam-data-filter-toggle-buttons',
  templateUrl: './data-filter-toggle-buttons.component.html',
  styleUrls: ['./data-filter-toggle-buttons.component.scss'],
  providers: [DATA_FILTER_TOGGLE_BUTTON],
  standalone: false,
})
export class DataFilterToggleButtonsComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit, IDataFilter
{
  public readonly name = 'toggle-buttons'
  public readonly uid = `toggle-buttons__${_uid++}`

  @Input() filterName: string | undefined

  _control = new UntypedFormControl()

  @Input() properties = this._optDefault('properties')
  @Input() omitProperties = this._optDefault('omitProperties')
  @Input() multiple = this._optDefault('multiple')
  @Input() selectionToggleable = this._optDefault('selectionToggleable')
  @Input() buttons = this._optDefault('buttons')
  @Input() exact = this._optDefault('exact')
  @Input() caseSensitive = this._optDefault('caseSensitive')
  @Input() maxWidth = this._optDefault('maxWidth')
  @Input() filterDropdownLabel = this._optDefault('filterDropdownLabel')
  @Input() disableCollapse = this._optDefault('disableCollapse')

  @HostBinding('class.seam-data-filter-toggle-buttons-collapsed')
  get _collapsedClass() {
    return this.isCollapsed()
  }

  @HostBinding('class.seam-data-filter-toggle-buttons-expanded')
  get _expandedClass() {
    return !this.isCollapsed()
  }

  public readonly isCollapsed = signal(false)

  @ViewChild('measureDiv') private _measureDiv!: ElementRef<HTMLElement>

  private _resizeObserver: ResizeObserver | undefined

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? coerceArray(value) : undefined
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  public readonly filterStateChanges: Observable<DataFilterState>
  public activeFilterLabel!: Observable<string>

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    @Inject(THESEAM_DATA_FILTER_CONTAINER)
    private _filterContainer: DataFilterContainer,
    @Optional()
    @Inject(THESEAM_DATA_FILTER_OPTIONS)
    private _filterOptions: IToggleButtonsFilterOptions | null,
  ) {
    this.filterStateChanges = this._control.valueChanges.pipe(
      switchMap(() => of(this.filterState())),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
  }

  ngOnInit() {
    this._filterContainer.addFilter(this)
    if (
      this._filterOptions &&
      hasProperty(this._filterOptions, 'initialValue')
    ) {
      this.value = this._optDefault('initialValue')
    }

    this.activeFilterLabel = this.filterStateChanges.pipe(
      startWith(undefined),
      map(() => {
        const state = this.filterState()
        const options = state.state.options as IToggleButtonsFilterOptions
        const selectedOptions = options.buttons
          .filter((o) => coerceArray(state.state.value).includes(o.value))
          .map((o) => o.name)

        return selectedOptions.length > 0
          ? selectedOptions.join(', ')
          : this.filterDropdownLabel || DATA_FILTER_TOGGLE_BUTTON_DROPDOWN_TEXT
      }),
    )
  }

  ngAfterViewInit(): void {
    this._resizeObserver = new ResizeObserver(() => this._updateCollapsed())

    if (
      notNullOrUndefined(this._elementRef.nativeElement.parentElement) &&
      this.disableCollapse !== true
    ) {
      this._resizeObserver.observe(this._elementRef.nativeElement.parentElement)
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['buttons'] && !changes['buttons'].firstChange) {
      this._updateCollapsed()
    }
  }

  ngOnDestroy(): void {
    this._filterContainer.removeFilter(this)
    this._resizeObserver?.disconnect()
  }

  private _optDefault<K extends keyof IToggleButtonsFilterOptions>(prop: K) {
    if (
      this._filterOptions &&
      Object.prototype.hasOwnProperty.call(this._filterOptions, prop)
    ) {
      return this._filterOptions[prop]
    }
    return DefaultToggleButtonsFilterOptions[prop]
  }

  get options(): IToggleButtonsFilterOptions {
    return {
      properties: this.properties,
      omitProperties: this.omitProperties,
      multiple: this.multiple,
      selectionToggleable: this.selectionToggleable,
      buttons: this.buttons,
      exact: this.exact,
      caseSensitive: this.caseSensitive,
      maxWidth: this.maxWidth,
      filterDropdownLabel: this.filterDropdownLabel,
      disableCollapse: this.disableCollapse,
    }
  }

  public filter<T>(data: T[]): Observable<T[]> {
    return this._control.valueChanges.pipe(
      map((v) => toggleButtonsFilter(data, coerceArray(v), this.options)),
      startWith(
        toggleButtonsFilter(
          data,
          coerceArray(this._control.value),
          this.options,
        ),
      ),
    )
  }

  private _updateCollapsed(): void {
    if (this.disableCollapse) {
      if (this.isCollapsed()) {
        this.isCollapsed.set(false)
      }

      return
    }
    if (!this._measureDiv) {
      return
    }
    const measureWidth = this._measureDiv.nativeElement.scrollWidth

    // Because of the flex layout, this element won't necessarily grow to its full
    // potential width when in collapsed mode, meaning it stays collapsed even
    // though there's room to expand. If this becomes a problem, we may need to use a
    // different strategy to determine when it's safe to show the full filter bar.
    const clientWidth =
      this._elementRef.nativeElement.parentElement?.clientWidth

    // Not enough information to determine collapsed state, so don't update it
    if (isNullOrUndefined(clientWidth)) {
      return
    }

    const threshold =
      this.maxWidth != null ? Math.min(clientWidth, this.maxWidth) : clientWidth
    this.isCollapsed.set(measureWidth > threshold)
  }

  public filterState(): DataFilterState {
    return {
      // id:
      name: this.filterName ?? this.name,
      state: {
        value: this._control.value,
        options: this.options,
      },
    }
  }
}
