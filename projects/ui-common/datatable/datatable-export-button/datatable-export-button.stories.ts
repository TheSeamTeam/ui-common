import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { CSVDataExporter, XLSXDataExporter } from '@theseam/ui-common/data-exporter'
import { ExportersDataEvaluator, JexlEvaluator, THESEAM_DYNAMIC_VALUE_EVALUATOR } from '@theseam/ui-common/dynamic'
import { StoryToastrService } from '@theseam/ui-common/story-helpers'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { ToastrService } from 'ngx-toastr'

import { TheSeamDatatableModule } from '../datatable.module'
import { DatatableExportButtonComponent } from './datatable-export-button.component'

export default {
  title: 'Datatable/Components',
  component: DatatableExportButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
      ],
      providers: [
        { provide: ToastrService, useClass: StoryToastrService },
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
} as Meta

export const Exports: Story = args => ({
  props: {
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' },
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ],
    exporters: [
      new CSVDataExporter(),
      new XLSXDataExporter(),
    ],
  },
  template: `
    <div class="vh-100 d-flex flex-column p-2">
      <seam-datatable
        [columns]="columns"
        [rows]="rows">

        <seam-datatable-menu-bar>
          <div class="d-flex flex-row justify-content-end">
            <seam-datatable-export-button [exporters]="exporters"></seam-datatable-export-button>
          </div>
        </seam-datatable-menu-bar>

      </seam-datatable>
    </div>`,
})
