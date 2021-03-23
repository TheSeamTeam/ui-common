import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { TheSeamDatatableModule } from '@lib/ui-common/datatable'
import {
  DynamicActionApiService,
  DynamicActionLinkService,
  DynamicActionModalService,
  ExportersDataEvaluator,
  JexlEvaluator,
  THESEAM_DYNAMIC_ACTION,
  THESEAM_DYNAMIC_VALUE_EVALUATOR
} from '@lib/ui-common/dynamic'
import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

import { TableCellTypeProgressCircleComponent } from './table-cell-type-progress-circle.component'

export default {
  title: 'Components/TableCellTypes/ProgressCircle',
  component: TableCellTypeProgressCircleComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        BrowserAnimationsModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule
      ],
      providers: [
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },

        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionApiService, multi: true },
        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionLinkService, multi: true },
        { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionModalService, multi: true },
      ]
    })
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '150px',
    }
  }
} as Meta

export const NoConfig: Story = (args) => {
  const rows = [
    { completionPercent: args.value }
  ]
  return {
    template: `<seam-datatable class="vw-100 vh-100" [columns]="columns" [rows]="rows"></seam-datatable>`,
    props: {
      columns: [
        {
          prop: 'completionPercent',
          name: 'Completion',
          cellType: 'progress-circle-icon'
        }
      ],
      rows
    },
  }
}
NoConfig.args = {
  value: 75
}

export const WithConfig: Story = (args) => {
  const columns = [
    {
      prop: 'completionPercent',
      name: 'Completion',
      exportIgnore: true,
      cellType: 'progress-circle-icon',
      cellTypeConfig: {
        type: 'progress-circle-icon',
        styles: 'max-width: 40px; width: 40px; min-width: 40px;',
        titleAttr: 'Example title',
        pending: false,
        percentage: { type: 'jexl', expr: 'row.completionPercent' },
        tooltip: 'Example tooltip',
        tooltipClass: 'tooltip-large',
        tooltipContainer: 'body',
        action: {
          type: 'link',
          // link: 'https://google.com',
          link: './cars',
          external: false,
          // target: '_blank',
          // asset: { type: 'jexl', expr: 'row.primaryIconActionAsset' },
          detectMimeContent: true,
          queryParams: { test: 'thing' }
        }
      }
    }
  ]
  const rows = [
    { completionPercent: args.value }
  ]
  return {
    template: `<seam-datatable class="vw-100 vh-100" [columns]="columns" [rows]="rows"></seam-datatable>`,
    props: {
      columns,
      rows
    },
  }
}
WithConfig.args = {
  value: 75
}
