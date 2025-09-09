import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'
import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BehaviorSubject, Observable, of } from 'rxjs'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR, TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'

import { TheSeamDatatablePrompterComponent } from './datatable-prompter.component'
import { THESEAM_DATATABLE_PROMPTER_PROVIDER, TheSeamDatatablePrompterProvider } from './datatable-prompter-prompt-provider'
import { OpenRouterAiProvider } from './ai-providers/openrouter.ai-provider'
import { AsyncPipe, NgIf } from '@angular/common'

export class PreferencesAccessorService implements TheSeamPreferencesAccessor {
  private readonly _map = new Map<string, string>()

  public get(name: string): Observable<string> {
    // console.log(`Getting preference '${name}'`, this._map.get(name))
    // const tmp = JSON.stringify({
    //   'version': 2,
    //   'alterations': [
    //     {
    //       'id': 'sort',
    //       'type': 'sort',
    //       'state': {
    //         'sorts': [
    //           {
    //             'prop': 'age',
    //             'dir': 'desc'
    //           }
    //         ]
    //       }
    //     }
    //   ]
    // })
    // return of(this._map.get(name) || tmp)
    return of(this._map.get(name) || '{}')
  }

  public update(name: string, value: string): Observable<string> {
    // console.log(`Updating preference '${name}' to`, value)
    this._map.set(name, value)
    // console.log(this._map.get(name))
    // console.log(JSON.stringify(JSON.parse(this._map.get(name) || '{}'), null, 2))
    return of(value)
  }

  public delete(name: string): Observable<boolean> {
    // console.log(`Deleting preference '${name}'`)
    this._map.delete(name)
    return of(true)
  }

}

export class MockAiProvider implements TheSeamDatatablePrompterProvider {

  async submit(prompt: string): Promise<any> {
    return Promise.resolve([
    {
      'id': 'filter--age',
      'type': 'filter',
      'state': {
        'columnProp': 'age',
        'filterType': 'text',
        'operation': 'eq',
        'value': '33',
      },
    },
  ] as any) as Promise<any>
  }
}

@Component({
  selector: 'story-set-key',
  template: `
    <div class="d-flex flex-column">
      <label for="key">API Key</label>
      <input id="key" type="text" class="form-control" [formControl]="_apiKeyControl" />
    </div>
    <button class="btn btn-primary mt-2" (click)="_localStorage.setItem('openrouter-api-key', _apiKeyControl.value ?? '')">Set Key</button>
    <!--<button class="btn btn-secondary mt-2" (click)="_refresh()">Refresh</button>
    <div class="mt-2">
      <span *ngIf="_loadingCreditSubject | async">Loading credits...</span>
      <span *ngIf="!(_loadingCreditSubject | async)">Credits: {{ _creditsSubject | async }}</span>
    </div>-->
  `,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    NgIf,
  ],
})
export class SetKeyComponent {
  _localStorage = localStorage
  _apiKeyControl = new FormControl<string>('')
  _loadingCreditSubject = new BehaviorSubject<boolean>(false)
  _creditsSubject = new BehaviorSubject<number>(0)

  _refresh() {
    this._loadingCreditSubject.next(true)
    const url = 'https://openrouter.ai/api/v1/credits'
    const apiKey = localStorage.getItem('openrouter-api-key') || ''
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }
    fetch(url, {
      method: 'GET',
      headers,
    }).then(response => response.json()).then(data => {
      console.log('Response from AI:', data)
      const credits = data.credits || 0
      console.log(`%cCredits: ${credits}`, 'color: limegreen;')
      this._creditsSubject.next(credits)
    })
    this._loadingCreditSubject.next(false)
  }
}

const dt = {
  columns: [
    { prop: 'name', name: 'Name', filterable: true, filterOptions: { filterType: 'search-text' } },
    { prop: 'age', name: 'Age', filterable: true, filterOptions: { filterType: 'search-numeric' } },
    { prop: 'color', name: 'Color', filterable: true, filterOptions: { filterType: 'search-text' } },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    // { name: 'Mark', age: 27, color: 'blue' },
    // { name: 'Joe', age: 33, color: 'green' },
    { name: 'Alice', age: 22, color: 'Blue' },
    { name: 'Bob', age: 35, color: 'Red' },
    { name: 'Clara', age: 28, color: 'Green' },
    { name: 'David', age: 41, color: 'Yellow' },
    { name: 'Emma', age: 19, color: 'Purple' },
    { name: 'Frank', age: 53, color: 'Orange' },
    { name: 'Grace', age: 30, color: 'Pink' },
    { name: 'Henry', age: 47, color: 'Brown' },
    { name: 'Isabel', age: 26, color: 'Teal' },
    { name: 'Jack', age: 38, color: 'Black' },
    { name: 'Katherine', age: 24, color: 'Violet' },
    { name: 'Liam', age: 50, color: 'Gold' },
    { name: 'Mia', age: 31, color: 'Silver' },
    { name: 'Noah', age: 27, color: 'Cyan' },
    { name: 'Olivia', age: 45, color: 'Magenta' },
    { name: 'Peter', age: 33, color: 'Lime' },
    { name: 'Quinn', age: 29, color: 'Indigo' },
    { name: 'Rachel', age: 36, color: 'Turquoise' },
    { name: 'Samuel', age: 42, color: 'Maroon' },
    { name: 'Tara', age: 21, color: 'Coral' }
  ],
}

interface ExtraArgs {
  dt?: {
    columns: any[]
    rows: any[]
  }
}

type StoryComponentType = TheSeamDatatablePrompterComponent & ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'AI/DatatablePrompter',
  tags: [ 'autodocs' ],
  component: TheSeamDatatablePrompterComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        // importProvidersFrom(
        //   RouterModule.forRoot([], { useHash: true }),
        // ),
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: PreferencesAccessorService
        },
        {
          provide: THESEAM_DATATABLE_PROMPTER_PROVIDER,
          // useClass: MockAiProvider,
          useClass: OpenRouterAiProvider
        },
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
      ],
    }),
    componentWrapperDecorator(story => `<div class="p-1" style="min-height: 100px; min-width: 800px;">${story}</div>`),
  ],
  parameters: {
    docs: {
      iframeHeight: '300px',
    },
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <div class="d-flex flex-column-reverse">
        <div style="height: 500px; width: 1200px; display: block;">
          <seam-datatable #datatable class="w-100 h-100" [columns]="dt.columns" [rows]="dt.rows" preferencesKey="prompter-prefs-1"
            sortType="multi"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable" [prompt]="prompt"></seam-datatable-prompter>
      </div>
    `,
  }), // externalSorting="true" externalFiltering="true"
  args: {
    prompt: 'Is 33 years old',
    dt,
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const requiredIndicatorHarness = await getHarness(TheSeamFormFieldRequiredIndicatorHarness, { canvasElement, fixture })
  //   await expect(await requiredIndicatorHarness.isIndicatorVisible()).toBe(false)

  //   const formFieldHarness = await getHarness(TheSeamFormFieldHarness, { canvasElement, fixture })
  //   await expect(await formFieldHarness.getLabel()).toBe('Example')
  // },
}

export const NoAlts: Story = {
  render: args => ({
    props: args,
    template: `
      <div class="d-flex flex-column-reverse">
        <div style="height: 500px; width: 1200px; display: block;">
          <seam-datatable #datatable class="w-100 h-100" [columns]="dt.columns" [rows]="dt.rows" preferencesKey="prompter-prefs-1"
            sortType="multi"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable" [prompt]="prompt" [showAlts]="false"></seam-datatable-prompter>
      </div>
    `,
  }), // externalSorting="true" externalFiltering="true"
  args: {
    prompt: 'Is 33 years old',
    dt,
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const requiredIndicatorHarness = await getHarness(TheSeamFormFieldRequiredIndicatorHarness, { canvasElement, fixture })
  //   await expect(await requiredIndicatorHarness.isIndicatorVisible()).toBe(false)

  //   const formFieldHarness = await getHarness(TheSeamFormFieldHarness, { canvasElement, fixture })
  //   await expect(await formFieldHarness.getLabel()).toBe('Example')
  // },
}

export const AltsCompact: Story = {
  render: args => ({
    props: args,
    template: `
      <div class="d-flex flex-column-reverse">
        <div style="height: 500px; width: 1200px; display: block;">
          <seam-datatable #datatable class="w-100 h-100" [columns]="dt.columns" [rows]="dt.rows" preferencesKey="prompter-prefs-1"
            sortType="multi"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable" [prompt]="prompt" [compact]="true"></seam-datatable-prompter>
      </div>
    `,
  }), // externalSorting="true" externalFiltering="true"
  args: {
    prompt: 'Is 33 years old',
    dt,
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const requiredIndicatorHarness = await getHarness(TheSeamFormFieldRequiredIndicatorHarness, { canvasElement, fixture })
  //   await expect(await requiredIndicatorHarness.isIndicatorVisible()).toBe(false)

  //   const formFieldHarness = await getHarness(TheSeamFormFieldHarness, { canvasElement, fixture })
  //   await expect(await formFieldHarness.getLabel()).toBe('Example')
  // },
}

export const AltsExpanded: Story = {
  render: args => ({
    props: args,
    template: `
      <div class="d-flex flex-column-reverse">
        <div style="height: 500px; width: 1200px; display: block;">
          <seam-datatable #datatable class="w-100 h-100" [columns]="dt.columns" [rows]="dt.rows" preferencesKey="prompter-prefs-1"
            sortType="multi"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable" [prompt]="prompt" [compact]="false"></seam-datatable-prompter>
      </div>
    `,
  }), // externalSorting="true" externalFiltering="true"
  args: {
    prompt: 'Is 33 years old',
    dt,
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const requiredIndicatorHarness = await getHarness(TheSeamFormFieldRequiredIndicatorHarness, { canvasElement, fixture })
  //   await expect(await requiredIndicatorHarness.isIndicatorVisible()).toBe(false)

  //   const formFieldHarness = await getHarness(TheSeamFormFieldHarness, { canvasElement, fixture })
  //   await expect(await formFieldHarness.getLabel()).toBe('Example')
  // },
}

export const SetKey: Story = {
  render: () => ({
    template: `
      <story-set-key></story-set-key>
    `,
  }),
  decorators: [
    moduleMetadata({
      imports: [SetKeyComponent],
    }),
  ],
}
