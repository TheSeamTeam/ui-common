import { ChangeDetectorRef, Component, inject, Input } from '@angular/core'
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

import { BehaviorSubject, combineLatest, map, Observable, of, switchMap } from 'rxjs'
import { ColumnsAlterationState, DatatableComponent, DatatablePreferencesService, EMPTY_DATATABLE_PREFERENCES, mapColumnsAlterationsStates, THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '@theseam/ui-common/datatable'
import { TheSeamLoadingModule } from '@theseam/ui-common/loading'
import { TheSeamRichTextModule } from '@theseam/ui-common/rich-text'

import { createSortsObservable } from './utils'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

const assistantPrompt = `You are a helpful assistant that provides formatting json code for a datatable.
A datatable is a table that displays data in rows and columns, similar to a spreadsheet, with column sorting and data filtering.

Your job is not to provide a descriptive analysis of the request or any additional information. The user will ignore anything that is not a JSON object.

The user will provide a request, and you will respond with a JSON object that contains an array of table alterations.
The following is the typescript interface for a datatable column and the alterations you can make to it:
\`\`\`typescript
interface TableColumn {
  /** Column property */
  prop: string,
  /** Column name */
  name: string,
  /** Whether the column is sortable */
  sortable?: boolean,
  /** Whether the column is filterable */
  filterable?: boolean,
  /** Whether the column is visible */
  visible?: boolean,
  /** Whether the column is resizable */
  resizable?: boolean,
  /** Whether the column is draggable */
  draggable?: boolean,
  /** Column width */
  width?: number,
  /** Column index */
  index?: number,
}

interface SortItem {
  /** Column property */
  prop: string,
  /** Sort direction */
  dir: 'asc' | 'desc'
}

interface SortState {
  /** The list of sorts */
  sorts: SortItem[]
}

interface OrderRecord {
  /** Column property */
  columnProp: string,
  /** Column order, which is the index that it will be placed in the columns array. */
  index: number
}

interface OrderState {
  /** The list of column order records */
  columns: OrderRecord[]
}

interface WidthState {
  /** The column property that this width alteration applies to */
  columnProp: string
  /** The width of the column. Number is in pixels. */
  width?: number
  /** Whether the column can auto resize. Needs to be false to guarantee a specific width. */
  canAutoResize: boolean
}

interface HideColumnState {
  /** The column property that this alteration applies to */
  columnProp: string
  /** Whether the column is hidden */
  hidden: boolean
}

interface FilterOperation {
  /** The filter operation type */
  type: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'notIn'
  /** The value to filter by */
  value: any
}

/**
 * The filter operation can be a single operation or a combination of operations.
 *
 * Example of a filter state for age greater than 18 and color contains "red":
 * \`\`\`json
 * {
 *   "filter": {
 *     "and": [
 *       { "age": { "gt": 18 } },
 *       { "color": { "contains": "red" } }
 *     ]
 *   }
 * }
 * \`\`\`
 *
 * "id" should always be "filter" for this alteration.
 */
interface FilterState {
  /**
   * The filter operation. Uses a mango-like expression.
   *
   * Recognized conditions:
   *  'eq' ~ equal to
   *  'neq' ~ not equal to
   *  'contains' ~ contains, which is a case-insensitive substring match
   *  'objectContains' ~ object contains, which stringifies the object and checks if the value is a substring of the stringified object
   *  'gt' ~ greater than
   *  'gte' ~ greater than or equal to
   *  'lt' ~ less than
   *  'lte' ~ less than or equal to
   *  'in' ~ in, which checks if the value is in the array
   *  'notIn' ~ not in, which checks if the value is not in the array
   * Recognized aggregations:
   *  'and' ~ logical AND, which combines multiple filter operations
   *  'or' ~ logical OR, which combines multiple filter operations
   *
   * Only a single operation is allowed in filter object, but aggregations can be used to combine multiple operations.
   * Example:
   * \`\`\`json
   * {
   *   "filter": {
   *     "and": [
   *       {
   *         "and": [
   *           { "age": { "gt": 20 } },
   *           { "age": { "lt": 40 } }
   *         ]
   *       },
   *       { "color": { "contains": "red" } }
   *     ]
   *   }
   * }
   * \`\`\`
   */
  filter: FilterOperation
}

interface TableAlteration<TType extends string, TState> {
  /**
   * Unique identifier for the alteration.
   *
   * This should be a unique string that identifies the alteration to avoid redundant alterations.
   */
  id: string
  /**
   * The type of alteration.
   *
   * This must be the exact string of the TType string, because it links to the handler that knows
   * how to apply that alteration.
   */
  type: TType
  /** The alteration state */
  state: TState
}

/**
 * Sort alteration for a datatable column.
 *
 * "id" should always be "sort" for this alteration.
 */
type SortAlteration = TableAlteration<'sort', SortsState>

/**
 * Order alteration for a datatable column.
 *
 * "id" should always be "order" for this alteration.
 */
type OrderAlteration = TableAlteration<'order', OrderState>

/**
 * Width alteration for a datatable column.
 *
 * "id" should always be "width-<prop>" for this alteration. So, for example, if the column property is "name", the id would be "width-name".
 */
type WidthAlteration = TableAlteration<'width', WidthState>

/**
 * Hide column alteration for a datatable column.
 *
 * "id" should always be "hide-column-<prop>" for this alteration. So, for example, if the column property is "name", the id would be "hide-column-name".
 */
type HideColumnAlteration = TableAlteration<'hide-column', HideColumnState>
\`\`\`
If the user provides the following columns:
\`\`\`json
[
  {
    "prop": "name",
    "name": "Name",
    "type": "string",
    "sortable": true,
    "filterable": true,
    "visible": true,
    "resizable": true,
    "draggable": true,
    "width": 200,
    "index": 0
  },
  {
    "prop": "age",
    "name": "Age",
    "type": "number",
    "sortable": true,
    "filterable": true,
    "visible": true,
    "resizable": true,
    "draggable": true
    "width": 100,
    "index": 1
  },
  {
    "prop": "color",
    "name": "Color",
    "type": "string",
    "sortable": true,
    "filterable": true,
    "visible": true,
    "resizable": true,
    "draggable": true
  }
]
\`\`\`
`

const getUserPrompt = (columns: any[], request: string): string => `
Columns:
\`\`\`json
${JSON.stringify(columns, null, 2)}
\`\`\`
Request: "${request}"
`

function parseResponse(responseContent: string, responseFormat: { type: string } | undefined) {
  if (responseFormat?.type === 'json_object') {
    return JSON.parse(responseContent)
  }

  // Parse the JSON string to an object, which is in the string between the code blocks.
  // So, need to find the first and last code block markers.
  const startIndex = responseContent.indexOf('```json') + '```json'.length
  const endIndex = responseContent.lastIndexOf('```')
  const alterations = responseContent.substring(startIndex, endIndex).trim()
  // console.log('Alterations:', alterations)

  return JSON.parse(alterations)
}

async function submitPrompt(prompt: string) {
  // Local
  // const url = 'http://localhost:1234/v1/chat/completions'
  // const headers = {
  //   'Content-Type': 'application/json',
  // }
  // const model = 'model-identifier'
  // const response_format = undefined

  // OpenRouter
  const url = 'https://openrouter.ai/api/v1/chat/completions'
  const apiKey = ''
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  const model = 'google/gemini-2.5-flash'
  const responseFormat = { 'type': 'json_object' }

  return fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'assistant',
          content: assistantPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: responseFormat,
    }),
  }).then(response => response.json()).then(data => {
    console.log('Response from AI:', data)

    const responseContent = data.choices[0].message.content

    console.log(`%cResponse from AI. content:\n${responseContent}`, 'color: limegreen;')

    // Replace "```json" at the start and "```" at the end
    // const alterations = responseContent.trim().replace(/^```json/, '').replace(/```$/, '').trim()

    // Parse the JSON string to an object, which is in the string between the code blocks.
    // So, need to find the first and last code block markers.
    // const startIndex = responseContent.indexOf('```json') + '```json'.length
    // const endIndex = responseContent.lastIndexOf('```')
    // const alterations = responseContent.substring(startIndex, endIndex).trim()

    // console.log('Alterations:', alterations)
    // return JSON.parse(alterations)

    return parseResponse(responseContent, responseFormat)
  }).catch(err => {
    console.error('Error submitting prompt:', err)
  })
}

// const PREFS_KEY = 'datatable-prompter'

const idx = 0

@Component({
  selector: 'seam-datatable-prompter',
  templateUrl: './datatable-prompter.component.html',
  styleUrls: ['./datatable-prompter.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    JsonPipe,
    NgForOf,
    NgIf,
    TheSeamLoadingModule,
    TheSeamRichTextModule,
    TheSeamFormFieldModule,
    TheSeamButtonsModule,
  ],
})
export class TheSeamDatatablePrompterComponent {
  // cdr = inject(ChangeDetectorRef)

  private readonly _prefsAccessor = inject(THESEAM_DATATABLE_PREFERENCES_ACCESSOR, { optional: true })
  private readonly _dtPrefsService = inject(DatatablePreferencesService)

  readonly _loadingSubject = new BehaviorSubject<boolean>(false)

  public readonly loading$ = this._loadingSubject.asObservable()

  @Input()
  set datatable(value: DatatableComponent | undefined | null) {
    this._datatableSubject.next(value)
  }
  get datatable(): DatatableComponent | undefined | null {
    return this._datatableSubject.value
  }
  private _datatableSubject = new BehaviorSubject<DatatableComponent | undefined | null>(null)

  readonly _form = new FormGroup({
    prompt: new FormControl<string | null>('Sort color descending order', [ Validators.required ]),
  })

  // _modifiers$ = combineLatest([
  //   createSortsObservable(this._datatableSubject.asObservable())
  // ]).pipe(
  //   map(([ sorts ]) => {
  //     console.log('sorts', sorts)
  //     return sorts.map(sort => ({
  //       type: 'sort',
  //       label: `Sort by ${sort.prop} (${sort.dir})`,
  //       value: sort,
  //     }))
  //   })
  // )

  _alterations$: Observable<ColumnsAlterationState[]> = this._datatableSubject.asObservable().pipe(
    switchMap(datatable => {
      if (!datatable) {
        return of([] as ColumnsAlterationState[])
      }
      const key = datatable.preferencesKey
      if (!key) {
        console.warn('No preferences key set on datatable, returning empty alterations.')
        return of([] as ColumnsAlterationState[])
      }

      return this._prefsAccessor?.get(key).pipe(
        switchMap(prefs => {
          if (!prefs) {
            return of(JSON.parse(JSON.stringify(EMPTY_DATATABLE_PREFERENCES)).alterations as ColumnsAlterationState[])
          }
          return of(JSON.parse(prefs).alterations as ColumnsAlterationState[])
        })
      ) ?? of([] as ColumnsAlterationState[])
    })
  )

  _onSubmit() {
    console.log('Submitting prompt:', this._form.value)
    if (this._form.invalid) {
      return
    }
    if (this._loadingSubject.value) {
      console.warn('Already loading, ignoring submit.')
      return
    }

    const prompt = this._form.value.prompt
    if (!prompt) {
      return
    }
    console.log('datatable', this._datatableSubject.value)
    const columns = (this._datatableSubject.value?.ngxDatatable?.columns || []).map(col => ({
      prop: col.prop,
      name: col.name,
      sortable: col.sortable,
      filterable: true,
      visible: true,
      resizable: col.resizeable,
      draggable: col.draggable,
    }))

    console.log('columns', columns)
    const userPrompt = getUserPrompt(columns, prompt)
    console.log('userPrompt', userPrompt)

    this._loadingSubject.next(true)
    submitPrompt(userPrompt).then(async alterations => {
      // this._form.reset()
      console.log('Received alterations:', alterations)
      const datatable = this._datatableSubject.value
      if (!datatable) {
        console.error('No datatable found to apply alterations to.')
        return
      }
      // const sorts = alterations.alterations.filter((mod: any) => mod.type === 'sort')
      //   .map((mod: any) => mod.value as { prop: string, dir: 'asc' | 'desc' })
      // console.log('Applying sorts to datatable:', sorts)
      // datatable.sorts = sorts
      // // const ngxDatatable = datatable.ngxDatatable!
      // // ngxDatatable.sorts = sorts
      // // this.cdr.detectChanges()

      // const key = `${PREFS_KEY}-${idx++}`
      const key = this.datatable!.preferencesKey as string

      const before = await this._prefsAccessor?.get(key).toPromise()
      console.log('Current preferences before update:', before)

      this._prefsAccessor?.update(key, JSON.stringify({
        version: 2,
        alterations,
      })).subscribe(async () => {
        console.log('Preferences updated successfully.')
        // this._dtPrefsService.refresh(key)
        // this.datatable!.preferencesKey = key
        const _cols = this.datatable!.ngxDatatable!.columns
        const cols = [ ..._cols ]
        console.log('this.datatable!.columns', cols)
        this.datatable!.columns = [ ...cols ]

        const after = await this._prefsAccessor?.get(key).toPromise()
        const _after = (JSON.parse(after || '{}').alterations || []) as ColumnsAlterationState[]
        console.log('Current preferences after update:', after)

        const mgr = (this.datatable as any)._columnsAlterationsManager
        console.log('_columnsAlterationsManager', mgr, mgr.get())
        const alts = mapColumnsAlterationsStates(_after)
        console.log('Mapped alterations:', alts)
        const columnsBefore = JSON.parse(JSON.stringify(this.datatable!.ngxDatatable!.columns.map(x => x.prop)))
        console.log('Columns before applying alterations:', columnsBefore)
        for (const a of alts) {
          if (a.type === 'filter') continue// Tmp filter alteration, not yet implemented.
          console.log('Applying alteration:', a)
          a.apply(cols, this.datatable!)
        }

        // Mock, until filter parse is finished.
        const filtersService = (this.datatable as any)._columnsFilters
        if (filtersService) {
          const subject = filtersService._columnsFilters as BehaviorSubject<any[]>
          const ageFilter = subject.value.find(f => f.column.prop === 'age')
          ageFilter.form.setValue({ searchType: 'gt', searchText: '30', fromText: '', toText: '' })
          const colorFilter = subject.value.find(f => f.column.prop === 'color')
          colorFilter.form.setValue({ searchType: 'contains', searchText: 'green' })

          // console.log('Mocked filters:', subject.value, ageFilter?.form.value, colorFilter?.form.value)
        }

        this.datatable!.columns = [ ...cols ]
        const columnsAfter = JSON.parse(JSON.stringify(this.datatable!.ngxDatatable!.columns.map(x => x.prop)))
        console.log('Columns after applying alterations:', columnsAfter)

        datatable.rows = [ ...datatable.rows ]
        datatable._cdr.detectChanges()

        this._loadingSubject.next(false)
      })
      // this._dtPrefsService.refresh(key)

      // const after = this._prefsAccessor?.get(key)
      // console.log('Current preferences after update:', after)

      // datatable.rows = [ ...datatable.rows ]
      // datatable._cdr.detectChanges()

      // this._loadingSubject.next(false)
    }).catch(err => {
      console.error('Error submitting prompt:', err)
      this._loadingSubject.next(false)
    })
  }

}
