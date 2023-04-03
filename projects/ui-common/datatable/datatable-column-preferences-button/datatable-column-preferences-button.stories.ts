import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'

import { CSVDataExporter, XLSXDataExporter } from '@theseam/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { TheSeamDatatableModule } from '../datatable.module'
import { THESEAM_DATATABLE } from '../datatable/datatable.component'
import { ColumnsAlteration } from '../models/columns-alteration'
import { ColumnsAlterationsChangedRecord, ColumnsAlterationsManagerService } from '../services/columns-alterations-manager.service'
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
    { prop: 'color11', name: 'Color11' }
  ])

  get columns() { return this._columns.value }
  set columns(value: any) { this._columns.next(value) }

  columns$ = this._columns.asObservable()

}

class MockColumnsAlterationsManagerService implements Partial<ColumnsAlterationsManagerService> {
  public add(alterations: ColumnsAlteration[], options?: { emitEvent?: boolean }): ColumnsAlterationsChangedRecord[] {
    return []
  }
  public clear(options?: { emitEvent?: boolean }): ColumnsAlterationsChangedRecord[] {
    return []
  }
}

export default {
  title: 'Datatable/Components/Column Preferences',
  component: DatatableColumnPreferencesButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDataFiltersModule,
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
      ],
      providers: [
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: DatatablePreferencesAccessorLocalService,
        },
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

export const Example: Story = (args) => ({
  props: {
    __hack: {
      columns: [
        { prop: 'name', name: 'Name', width: 300, },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color', width: 700 },
        { prop: 'color1', name: 'Color1', width: 700 },
        { prop: 'color2', name: 'Color2', width: 700 },
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue', color1: 'blue', color2: 'blue' },
        { name: 'Mark', color: 'blue', color1: 'blue', color2: 'blue' },
        { name: 'Joe', age: 33, color: 'green', color1: 'blue', color2: 'blue' },
      ],
      exporters: [
        new CSVDataExporter(),
        new XLSXDataExporter()
      ]
    },
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
          <seam-data-filter-search seamDatatableFilter></seam-data-filter-search>
          <div class="d-flex flex-row justify-content-end">
            <seam-datatable-column-preferences-button></seam-datatable-column-preferences-button>
          </div>
        </seam-datatable-menu-bar>

        <ng-template seamDatatableRowActionItem>
          <seam-datatable-action-menu>
            <seam-datatable-action-menu-item label="Action Item"></seam-datatable-action-menu-item>
          </seam-datatable-action-menu>
        </ng-template>

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
      { provide: THESEAM_DATATABLE, useClass: MockDatatable },
      { provide: ColumnsAlterationsManagerService, useClass: MockColumnsAlterationsManagerService },
    ],
  },
  props: { },
  template: `
    <div class="popover m-2">
      <div class="popover-body">
        <seam-datatable-column-preferences></seam-datatable-column-preferences>
      </div>
    </div>`,
})
