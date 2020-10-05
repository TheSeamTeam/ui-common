import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { action } from '@storybook/addon-actions'
import { boolean, number, text, withKnobs } from '@storybook/addon-knobs'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

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
        TheSeamDatatableModule
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
//         TheSeamDatatableModule,
//         BrowserAnimationsModule
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
