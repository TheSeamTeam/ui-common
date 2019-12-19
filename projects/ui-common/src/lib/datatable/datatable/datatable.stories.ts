import { action } from '@storybook/addon-actions'
import { boolean, number, text, withKnobs } from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { storiesOf } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { TheSeamDatatableModule } from '../datatable.module'

storiesOf('Components/Datatable', module)
  .addDecorator(withKnobs)

  .add('Simple', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
      // title: text('Header Title', 'Example Widget'),
      width: number('Width', 150),
      // loading: boolean('Loading', true),

      columns: [
        { prop: 'name', name: 'Name' },
        // { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' }
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },

        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
        { name: 'Mark', age: 27, color: 'blue' },
        // { name: 'Joe', age: 33, color: 'green' },
      ],
      onAdd() {
        console.log('Add Event', this.rows)

        // this.selected.splice(0, this.selected.length)
        // this.selected.push(...selected)

        this.rows = [ ...this.rows, { name: 'Joe', age: 33, color: 'green' } ]
      },
      onChangeWidth() {
        console.log('Width Event')

        // this.selected.splice(0, this.selected.length)
        // this.selected.push(...selected)

        this.width = this.width + 1
      }
    },
    // <div style="height: 400px; width: 600px;">
    template: `
      <div style="height: 450px; width: 100%;">
        <seam-datatable
          class="w-100 h-100"
          [columns]="columns"
          [rows]="rows">

          <seam-datatable-column name="Name" prop="name" [width]="width">
            <ng-template seamDatatableCellTpl let-value="value">
              {{ value }}
            </ng-template>
          </seam-datatable-column>

          <!-- <seam-datatable-column name="Color" prop="color" [width]="width">
            <ng-template seamDatatableCellTpl let-value="value">
              <span *ngIf="value === 'blue'; else notBlue" style="color: blue;">{{ value }}</span>
              <ng-template #notBlue>{{ value }}</ng-template>
            </ng-template>
          </seam-datatable-column> -->

        </seam-datatable>
      </div>
      <button type="button" (click)="onAdd()">Add</button>
      <button type="button" (click)="onChangeWidth()">Width</button>
      `
  }))

  .add('Column Template', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
      <div style="height: 400px; width: 600px;">
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
  }))

  .add('Action Menu', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
      <div style="height: 400px; width: 600px;">
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
  }))

  .add('Inline Edit', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule,
        ReactiveFormsModule
      ]
    },
    props: {
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'active', name: 'Active' }
      ],
      rows: [
        { name: 'Mark', age: 27, active: true, control: new FormControl(true) },
        { name: 'Joe', age: 33, active: false, control: new FormControl(false) },
      ],
      toggled: (event, row) => {
        console.log('toggled', row, row.control.value)
      }
    },
    template: `
      <div style="height: 400px; width: 600px;">
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
  }))



storiesOf('Components/Datatable/CheckboxSelection', module)
  .add('Basic', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
        console.log('Select Event', selected, this.selected)

        this.selected.splice(0, this.selected.length)
        this.selected.push(...selected)
      }
    },
    template: `
      <div style="height: 400px; width: 600px;">
        <seam-datatable
          class="w-100 h-100"
          [columns]="columns"
          [rows]="rows"
          [selected]="selected"
          [selectionType]="'checkbox'"
          [selectAllRowsOnPage]="selectAllRowsOnPage"
          (select)="onSelect($event)">
        </seam-datatable>

        <div class='selected-column p-2'>
          <h4>Selections <small>({{ selected?.length }})</small></h4>
          <ul>
            <li *ngFor='let sel of selected'>
              {{ sel.name }}
            </li>
            <li *ngIf="!selected?.length">No Selections</li>
          </ul>
        </div>
      </div>`
  }))

  .add('Toggle Display', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
        console.log('Select Event', selected, this.selected)

        this.selected.splice(0, this.selected.length)
        this.selected.push(...selected)
      }
    },
    template: `
      <div style="height: 400px; width: 600px;">
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

        <div class='selected-column p-2'>
          <h4>Selections <small>({{ selected?.length }})</small></h4>
          <ul>
            <li *ngFor='let sel of selected'>
              {{ sel.name }}
            </li>
            <li *ngIf="!selected?.length">No Selections</li>
          </ul>
        </div>
      </div>`
  }))


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
//       <div style="height: 400px; width: 600px;">
//         <seam-datatable
//           class="w-100 h-100"
//           [columns]="columns"
//           [rows]="rows"
//           [groupRowsBy]="'age'">
//         </seam-datatable>
//       </div>`
//   }))


// NOTE: Still being worked on, but is usable.
storiesOf('Components/Datatable', module)
  .add('Tree', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
      <div style="height: 400px; width: 600px;">
        <seam-datatable
          class="w-100 h-100"
          [columns]="columns"
          [rows]="rows"
          [treeFromRelation]="'parentCompany'"
          [treeToRelation]="'company'">
        </seam-datatable>
      </div>`
  }))

  .add('Detail', () => ({
    moduleMetadata: {
      imports: [
        TheSeamDatatableModule,
        BrowserAnimationsModule
      ]
    },
    props: {
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
      <div style="height: 450px; width: 100%;">
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
  }))
