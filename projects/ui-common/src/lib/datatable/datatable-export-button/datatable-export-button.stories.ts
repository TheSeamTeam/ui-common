import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { CSVDataExporter, XLSXDataExporter } from '@lib/ui-common/data-exporter'
import { TheSeamTableCellTypesModule } from '@lib/ui-common/table-cell-types'

import { TheSeamDatatableModule } from '../datatable.module'

storiesOf('Components/Datatable', module)

  .add('Exports', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule
      ]
    },
    props: {
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' }
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
      ],
      exporters: [
        new CSVDataExporter(),
        new XLSXDataExporter()
      ]
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
      </div>`
  }))
