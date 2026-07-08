import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import {
  DynamicActionApiService,
  DynamicActionLinkService,
  DynamicActionModalService,
  ExportersDataEvaluator,
  JexlEvaluator,
  THESEAM_DYNAMIC_ACTION,
  THESEAM_DYNAMIC_VALUE_EVALUATOR,
} from '@theseam/ui-common/dynamic'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import { TableCellTypeProgressCircleIconComponent } from './table-cell-type-progress-circle-icon.component'
import {
  faAirFreshener,
  faAllergies,
  faAmbulance,
} from '@fortawesome/free-solid-svg-icons'

interface TableCellTypeProgressCircleIconStoryArgs {
  displayIconProp: boolean
  iconProp?: 'faAirFreshener' | 'faAmbulance' | 'faAllergies'
  valueProp: number
}

const meta: Meta<
  TableCellTypeProgressCircleIconComponent &
    TableCellTypeProgressCircleIconStoryArgs
> = {
  title: 'Components/TableCellTypes/ProgressCircleIcon',
  component: TableCellTypeProgressCircleIconComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
        {
          provide: THESEAM_DYNAMIC_VALUE_EVALUATOR,
          useClass: JexlEvaluator,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_VALUE_EVALUATOR,
          useClass: ExportersDataEvaluator,
          multi: true,
        },

        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionApiService,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionLinkService,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionModalService,
          multi: true,
        },
      ],
    }),
    moduleMetadata({
      imports: [TheSeamDatatableModule, TheSeamTableCellTypesModule],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '150px',
    },
  },
}

export default meta
type Story = StoryObj<
  TableCellTypeProgressCircleIconComponent &
    TableCellTypeProgressCircleIconStoryArgs
>

export const NoConfig: Story = {
  render: (args) => {
    const rows = [{ completionPercent: args.value }]
    return {
      template: `<seam-datatable class="vw-100 vh-100" [columns]="columns" [rows]="rows"></seam-datatable>`,
      props: {
        columns: [
          {
            prop: 'completionPercent',
            name: 'Completion',
            cellType: 'progress-circle-icon',
          },
        ],
        rows,
      },
    }
  },
  args: {
    value: 75,
  },
}

export const WithConfig: Story = {
  render: (args) => {
    const columns = [
      {
        prop: 'completionPercent',
        name: 'Completion',
        exportIgnore: true,
        cellType: 'progress-circle-icon',
        cellTypeConfig: {
          type: 'progress-circle-icon',
          displayIcon: { type: 'jexl', expr: 'row.displayIcon' },
          icon: { type: 'jexl', expr: 'row.icon' },
          hiddenOnEmpty: { type: 'jexl', expr: 'true' },
          styles: 'max-width: 40px; width: 40px; min-width: 40px;',
          titleAttr: 'Example title',
          pending: false,
          percentage: { type: 'jexl', expr: 'row.completionPercent' },
          tooltip: 'Example tooltip',
          tooltipClass: 'tooltip-large',
          tooltipContainer: 'body',
          action: {
            type: 'link',
            link: './cars',
            external: false,
            detectMimeContent: true,
            queryParams: { test: 'thing' },
          },
        },
      },
    ]
    const rows = [
      {
        displayIcon: args.displayIconProp,
        icon: args.iconProp,
        completionPercent: args.valueProp,
      },
    ]

    return {
      template: `<seam-datatable class="vw-100 vh-100" [columns]="columns" [rows]="rows"></seam-datatable>`,
      props: {
        columns,
        rows,
      },
    }
  },
  args: {
    displayIconProp: true,
    iconProp: 'faAirFreshener',
    valueProp: 75,
  },
  argTypes: {
    displayIconProp: {
      control: { type: 'boolean' },
    },
    iconProp: {
      control: {
        type: 'select',
        labels: {
          undefined: 'None',
          faAirFreshener: 'Air Freshener',
          faAmbulance: 'Ambulance',
          faAllergies: 'Allergies',
        },
      },
      options: ['undefined', 'faAirFreshener', 'faAmbulance', 'faAllergies'],
      mapping: {
        undefined: undefined,
        faAirFreshener: faAirFreshener,
        faAmbulance: faAmbulance,
        faAllergies: faAllergies,
      },
    },
    valueProp: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
}
