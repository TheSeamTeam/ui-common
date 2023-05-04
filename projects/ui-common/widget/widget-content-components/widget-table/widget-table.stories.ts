import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamWidgetModule } from '../../widget.module'
import { WidgetTableComponent } from './widget-table.component'

const GIN_DATA = [
  {
    'ginCode': '12345',
    'name': 'Gin 1',
    'city': 'SELMA',
    'state': 'AL',
    'stateCode': 1,
    'countyCode': 1,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 43897
  },
  {
    'ginCode': '12346',
    'name': 'Gin 2',
    'city': 'WELCH',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 115,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 786542
  },
  {
    'ginCode': '12347',
    'name': 'Gin 3',
    'city': 'LAMESA',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 115,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 9846
  },
  {
    'ginCode': '12348',
    'name': 'Gin 4',
    'city': 'WELCH',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 115,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 3548
  },
  {
    'ginCode': '12349',
    'name': 'Gin 5',
    'city': 'RIO HONDO',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 61,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 7561
  },
  {
    'ginCode': '12350',
    'name': 'Gin 6',
    'city': 'RIO HONDO',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 61,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 684615
  },
  {
    'ginCode': '12351',
    'name': 'Gin 7',
    'city': 'LAMESA',
    'state': 'TX',
    'stateCode': 48,
    'countyCode': 115,
    'zipCode': '00000',
    'isRegistered': false,
    'ginned': 65165
  }
]

export default {
  title: 'Widget/Components/Content/Table',
  component: WidgetTableComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamWidgetModule,
      ],
    }),
  ],
} as Meta

export const Basic: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    displayedColumns: [
      { prop: 'ginCode', name: 'Gin Code', cellType: 'integer', cellTypeConfig: { cellType: 'integer', formatNumber: false } },
      { prop: 'name', name: 'Name' },
      { prop: 'ginned', name: 'Lbs Ginned', cellType: 'integer' },
    ],
    dataSource: GIN_DATA,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <seam-widget-table [columns]="displayedColumns" [rows]="dataSource"></seam-widget-table>
      </seam-widget>
    </div>`,
})

export const Medium: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    displayedColumns: [
      { prop: 'ginCode', name: 'Gin Code', cellType: 'integer', cellTypeConfig: { cellType: 'integer', formatNumber: false } },
      { prop: 'name', name: 'Name' },
      { prop: 'ginned', name: 'Lbs Ginned', cellType: 'integer' },
    ],
    dataSource: GIN_DATA,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <seam-widget-table [columns]="displayedColumns" [rows]="dataSource" size="md"></seam-widget-table>
      </seam-widget>
    </div>`,
})

export const Small: Story = args => ({
  props: {
    ...args,
    icon: faWrench,
    displayedColumns: [
      { prop: 'ginCode', name: 'Gin Code', cellType: 'integer', cellTypeConfig: { cellType: 'integer', formatNumber: false } },
      { prop: 'name', name: 'Name' },
      { prop: 'ginned', name: 'Lbs Ginned', cellType: 'integer' },
    ],
    dataSource: GIN_DATA,
  },
  template: `
    <div class="p-1" style="max-height: 400px; width: 500px;">
      <seam-widget [icon]="icon" titleText="Example Widget" loading="false">
        <seam-widget-table [columns]="displayedColumns" [rows]="dataSource" size="sm"></seam-widget-table>
      </seam-widget>
    </div>`,
})
