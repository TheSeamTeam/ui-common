import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { TheSeamDatatableModule } from '../datatable.module'
import { DatatableRefreshButtonComponent } from './datatable-refresh-button.component'
import { TheSeamDatatableRefreshButtonHarness } from '../testing'

interface StoryArgs {
  columns: { prop: string; name: string }[]
  rows: Record<string, unknown>[]
  refreshRequested: () => void
}

const meta: Meta<DatatableRefreshButtonComponent & StoryArgs> = {
  title: 'Datatable/Components',
  component: DatatableRefreshButtonComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [TheSeamDatatableModule],
    }),
  ],
  argTypes: {
    refreshRequested: { action: 'refreshRequested' },
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
}

export default meta
type Story = StoryObj<DatatableRefreshButtonComponent & StoryArgs>

export const Refresh: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="vh-100 d-flex flex-column p-2">
        <seam-datatable
          [columns]="columns"
          [rows]="rows"
          (refreshRequested)="refreshRequested()">

          <seam-datatable-menu-bar>
            <div class="d-flex flex-row justify-content-end">
              <seam-datatable-refresh-button></seam-datatable-refresh-button>
            </div>
          </seam-datatable-menu-bar>

        </seam-datatable>
      </div>`,
  }),
  args: {
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' },
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ],
    refreshRequested: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await expect(args.refreshRequested).toHaveBeenCalledTimes(0)
    const harness = await getHarness(TheSeamDatatableRefreshButtonHarness, {
      canvasElement,
    })
    await harness.click()
    await expect(args.refreshRequested).toHaveBeenCalledTimes(1)
  },
}
