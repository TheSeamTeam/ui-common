import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect, fn } from 'storybook/test'

import { addInjectorGetterToArgs } from '@theseam/ui-common/story-helpers'

import {
  DatatablePreferencesAccessorLocalService,
  provideDatatablePreferencesAccessorLocalActions,
} from './preferences-accessor-local'
import { TheSeamDatatableModule } from '../datatable.module'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import {
  MockPrefsApiConfig,
  MockPrefsApiService,
  provideMockPrefsApiService,
} from '../testing/fixtures/mock-prefs-api'
import { delay, of, startWith, tap } from 'rxjs'

interface ExtraArgs {
  get: typeof fn
  update: typeof fn
  delete: typeof fn
}

type StoryComponentType = ExtraArgs

const meta: Meta<StoryComponentType> = {
  title: 'Datatable/Preferences',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [TheSeamDatatableModule],
    }),
    addInjectorGetterToArgs(),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
  argTypes: {
    get: { action: 'get' },
    update: { action: 'update' },
    delete: { action: 'delete' },
  },
  args: {
    get: fn(),
    update: fn(),
    delete: fn(),
  },
}

export default meta
type Story = StoryObj<StoryComponentType>

export const Basic: Story = {
  render: (args) => ({
    applicationConfig: {
      providers: [
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: DatatablePreferencesAccessorLocalService,
        },
        provideDatatablePreferencesAccessorLocalActions({
          get: args.get,
          update: args.update,
          delete: args.delete,
        }),
      ],
    },
    props: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'amount', name: 'Amount' },
        { prop: 'active', name: 'Active' },
      ],
      rows: [
        { name: 'Thing', amount: 5, active: true },
        { name: 'Another Item', amount: 10, active: false },
        { name: 'Other', amount: 2, active: true },
      ],
    },
    template: `
        <div class="vw-100 vh-100 d-flex flex-column">
          <seam-datatable preferencesKey="story--basic" [columns]="columns" [rows]="rows"></seam-datatable>
        </div>
      `,
  }),
  play: async ({ args, canvasElement }) => {
    console.log('Story args:', args)
    // You can use the `canvasElement` to query elements within the story.
    const canvas = canvasElement.querySelector('seam-datatable') as HTMLElement

    // Example interaction: Verify that the datatable is rendered
    await expect(canvas).toBeTruthy()

    await new Promise((resolve) => setTimeout(resolve, 6))

    console.log('Story args3:', args)
  },
}

export const Api: Story = {
  render: (args) => ({
    applicationConfig: {
      providers: [
        provideMockPrefsApiService(
          {
            get: 100,
            update: 100,
            delete: 100,
          },
          {
            'story--basic': JSON.stringify({
              version: 2,
              alterations: [
                {
                  id: 'sort',
                  type: 'sort',
                  state: {
                    sorts: [
                      {
                        prop: 'name',
                        dir: 'desc',
                      },
                    ],
                  },
                },
              ],
            }),
          },
          {
            get: args.get,
            update: args.update,
            delete: args.delete,
          },
        ),
      ],
    },
    props: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'amount', name: 'Amount' },
        { prop: 'active', name: 'Active' },
      ],
      rows: [
        // { name: 'Thing', amount: 5, active: true },
        // { name: 'Another Item', amount: 10, active: false },
        // { name: 'Other', amount: 2, active: true },
      ],
      sorts: [{ dir: 'desc', prop: 'amount' }],
      loading: of(true).pipe(
        delay(5000),
        startWith(true),
        tap((val) => console.log('Loading:', val)),
      ),
    },
    template: `
      <div class="vw-100 vh-100 d-flex flex-column">
        <div>{{ loading | async }}</div>
        <seam-datatable preferencesKey="story--basic" [columns]="columns" [rows]="rows" [sorts]="sorts"
          [externalFiltering]="true"
          [externalSorting]="true"
          [loadingIndicator]="loading | async"></seam-datatable>
      </div>
    `,
  }),
  play: async ({ args }) => {
    await expect(args.get).toHaveBeenCalledOnce()

    // Wait for the mock API delay (100ms) to complete so the preferences
    // load, alterations apply, and refresh() triggers a second get() call.
    await new Promise((resolve) => setTimeout(resolve, 250))

    await expect(args.get).toHaveBeenCalledTimes(2)
  },
}
