import { ChangeDetectorRef, Component, inject, Input } from '@angular/core'
import { AsyncPipe, JsonPipe, NgForOf } from '@angular/common'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs'
import { DatatableComponent } from '@theseam/ui-common/datatable'

import { createSortsObservable } from './utils'

const assistantPrompt = `You are a helpful assistant that provides formatting json code for a datatable.
A datatable is a table that displays data in rows and columns, similar to a spreadsheet, with column sorting and data filtering.
The user will provide a request, and you will respond with a JSON object that contains an array of table modifications.
The following is the typescript interface for a datatable column and the modifications you can make to it:
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
}

interface SortItem {
  /** Column property */
  prop: string,
  /** Sort direction */
  dir: 'asc' | 'desc'
}

interface TableModification {
  type: 'sort' | 'filter' | 'columnVisibility' | 'columnOrder'
}

interface SortModification extends TableModification {
  type: 'sort'
  value: SortItem
}
\`\`\`
If the user provides the following columns:
\`\`\`json
[
  {
    "prop": "name",
    "name": "Name",
    "sortable": true,
    "filterable": true,
    "visible": true,
    "resizable": true,
    "draggable": true
  },
  {
    "prop": "age",
    "name": "Age",
    "sortable": true,
    "filterable": true,
    "visible": true,
    "resizable": true,
    "draggable": true
  }
]
\`\`\`
And the user provides the following request: "Sort by name in ascending order and age in descending order.",
You should respond with the following JSON object:
\`\`\`
{
  "modifications": [
    {
      "type": "sort",
      "value": {
        "prop": "name",
        "dir": "asc"
      }
    },
    {
      "type": "sort",
      "value": {
        "prop": "age",
        "dir": "desc"
      }
    }
  ]
}
`

const getUserPrompt = (columns: any[], request: string): string => `
Columns:
\`\`\`json
${JSON.stringify(columns, null, 2)}
\`\`\`
Request: "${request}"
`

async function submitPrompt(prompt: string) {
  return fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'model-identifier',
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
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Response from AI:', data)

      // Replace "```json" at the start and "```" at the end
      const modifications = data.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '').trim()
      console.log('Modifications:', modifications)
      return JSON.parse(modifications)
    })
    .catch(err => {
      console.error('Error submitting prompt:', err)
    })
}

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
  ],
})
export class TheSeamDatatablePrompterComponent {
  // cdr = inject(ChangeDetectorRef)

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

  _modifiers$ = combineLatest([
    createSortsObservable(this._datatableSubject.asObservable())
  ]).pipe(
    map(([ sorts ]) => {
      console.log('sorts', sorts)
      return sorts.map(sort => ({
        type: 'sort',
        label: `Sort by ${sort.prop} (${sort.dir})`,
        value: sort,
      }))
    })
  )

  _onSubmit() {
    console.log('Submitting prompt:', this._form.value)
    if (this._form.invalid) {
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

    submitPrompt(userPrompt)
      .then(modifications => {
        // this._form.reset()
        console.log('Received modifications:', modifications)
        const datatable = this._datatableSubject.value
        if (!datatable) {
          console.error('No datatable found to apply modifications to.')
          return
        }
        const sorts = modifications.modifications.filter((mod: any) => mod.type === 'sort')
          .map((mod: any) => mod.value as { prop: string, dir: 'asc' | 'desc' })
        console.log('Applying sorts to datatable:', sorts)
        datatable.sorts = sorts
        // const ngxDatatable = datatable.ngxDatatable!
        // ngxDatatable.sorts = sorts
        // this.cdr.detectChanges()

        datatable.rows = [ ...datatable.rows ]

        datatable._cdr.detectChanges()
      })
      .catch(err => {
        console.error('Error submitting prompt:', err)
      })
  }

}
