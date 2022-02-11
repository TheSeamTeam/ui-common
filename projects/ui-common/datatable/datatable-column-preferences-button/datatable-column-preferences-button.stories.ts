import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BehaviorSubject, of } from 'rxjs'

import { CSVDataExporter, XLSXDataExporter } from '@theseam/ui-common/data-exporter'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamDatatableModule } from '../datatable.module'
import { THESEAM_DATATABLE } from '../datatable/datatable.component'
import { DatatableColumnPreferencesButtonComponent } from './datatable-column-preferences-button.component'
import { TheSeamDatatableHarness } from '../testing'
import { THESEAM_DATATABLE_PREFERENCES_ACCESSOR } from '../tokens/datatable-preferences-accessor'
import { DatatablePreferencesAccessorLocalService } from '../stories/preferences-accessor-local'

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
    { prop: 'color11', name: 'Color11' }
  ])

  get columns() { return this._columns.value }
  set columns(value: any) { this._columns.next(value) }

  columns$ = this._columns.asObservable()

}

export default {
  title: 'Datatable/Components/Column Preferences',
  component: DatatableColumnPreferencesButtonComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule
      ],
      providers: [
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: DatatablePreferencesAccessorLocalService
        }
      ]
    })
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    }
  }
} as Meta

export const Example: Story = (args) => ({
  props: {
    __hack: {
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
    }
  },
  template: `
    <div class="vh-100 d-flex flex-column p-2">
      <seam-datatable
        preferencesKey="test-prefs-1"
        [columns]="__hack.columns"
        [rows]="__hack.rows"
        selectionType="checkbox"
        sortType="multi">

        <seam-datatable-menu-bar>
          <div class="d-flex flex-row justify-content-end">
            <seam-datatable-column-preferences-button></seam-datatable-column-preferences-button>
          </div>
        </seam-datatable-menu-bar>

      </seam-datatable>
    </div>`
})
Example.play = async ({ canvasElement, fixture }) => {
  const datatableHarness = await getHarness(TheSeamDatatableHarness, { canvasElement, fixture })

  await expectFn(await datatableHarness.getCurrentPage()).toBe(1)
  // const page2BtnHarness = await (await datatableHarness.getPager()).getPageButtonHarness(2)
  // await (await page2BtnHarness.getAnchor()).click()
  // await expectFn(await datatableHarness.getCurrentPage()).toBe(2)
}

export const Popover: Story = (args) => ({
  moduleMetadata: {
    providers: [
      { provide: THESEAM_DATATABLE, useClass: MockDatatable }
    ]
  },
  props: { },
  template: `
    <div class="popover m-2">
      <div class="popover-body">
        <seam-datatable-column-preferences></seam-datatable-column-preferences>
      </div>
    </div>`
})
