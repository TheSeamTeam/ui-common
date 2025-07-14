import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR, TheSeamDatatableModule } from '@theseam/ui-common/datatable'

import { TheSeamDatatablePrompterComponent } from './datatable-prompter.component'
import { Observable, of } from 'rxjs'
import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'
import { provideAnimations } from '@angular/platform-browser/animations'

export class PreferencesAccessorService implements TheSeamPreferencesAccessor {
  private readonly _map = new Map<string, string>()

  public get(name: string): Observable<string> {
    // console.log(`Getting preference '${name}'`)
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
            sortType="multi" externalFiltering="true"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable" [prompt]="prompt"></seam-datatable-prompter>
      </div>
    `,
  }), // externalSorting="true" externalFiltering="true"
  args: {
    prompt: 'Is 33 years old',
    dt: {
      columns: [
        { prop: 'name', name: 'Name', filterable: true, filterOptions: { filterType: 'search-text' } },
        { prop: 'age', name: 'Age', filterable: true, filterOptions: { filterType: 'search-numeric' } },
        { prop: 'color', name: 'Color', filterable: true, filterOptions: { filterType: 'search-text' } },
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
      ],
    },
  },
  // play: async ({ canvasElement, fixture }) => {
  //   const requiredIndicatorHarness = await getHarness(TheSeamFormFieldRequiredIndicatorHarness, { canvasElement, fixture })
  //   await expect(await requiredIndicatorHarness.isIndicatorVisible()).toBe(false)

  //   const formFieldHarness = await getHarness(TheSeamFormFieldHarness, { canvasElement, fixture })
  //   await expect(await formFieldHarness.getLabel()).toBe('Example')
  // },
}
