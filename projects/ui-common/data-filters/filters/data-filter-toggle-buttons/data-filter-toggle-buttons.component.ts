import { coerceArray } from '@angular/cdk/coercion'
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { hasProperty, isNullOrUndefined } from '@theseam/ui-common/utils'

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
  maxWidth?: number
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

  _isCollapsed = false

  @ViewChild('measureDiv') private _measureDiv!: ElementRef<HTMLElement>

  private readonly _hostEl = inject(ElementRef<HTMLElement>)
  private _resizeObserver: ResizeObserver | undefined

  @Input()
  set value(value: string | string[]) {
    const _value = !isNullOrUndefined(value) ? coerceArray(value) : undefined
    if (this._control.value !== _value) {
      this._control.setValue(_value)
    }
  }

  public readonly filterStateChanges: Observable<DataFilterState>

  constructor(
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
  }

  ngAfterViewInit(): void {
    this._resizeObserver = new ResizeObserver(() => this._updateCollapsed())
    this._resizeObserver.observe(this._hostEl.nativeElement)
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
    if (!this._measureDiv) {
      return
    }
    const measureWidth = this._measureDiv.nativeElement.scrollWidth
    const clientWidth = this._hostEl.nativeElement.clientWidth
    const threshold =
      this.maxWidth != null ? Math.min(clientWidth, this.maxWidth) : clientWidth
    this._isCollapsed = measureWidth > threshold
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
