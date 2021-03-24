import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import { TableCellTypePhoneComponent } from './table-cell-type-phone.component'

export default {
  title: 'Components/TableCellTypes/Phone',
  component: TableCellTypePhoneComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule
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
    { phoneNumber: args.value }
  ]
  return {
    template: `<seam-datatable class="vw-100 vh-100" [columns]="columns" [rows]="rows"></seam-datatable>`,
    props: {
      columns: [
        { prop: 'phoneNumber', phoneNumber: 'Phone Number', cellType: 'phone' }
      ],
      rows
    },
  }
}
NoConfig.args = {
  value: '9015555555'
}

export const WithConfig: Story = (args) => {
  const columns = [
    {
      prop: 'phoneNumber', phoneNumber: 'Phone Number',
      cellType: 'phone',
      cellTypeConfig: { type: 'phone', format: args.format }
    }
  ]
  const rows = [
    { phoneNumber: args.value }
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
  value: '9015555555'
}
WithConfig.argTypes = {
  format: {
    defaultValue: 'INTERNATIONAL',
    control: {
      type: 'select',
      options: [ 'E164', 'INTERNATIONAL', 'NATIONAL', 'RFC3966' ]
    }
  }
}
