import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faWrench } from '@fortawesome/free-solid-svg-icons'

import { TheSeamDatatableModule } from '../../../datatable/index'
import { TheSeamWidgetModule } from '../../widget.module'

// tslint:disable:quotemark
const GIN_DATA = [
  {
    "ginCode": "12345",
    "name": "Gin 1",
    "city": "SELMA",
    "state": "AL",
    "stateCode": 1,
    "countyCode": 1,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12346",
    "name": "Gin 2",
    "city": "WELCH",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12347",
    "name": "Gin 3",
    "city": "LAMESA",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12348",
    "name": "Gin 4",
    "city": "WELCH",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12349",
    "name": "Gin 5",
    "city": "RIO HONDO",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 61,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12350",
    "name": "Gin 6",
    "city": "RIO HONDO",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 61,
    "zipCode": "00000",
    "isRegistered": false
  },
  {
    "ginCode": "12351",
    "name": "Gin 7",
    "city": "LAMESA",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "00000",
    "isRegistered": false
  }
]
// tslint:enable:quotemark

storiesOf('Widget/Content/Table', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),

      displayedColumns: [
        { prop: 'ginCode', name: 'Gin Code' },
        { prop: 'name', name: 'Name' }
      ],
      dataSource: GIN_DATA
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-table [columns]="displayedColumns" [rows]="dataSource"></seam-widget-table>
        </seam-widget>
      </div>`
  }))

  .add('Small', () => ({
    moduleMetadata: {
      imports: [
        TheSeamWidgetModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      icon: faWrench,
      title: text('Header Title', 'Example Widget'),
      loading: boolean('Loading', false),

      displayedColumns: [
        { prop: 'ginCode', name: 'Gin Code' },
        { prop: 'name', name: 'Name' }
      ],
      dataSource: GIN_DATA
    },
    template: `
      <div class="p-1" style="max-height: 400px; width: 500px;">
        <seam-widget [icon]="icon" [titleText]="title" [loading]="loading">
          <seam-widget-table [columns]="displayedColumns" [rows]="dataSource" size="sm"></seam-widget-table>
        </seam-widget>
      </div>`
  }))
