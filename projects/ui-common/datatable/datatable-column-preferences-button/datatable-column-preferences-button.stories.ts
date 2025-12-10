import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'
import { expect } from 'storybook/test'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { provideLocationMocks } from '@angular/common/testing'

import {
  CSVDataExporter,
  XLSXDataExporter,
} from '@theseam/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { getHarness } from '@theseam/ui-common/testing'

import { THESEAM_DATATABLE } from '../datatable/datatable.component'
import { TheSeamDatatableModule } from '../datatable.module'
import { ColumnsAlteration } from '../models/columns-alteration'
import {
  ColumnsAlterationsChangedRecord,
  ColumnsAlterationsManagerService,
} from '../services/columns-alterations-manager.service'
import { DatatablePreferencesAccessorLocalService } from '../stories/preferences-accessor-local'
import { TheSeamDatatableHarness } from '../testing'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { DatatableColumnPreferencesButtonComponent } from './datatable-column-preferences-button.component'

class MockDatatable {
  _columns = new BehaviorSubject<any>([
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
    { prop: 'color1', name: 'Color1' },
    { prop: 'color2', name: 'Color2' },
    { prop: 'color3', name: 'Color3' },
    { prop: 'color4', name: 'Color4' },
    { prop: 'color5', name: 'Color5' },
    { prop: 'color6', name: 'Color6' },
    { prop: 'color7', name: 'Color7' },
    { prop: 'color8', name: 'Color8' },
    { prop: 'color9', name: 'Color9' },
    { prop: 'color10', name: 'Color10' },
    { prop: 'color11', name: 'Color11' },
  ])

  get columns() {
    return this._columns.value
  }
  set columns(value: any) {
    this._columns.next(value)
  }

  columns$ = this._columns.asObservable()
}

class MockColumnsAlterationsManagerService
  implements Partial<ColumnsAlterationsManagerService>
{
  public add(
    alterations: ColumnsAlteration[],
    options?: { emitEvent?: boolean },
  ): ColumnsAlterationsChangedRecord[] {
    return []
  }
  public clear(options?: {
    emitEvent?: boolean
  }): ColumnsAlterationsChangedRecord[] {
    return []
  }
}

const meta: Meta<DatatableColumnPreferencesButtonComponent> = {
  title: 'Datatable/Components/Column Preferences',
  component: DatatableColumnPreferencesButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([]),
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: DatatablePreferencesAccessorLocalService,
        },
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDataFiltersModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
      ],
      providers: [
        // {
        //   provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
        //   useClass: DatatablePreferencesAccessorLocalService,
        // },
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
}

export default meta
type Story = StoryObj<DatatableColumnPreferencesButtonComponent>

export const Example: Story = {
  render: (args) => ({
    props: {
      __hack: {
        columns: [
          {
            prop: 'name',
            name: 'Name',
            // canAutoResize: false,
            width: 60,
            minWidth: 60,
            maxWidth: 60,
            resizeable: false,
          },
          { prop: 'age', name: 'Age' },
          { prop: 'color', name: 'Color' },
          { prop: 'color1', name: 'Color1' },
          { prop: 'color2', name: 'Color2' },
        ],
        rows: [
          {
            name: 'Markwwwwwwwwwwwwwwwwwww',
            color: 'bluewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
            color1: 'blue',
            color2: 'blue',
          },
          {
            name: 'Mark',
            age: '279999999999999999999999999999',
            color: 'blue',
            color1: 'blue',
            color2: 'blue',
          },
          {
            name: 'Joe',
            age: 33,
            color: 'green',
            color1: 'blue',
            color2: 'blue',
          },

          // { name: 'Mark', age: '.', color: 'blue', color1: 'blue', color2: 'blue' },
          // { name: 'Markwwwwwwwwwwwwwwwwwww', color: 'bluewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww', color1: 'blue', color2: 'blue' },
          // { name: 'Joe', color: 'green', color1: 'blue', color2: 'blue' },

          {
            name: 'Markwwwwwwwwwwwwwwwwwww',
            color: 'bluewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
            color1: 'blue',
            color2: 'blue',
          },
          { name: 'Mark', color: 'blue', color1: 'blue', color2: 'blue' },
          {
            name: 'Joe',
            age: 33,
            color: 'green',
            color1: 'blue',
            color2: 'blue',
          },
        ],
        exporters: [new CSVDataExporter(), new XLSXDataExporter()],
      },
      sorts: [
        { prop: 'age', dir: 'desc' },
        { prop: 'color', dir: 'asc' },
      ],
    },
    template: `
      <div class="vh-100 d-flex flex-column p-2">
        <seam-datatable
          preferencesKey="test-prefs-1"
          [columns]="__hack.columns"
          [rows]="__hack.rows"
          [sorts]="sorts"
          sortType="multi">

          <seam-datatable-menu-bar>
            <seam-data-filter-search seamDatatableFilter></seam-data-filter-search>
            <div class="d-flex flex-row justify-content-end">
              <seam-datatable-column-preferences-button></seam-datatable-column-preferences-button>
            </div>
          </seam-datatable-menu-bar>

          <!--<ng-template seamDatatableRowActionItem>
            <seam-datatable-action-menu>
              <seam-datatable-action-menu-item label="Action Item"></seam-datatable-action-menu-item>
            </seam-datatable-action-menu>
          </ng-template>-->

        </seam-datatable>
      </div>`,
  }),
  play: async ({ canvasElement, fixture }) => {
    const datatableHarness = await getHarness(TheSeamDatatableHarness, {
      canvasElement,
      fixture,
    })

    await expect(await datatableHarness.getCurrentPage()).toBe(1)
    // const page2BtnHarness = await (await datatableHarness.getPager()).getPageButtonHarness(2)
    // await (await page2BtnHarness.getAnchor()).click()
    // await expect(await datatableHarness.getCurrentPage()).toBe(2)
  },
}

export const Popover: Story = {
  render: (args) => ({
    moduleMetadata: {
      providers: [
        { provide: THESEAM_DATATABLE, useClass: MockDatatable },
        {
          provide: ColumnsAlterationsManagerService,
          useClass: MockColumnsAlterationsManagerService,
        },
      ],
    },
    props: {},
    template: `
      <div class="popover m-2">
        <div class="popover-body">
          <seam-datatable-column-preferences></seam-datatable-column-preferences>
        </div>
      </div>`,
  }),
}
