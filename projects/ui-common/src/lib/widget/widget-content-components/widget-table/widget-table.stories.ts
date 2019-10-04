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
    "ginCode": "07573",
    "name": "M. A. D. H. GIN, INC.",
    "city": "SELMA",
    "state": "AL",
    "stateCode": 1,
    "countyCode": 1,
    "zipCode": "36703",
    "isRegistered": false
  },
  {
    "ginCode": "72025",
    "name": "WELCH GIN, INC.",
    "city": "WELCH",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "79377",
    "isRegistered": false
  },
  {
    "ginCode": "72019",
    "name": "TEN MILE GIN",
    "city": "LAMESA",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "79331",
    "isRegistered": false
  },
  {
    "ginCode": "72025",
    "name": "WELCH GIN, INC.",
    "city": "WELCH",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "79377",
    "isRegistered": false
  },
  {
    "ginCode": "60238",
    "name": "R.G.V. GIN COMPANY, LLC",
    "city": "RIO HONDO",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 61,
    "zipCode": "78583",
    "isRegistered": false
  },
  {
    "ginCode": "60238",
    "name": "R.G.V. GIN COMPANY, LLC",
    "city": "RIO HONDO",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 61,
    "zipCode": "78583",
    "isRegistered": false
  },
  {
    "ginCode": "72014",
    "name": "ARVANA GIN",
    "city": "LAMESA",
    "state": "TX",
    "stateCode": 48,
    "countyCode": 115,
    "zipCode": "79331",
    "isRegistered": false
  }
]
// tslint:enable:quotemark

storiesOf('Widget/Content', module)
  .addDecorator(withKnobs)

  .add('Table', () => ({
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
