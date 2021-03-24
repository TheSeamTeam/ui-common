import { action } from '@storybook/addon-actions'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { Component, Input, ViewChild } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'
import { ExportersDataEvaluator, JexlEvaluator, THESEAM_DYNAMIC_VALUE_EVALUATOR } from '@theseam/ui-common/dynamic'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'

import { TheSeamDatatableModule } from '../datatable.module'
import { DatatableComponent } from './datatable.component'


export default {
  title: 'Components/Datatable',
  component: DatatableComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule
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

export const Simple: Story = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' }
    ]
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
      </seam-datatable>
    </div>
  `
})

export const ColumnTemplate = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ]
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
        <seam-datatable-column name="Color" prop="color">
          <ng-template seamDatatableCellTpl let-value="value">
            <span *ngIf="value === 'blue'; else notBlue" style="color: blue;">{{ value }}</span>
            <ng-template #notBlue>{{ value }}</ng-template>
          </ng-template>
        </seam-datatable-column>
      </seam-datatable>
    </div>`
})

export const ActionMenu = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ]
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
        <ng-template seamDatatableRowActionItem let-row>
          <seam-datatable-action-menu>
            <seam-datatable-action-menu-item label="Action One"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Two"></seam-datatable-action-menu-item>
          </seam-datatable-action-menu>
        </ng-template>
      </seam-datatable>
    </div>`
})

export const InlineEdit = (args) => ({
  moduleMetadata: {
    imports: [
      ReactiveFormsModule
    ]
  },
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'active', name: 'Active' }
    ],
    rows: [
      { name: 'Mark', age: 27, active: true, control: new FormControl(true) },
      { name: 'Joe', age: 33, active: false, control: new FormControl(false) },
    ],
    toggled: action('toggled')
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
        <seam-datatable-column name="Active" prop="active">
          <ng-template seamDatatableCellTpl let-value="value" let-row="row" let-rowIndex="rowIndex">
            <div class="custom-control custom-switch">
              <input type="checkbox" class="custom-control-input" id="customSwitch{{ rowIndex }}"
                [formControl]="row.control"
                (change)="toggled($event, row)">
              <label class="custom-control-label" for="customSwitch{{ rowIndex }}">Toggle</label>
            </div>
          </ng-template>
        </seam-datatable-column>
      </seam-datatable>
    </div>`
})

export const CheckboxSelection = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Joe', age: 33, color: 'green' },
    ],

    selected: [],
    selectAllRowsOnPage: false,
    onSelect({ selected }) {
      action('select')(selected)

      this.selected.splice(0, this.selected.length)
      this.selected.push(...selected)
    }
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [selected]="selected"
        [selectionType]="'checkbox'"
        [selectAllRowsOnPage]="selectAllRowsOnPage"
        (select)="onSelect($event)">
      </seam-datatable>
    </div>`
})

export const ToggleDisplay = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue' },
      { name: 'Adam', age: 40, color: 'red' },
      { name: 'Joe', age: 33, color: 'green' },
    ],

    selected: [],
    selectAllRowsOnPage: false,
    displayCheck(row) {
      return row.name !== 'Adam'
    },
    onSelect({ selected }) {
      action('select')(selected)

      this.selected.splice(0, this.selected.length)
      this.selected.push(...selected)
    }
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [selected]="selected"
        [selectionType]="'checkbox'"
        [selectAllRowsOnPage]="selectAllRowsOnPage"
        [displayCheck]="displayCheck"
        (select)="onSelect($event)">
      </seam-datatable>
    </div>`
})

// NOTE: Still being worked on, but is usable.
export const Tree = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'company', name: 'Company', isTreeColumn: true },
      { prop: 'name', name: 'Name'  },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue', company: 'Company 1', treeStatus: 'collapsed' },
      { name: 'Joe', age: 33, color: 'green', company: 'Company 2', treeStatus: 'collapsed' },
      { name: 'Adam', age: 40, color: 'red', company: 'Company 3', parentCompany: 'Company 1', treeStatus: 'disabled' },
      { name: 'John', age: 30, color: 'blue', company: 'Company 4', parentCompany: 'Company 2', treeStatus: 'disabled' },
      { name: 'Alice', age: 33, color: 'yellow', company: 'Company 5', parentCompany: 'Company 1', treeStatus: 'disabled' },
      { name: 'Bob', age: 40, color: 'orange', company: 'Company 6', parentCompany: 'Company 2', treeStatus: 'disabled' },
    ],
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [treeFromRelation]="'parentCompany'"
        [treeToRelation]="'company'">
      </seam-datatable>
    </div>`
})

export const Detail = (args) => ({
  props: {
    ...args,
    columns: [
      { prop: 'detailToggle', name: '' },
      { prop: 'name', name: 'Name' },
      // { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' }
    ],
    rows: [
      { name: 'Alice', age: 25, color: 'red' },
      { name: 'Joe', age: 33, color: 'green' },
      { name: 'Mark', age: 27, color: 'blue' },
    ]
  },
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable #table
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">

        <seam-datatable-row-detail rowHeight="100">
          <ng-template let-row="row" let-expanded="expanded" seamDatatableRowDetailTpl>
            <div style="padding-left:35px;">
              <div><strong>Profile</strong></div>
              <div>Name: {{ row.name }}</div>
              <div>Age: {{ row.age }}</div>
              <div>Favorite Color: {{ row.color }}</div>
            </div>
          </ng-template>
        </seam-datatable-row-detail>

        <seam-datatable-column prop="detailToggle"
          [width]="50"
          [minWidth]="50"
          [maxWidth]="50"
          [resizeable]="false"
          [sortable]="false"
          [draggable]="false"
          [canAutoResize]="false">
          <ng-template seamDatatableCellTpl let-row="row" let-expanded="expanded">
            <button type="button" class="btn btn-link p-0 text-decoration-none"
              [class.datatable-icon-right]="!expanded"
              [class.datatable-icon-down]="expanded"
              title="Expand/Collapse Row"
              (click)="table.rowDetail.toggleExpandRow(row)"
            >
            </button>
          </ng-template>
        </seam-datatable-column>

      </seam-datatable>
    </div>
    `
})



// NOTE: Not Working Yet
// storiesOf('Datatable', module)
//   .add('Row Grouping', () => ({
//     moduleMetadata: {
//       imports: [
//         BrowserAnimationsModule,
//         TheSeamDatatableModule,
//         TheSeamTableCellTypesModule
//       ]
//     },
//     props: {
//       columns: [
//         { prop: 'name', name: 'Name' },
//         { prop: 'age', name: 'Age' },
//         { prop: 'color', name: 'Color' }
//       ],
//       rows: [
//         { name: 'Mark', age: 27, color: 'blue' },
//         { name: 'Joe', age: 33, color: 'green' },
//         { name: 'Adam', age: 40, color: 'red' },
//         { name: 'Alice', age: 33, color: 'yellow' },
//         { name: 'Bob', age: 40, color: 'orange' },
//       ],
//     },
//     template: `
//       <div class="vh-100 vw-100">
//         <seam-datatable
//           class="w-100 h-100"
//           [columns]="columns"
//           [rows]="rows"
//           [groupRowsBy]="'age'">
//         </seam-datatable>
//       </div>`
//   }))



@Component({
  selector: 'dt-filter-wrapper',
  template: `
    <div class="vh-100 vw-100">
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
        <seam-datatable-menu-bar>
          <seam-datatable-menu-bar-row class="pb-2">
            <seam-datatable-menu-bar-column-left>

            </seam-datatable-menu-bar-column-left>
            <seam-datatable-menu-bar-column-center></seam-datatable-menu-bar-column-center>
            <seam-datatable-menu-bar-column-right>
              <seam-data-filter-search seamDatatableFilter></seam-data-filter-search>
            </seam-datatable-menu-bar-column-right>
          </seam-datatable-menu-bar-row>

          <seam-datatable-menu-bar-row>
            <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
            <seam-datatable-menu-bar-column-center>
              <seam-data-filter-toggle-buttons seamDatatableFilter
                [buttons]="filterButtons"
                [multiple]="false"
                [selectionToggleable]="false"
                [value]="defaultFilter"
                [properties]="['status']">
              </seam-data-filter-toggle-buttons>
            </seam-datatable-menu-bar-column-center>
            <seam-datatable-menu-bar-column-right>
              <seam-datatable-export-button [exporters]="exporters"></seam-datatable-export-button>
            </seam-datatable-menu-bar-column-right>
          </seam-datatable-menu-bar-row>
        </seam-datatable-menu-bar>
      </seam-datatable>
    </div>
  `
})
class DTFilterWrapper {

  @ViewChild(DatatableComponent) _datatable: DatatableComponent

  @Input() columns
  @Input() rows
  @Input() filterButtons

  defaultFilter = ''

  ngOnInit() {
    console.log('this._datatable', this._datatable)
  }

  ngAfterViewInit() {
    console.log('this._datatable2', this._datatable)
    this._datatable.filterStates.subscribe(fs => console.log('filterStates', fs))
  }
}

export const Filter: Story = (args) => ({
  moduleMetadata: {
    declarations: [ DTFilterWrapper ],
    imports: [ TheSeamDataFiltersModule ],
    providers: [
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },

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
      // },
      // {
      //   provide: THESEAM_DATATABLE_DYNAMIC_MENUBAR_ITEM,
      //   useValue: { name: 'text', component: DatatableMenuBarTextComponent, dataToken: THESEAM_MENUBAR_ITEM_DATA },
      //   multi: true
      // }
    ]
  },
  props: {
    ...args,
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' },
      { prop: 'registered', name: 'Registered' }
    ],
    rows: [
      { name: 'Mark', age: 27, color: 'blue', registered: true },
      { name: 'Joe', age: 33, color: 'green', registered: false },
      { name: 'Alice', age: 30, color: 'red', registered: false },
      { name: 'Bill', age: 40, color: 'orange', registered: false },
      { name: 'Sally', age: 35, color: 'purple', registered: false }
    ],
    filterButtons: [
      { name: 'Registered', value: '',
        comparator: (value, row) => {
          return row.registered ? -1 : 1
        }
      },
      { name: 'Over 30', value: 'over-30',
        comparator: (value, row) => {
          return row.age > 30 ? 1 : -1
        }
      }
    ]
  },
  template: `
    <dt-filter-wrapper
      [columns]="columns"
      [rows]="rows"
      [filterButtons]="filterButtons">
    </dt-filter-wrapper>
  `
})
