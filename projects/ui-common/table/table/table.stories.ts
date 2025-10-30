import { applicationConfig, moduleMetadata } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

import {
  DataFilterSearchComponent,
  DataFilterTextComponent,
  DataFilterToggleButtonsComponent,
  THESEAM_DATA_FILTER_OPTIONS,
} from '@theseam/ui-common/data-filters'
import { DatatableExportButtonComponent } from '@theseam/ui-common/datatable'
import { THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM } from '@theseam/ui-common/datatable-dynamic'
import {
  DynamicActionApiService,
  DynamicActionLinkService,
  DynamicActionModalService,
  JexlEvaluator,
  THESEAM_DYNAMIC_ACTION,
  THESEAM_DYNAMIC_DATA,
  THESEAM_DYNAMIC_VALUE_EVALUATOR,
} from '@theseam/ui-common/dynamic'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import { TheSeamTableModule } from '../table.module'
import { TableComponent } from './table.component'

export default {
  title: 'Table/Components',
  component: TableComponent,
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
      ],
    }),
    moduleMetadata({
      imports: [TheSeamTableModule, TheSeamTableCellTypesModule],
      providers: [
        // { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        // { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionApiService, multi: true },
        // { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionLinkService, multi: true },
        // { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionModalService, multi: true },
        // {
        //   provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
        //   useValue: { name: 'filter-search', component: DataFilterSearchComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
        //   multi: true
        // },
        // {
        //   provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
        //   useValue: { name: 'filter-text', component: DataFilterTextComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
        //   multi: true
        // },
        // {
        //   provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
        //   useValue: { name: 'filter-buttons', component: DataFilterToggleButtonsComponent, dataToken: THESEAM_DATA_FILTER_OPTIONS },
        //   multi: true
        // },
        // {
        //   provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
        //   useValue: { name: 'export-button', component: DatatableExportButtonComponent, dataToken: THESEAM_DYNAMIC_DATA },
        //   multi: true
        // }
      ],
    }),
  ],
  parameters: {
    docs: {
      iframeHeight: '450px',
    },
  },
}

export const Basic = () => ({
  props: {
    columns: [
      {
        prop: 'icon',
        name: 'Icon',
        cellType: 'icon',
        cellTypeConfig: {
          type: 'icon',
          iconClass: {
            type: 'jexl',
            expr: 'row.name == "Gin 4" ? "text-danger" : "text-primary"',
          },
        },
      },
      { prop: 'ginCode', name: 'Gin Code' },
      {
        prop: 'name',
        name: 'Name',
        cellType: 'string',
        cellTypeConfig: {
          type: 'string',
          action: {
            type: 'link',
            link: { type: 'jexl', expr: '"page/" + row.name' },
          },
        },
      },
    ],
    rows: [
      { ginCode: '12345', name: 'Gin 1', icon: faEnvelope },
      { ginCode: '12346', name: 'Gin 2', icon: faEnvelope },
      { ginCode: '12347', name: 'Gin 3', icon: faEnvelope },
      { ginCode: '12348', name: 'Gin 4', icon: faEnvelope },
      {
        ginCode: '12349',
        name: 'Gin 5',
        icon: 'assets/images/theseam_logo_notext.svg',
      },
      {
        ginCode: '12350',
        name: 'Gin 6',
        icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
      },
      { ginCode: '12351', name: 'Gin 7', icon: 'assets/images/ginner-med.svg' },
    ],
  },
  template: `<seam-table [columns]="columns" [rows]="rows"></seam-table>`,
})

export const Medium = () => ({
  props: {
    columns: [
      {
        prop: 'icon',
        name: 'Icon',
        cellType: 'icon',
        cellTypeConfig: {
          type: 'icon',
        },
      },
      { prop: 'ginCode', name: 'Gin Code' },
      { prop: 'name', name: 'Name' },
    ],
    rows: [
      { ginCode: '12345', name: 'Gin 1', icon: faEnvelope },
      { ginCode: '12346', name: 'Gin 2', icon: faEnvelope },
      { ginCode: '12347', name: 'Gin 3', icon: faEnvelope },
      { ginCode: '12348', name: 'Gin 4', icon: faEnvelope },
      {
        ginCode: '12349',
        name: 'Gin 5',
        icon: 'assets/images/theseam_logo_notext.svg',
      },
      {
        ginCode: '12350',
        name: 'Gin 6',
        icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
      },
      { ginCode: '12351', name: 'Gin 7', icon: 'assets/images/ginner-med.svg' },
    ],
  },
  template: `<seam-table [columns]="columns" [rows]="rows" size="md"></seam-table>`,
})

export const Small = () => ({
  props: {
    columns: [
      {
        prop: 'icon',
        name: 'Icon',
        cellType: 'icon',
        cellTypeConfig: {
          type: 'icon',
        },
      },
      { prop: 'ginCode', name: 'Gin Code' },
      {
        prop: 'name',
        name: 'Name',
        cellType: 'string',
        cellTypeConfig: {
          type: 'string',
          action: {
            type: 'link',
            link: { type: 'jexl', expr: '"page/" + row.name' },
          },
        },
      },
    ],
    rows: [
      { ginCode: '12345', name: 'Gin 1', icon: faEnvelope },
      { ginCode: '12346', name: 'Gin 2', icon: faEnvelope },
      { ginCode: '12347', name: 'Gin 3', icon: faEnvelope },
      { ginCode: '12348', name: 'Gin 4', icon: faEnvelope },
      {
        ginCode: '12349',
        name: 'Gin 5',
        icon: 'assets/images/theseam_logo_notext.svg',
      },
      {
        ginCode: '12350',
        name: 'Gin 6',
        icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
      },
      { ginCode: '12351', name: 'Gin 7', icon: 'assets/images/ginner-med.svg' },
    ],
  },
  template: `<seam-table [columns]="columns" [rows]="rows" size="sm"></seam-table>`,
})

export const HeaderTpl = {
  render: (args: any) => ({
    props: {
      columns: [
        {
          prop: 'icon',
          name: 'Icon',
          cellType: 'icon',
          cellTypeConfig: {
            type: 'icon',
          },
        },
        { prop: 'ginCode', name: 'Gin Code' },
        {
          prop: 'name',
          name: 'Name',
          cellType: 'string',
          cellTypeConfig: {
            type: 'string',
            action: {
              type: 'link',
              link: { type: 'jexl', expr: '"page/" + row.name' },
            },
          },
        },
      ],
      rows: [
        { ginCode: '12345', name: 'Gin 1', icon: faEnvelope },
        { ginCode: '12346', name: 'Gin 2', icon: faEnvelope },
        { ginCode: '12347', name: 'Gin 3', icon: faEnvelope },
        { ginCode: '12348', name: 'Gin 4', icon: faEnvelope },
        {
          ginCode: '12349',
          name: 'Gin 5',
          icon: 'assets/images/theseam_logo_notext.svg',
        },
        {
          ginCode: '12350',
          name: 'Gin 6',
          icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
        },
        {
          ginCode: '12351',
          name: 'Gin 7',
          icon: 'assets/images/ginner-med.svg',
        },
      ],
    },
    template: `<seam-table [columns]="columns" [rows]="rows" size="sm">
      <seam-table-column prop="ginCode" headerClass="p-0">
        <ng-template seamTableColumnHeaderTpl let-value let-prop="prop" let-column="column">
          <div class="d-flex flex-column">
            <div>Custom</div>
            <div class="d-flex flex-row">
              <div style="flex: 1 1 50%;">Type</div>
              <div style="flex: 1 1 50%;">Amount</div>
            </div>
          </div>
        </ng-template>
      </seam-table-column>
    </seam-table>`,
  }),
}

export const CellTpl = {
  render: (args: any) => ({
    props: {
      columns: [
        {
          prop: 'icon',
          name: 'Icon',
          cellType: 'icon',
          cellTypeConfig: {
            type: 'icon',
          },
        },
        { prop: 'ginCode', name: 'Gin Code' },
        {
          prop: 'name',
          name: 'Name',
          cellType: 'string',
          cellTypeConfig: {
            type: 'string',
            action: {
              type: 'link',
              link: { type: 'jexl', expr: '"page/" + row.name' },
            },
          },
        },
      ],
      rows: [
        { ginCode: '12345', name: 'Gin 1', icon: faEnvelope },
        { ginCode: '12346', name: 'Gin 2', icon: faEnvelope },
        { ginCode: '12347', name: 'Gin 3', icon: faEnvelope },
        { ginCode: '12348', name: 'Gin 4', icon: faEnvelope },
        {
          ginCode: '12349',
          name: 'Gin 5',
          icon: 'assets/images/theseam_logo_notext.svg',
        },
        {
          ginCode: '12350',
          name: 'Gin 6',
          icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
        },
        {
          ginCode: '12351',
          name: 'Gin 7',
          icon: 'assets/images/ginner-med.svg',
        },
      ],
    },
    template: `<seam-table [columns]="columns" [rows]="rows" size="sm">
      <seam-table-column prop="ginCode">
        <ng-template seamTableCellTpl let-value let-row="row" let-column="column">
          [{{ value }}]~cell
        </ng-template>
      </seam-table-column>
    </seam-table>`,
  }),
}

export const ColumnAlign = () => ({
  props: {
    columns: [
      {
        prop: 'icon',
        name: 'Icon',
        cellType: 'icon',
        cellTypeConfig: {
          type: 'icon',
          iconClass: {
            type: 'jexl',
            expr: 'row.name == "Gin 4" ? "text-danger" : "text-primary"',
          },
        },
      },
      { prop: 'ginCode', name: 'Gin Code' },
      {
        prop: 'name',
        name: 'Name',
        cellType: 'string',
        cellTypeConfig: {
          type: 'string',
          action: {
            type: 'link',
            link: { type: 'jexl', expr: '"page/" + row.name' },
          },
        },
      },
      {
        prop: 'oldAlign',
        name: 'Old Align',
        cellClass: 'text-right',
        headerClass: 'text-right',
      },
      {
        prop: 'right',
        name: 'Right',
        align: 'right',
      },
      {
        prop: 'center',
        name: 'Center',
        align: 'center',
      },
      {
        prop: 'rHeader',
        name: 'R Header',
        alignHeader: 'right',
      },
    ],
    rows: [
      {
        ginCode: '12345',
        name: 'Gin 1',
        icon: faEnvelope,
        oldAlign: 'one',
        right: 'one',
        center: 'one',
        rHeader: 'one',
      },
      {
        ginCode: '12346',
        name: 'Gin 2',
        icon: faEnvelope,
        oldAlign: 'two',
        right: 'two',
        center: 'two',
        rHeader: 'two',
      },
      {
        ginCode: '12347',
        name: 'Gin 3',
        icon: faEnvelope,
        oldAlign: 'three',
        right: 'three',
        center: 'three',
        rHeader: 'three',
      },
      {
        ginCode: '12348',
        name: 'Gin 4',
        icon: faEnvelope,
        oldAlign: 'four',
        right: 'four',
        center: 'four',
        rHeader: 'four',
      },
      {
        ginCode: '12349',
        name: 'Gin 5',
        icon: 'assets/images/theseam_logo_notext.svg',
        oldAlign: 'five',
        right: 'five',
        center: 'five',
        rHeader: 'five',
      },
      {
        ginCode: '12350',
        name: 'Gin 6',
        icon: 'https://ipfs.theseam.com/ipfs/QmenVkw7UcU6SLYfdLp6qWioQJQ2Tur8qrWj5SoV5AdF1k',
        oldAlign: 'six',
        right: 'six',
        center: 'six',
        rHeader: 'six',
      },
      {
        ginCode: '12351',
        name: 'Gin 7',
        icon: 'assets/images/ginner-med.svg',
        oldAlign: 'seven',
        right: 'seven',
        center: 'seven',
        rHeader: 'seven',
      },
    ],
  },
  template: `<seam-table [columns]="columns" [rows]="rows"></seam-table>`,
})
