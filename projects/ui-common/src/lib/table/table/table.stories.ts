import { action } from '@storybook/addon-actions'
import { boolean, select, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

import { TheSeamTableModule } from '../table.module'

// tslint:disable:quotemark
const GIN_DATA = [
  {
    "ginCode": "12345",
    "name": "Gin 1",
    "icon": faEnvelope
  },
  {
    "ginCode": "12346",
    "name": "Gin 2",
    "icon": faEnvelope
  },
  {
    "ginCode": "12347",
    "name": "Gin 3",
    "icon": faEnvelope
  },
  {
    "ginCode": "12348",
    "name": "Gin 4",
    "icon": faEnvelope
  },
  {
    "ginCode": "12349",
    "name": "Gin 5",
    "icon": faEnvelope
  },
  {
    "ginCode": "12350",
    "name": "Gin 6",
    "icon": faEnvelope
  },
  {
    "ginCode": "12351",
    "name": "Gin 7",
    "icon": faEnvelope
  }
]
// tslint:enable:quotemark

storiesOf('Components|Table', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        TheSeamTableModule
      ]
    },
    props: {
      displayedColumns: [
        {
          prop: 'icon',
          name: 'Icon',
          cellType: 'icon',
          cellTypeConfig: {
            type: 'icon',
            iconClass: { type: 'jexl', expr: 'name == "Gin 4" ? "text-danger" : "text-primary"' }
          }
        },
        { prop: 'ginCode', name: 'Gin Code' },
        { prop: 'name', name: 'Name' }
      ],
      dataSource: GIN_DATA
    },
    template: `<seam-table [columns]="displayedColumns" [rows]="dataSource"></seam-table>`
  }))

  .add('Medium', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        TheSeamTableModule
      ]
    },
    props: {
      displayedColumns: [
        {
          prop: 'icon',
          name: 'Icon',
          cellType: 'icon',
          cellTypeConfig: {
            type: 'icon'
          }
        },
        { prop: 'ginCode', name: 'Gin Code' },
        { prop: 'name', name: 'Name' }
      ],
      dataSource: GIN_DATA
    },
    template: `<seam-table [columns]="displayedColumns" [rows]="dataSource" size="md"></seam-table>`
  }))

  .add('Small', () => ({
    moduleMetadata: {
      imports: [
        BrowserAnimationsModule,
        TheSeamTableModule
      ]
    },
    props: {
      displayedColumns: [
        {
          prop: 'icon',
          name: 'Icon',
          cellType: 'icon',
          cellTypeConfig: {
            type: 'icon'
          }
        },
        { prop: 'ginCode', name: 'Gin Code' },
        { prop: 'name', name: 'Name' }
      ],
      dataSource: GIN_DATA
    },
    template: `<seam-table [columns]="displayedColumns" [rows]="dataSource" size="sm"></seam-table>`
  }))
