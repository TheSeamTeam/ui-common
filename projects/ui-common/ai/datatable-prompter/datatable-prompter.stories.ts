import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'
import { expect } from '@storybook/jest'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'

import { TheSeamDatatablePrompterComponent } from './datatable-prompter.component'

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
          <seam-datatable #datatable class="w-100 h-100" [columns]="dt.columns" [rows]="dt.rows" preferencesKey="prompter-prefs-1" sortType="multi"></seam-datatable>
        </div>
        <seam-datatable-prompter [datatable]="datatable"></seam-datatable-prompter>
      </div>
    `,
  }),
  args: {
    dt: {
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' },
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
