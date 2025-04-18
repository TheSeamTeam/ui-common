import { action } from '@storybook/addon-actions'
import { Meta, Story, componentWrapperDecorator, moduleMetadata } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { AfterViewInit, Component, Input, OnInit, ViewChild, importProvidersFrom } from '@angular/core'
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'
import { BehaviorSubject, Observable, interval, of } from 'rxjs'
import { map, shareReplay, tap } from 'rxjs/operators'

import { CSVDataExporter } from '@theseam/ui-common/data-exporter'
import { DataFilterState, TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'
import { SortItem } from '@theseam/ui-common/datatable'
import {
  DynamicActionApiService,
  DynamicActionLinkService,
  DynamicActionModalService,
  ExportersDataEvaluator,
  JexlEvaluator,
  THESEAM_DYNAMIC_ACTION,
  THESEAM_DYNAMIC_VALUE_EVALUATOR,
} from '@theseam/ui-common/dynamic'
import {
  DEFAULT_PAGE_SIZE,
  DatatableGraphQLQueryRef,
  DatatableGraphqlService,
  FilterStateMapperResult,
  MapperContext,
  SortsMapperResult,
  gqlVar,
  observeRowsWithGqlInputsHandling,
} from '@theseam/ui-common/graphql'
import { StoryToastrService } from '@theseam/ui-common/story-helpers'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { expectFn, getHarness } from '@theseam/ui-common/testing'
import { ToastrModule, ToastrService } from 'ngx-toastr'

import {
  SIMPLE_GQL_TEST_QUERY,
  SimpleGqlTestExtraVariables,
  createApolloTestingProvider,
  createSimpleGqlTestRoot,
  simpleGqlTestSchema,
} from '../../graphql/testing'
import { TheSeamDatatableModule } from '../datatable.module'
import { TheSeamDatatableHarness } from '../testing'
import { DatatableComponent } from './datatable.component'

export default {
  title: 'Datatable/Components',
  component: DatatableComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        // BrowserAnimationsModule,
        // RouterModule.forRoot([], { useHash: true }),
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
      ],
    }),
    componentWrapperDecorator(story => `<div class="vh-100 vw-100">${story}</div>`),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
} as Meta

export const Simple: Story = args => ({
  // props: { ...args },
  props: {
    __hack: { ...args },
  },
  template: '<seam-datatable class="w-100 h-100" [columns]="__hack.columns" [rows]="__hack.rows"></seam-datatable>',
})
Simple.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
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
  ],
}

export const ColumnTemplate = (args: any) => ({
  // props: { ...args },
  props: {
    __hack: { ...args },
  },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows">
      <seam-datatable-column name="Color" prop="color">
        <ng-template seamDatatableCellTpl let-value="value">
          <span *ngIf="value === 'blue'; else notBlue" style="color: blue;">{{ value }}</span>
          <ng-template #notBlue>{{ value }}</ng-template>
        </ng-template>
      </seam-datatable-column>
    </seam-datatable>`,
})
ColumnTemplate.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
  ],
}

export const ActionMenu = (args: any) => ({
  props: {
    __hack: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' },
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
      ],
    },
  },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows">
        <ng-template seamDatatableRowActionItem let-row>
          <seam-datatable-action-menu>
            <seam-datatable-action-menu-item label="Action One"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Two"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Three" [subMenu]="subMenuOne"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Four"></seam-datatable-action-menu-item>
          </seam-datatable-action-menu>

          <seam-datatable-action-menu isSubMenu="true" #subMenuOne>
            <seam-datatable-action-menu-item label="Action One"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Two"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Three"></seam-datatable-action-menu-item>
          </seam-datatable-action-menu>
        </ng-template>
    </seam-datatable>`,
})
ActionMenu.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
  ],
}

export const InlineEdit = (args: any) => ({
  moduleMetadata: {
    imports: [
      ReactiveFormsModule,
    ],
  },
  props: {
    __hack: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'active', name: 'Active' },
      ],
      rows: [
        { name: 'Mark', age: 27, active: true, control: new UntypedFormControl(true) },
        { name: 'Joe', age: 33, active: false, control: new UntypedFormControl(false) },
      ],
      toggled: action('toggled'),
    },
  },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows">
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
    </seam-datatable>`,
})

export const CheckboxSelection = (args: any) => ({
  props: {
    __hack: {
      ...args,
      selected: [
        { name: 'Mark', age: 27, color: 'blue' },
      ],
      rowIdentity: (x: any) => `${x.name}${x.age}${x.color}`,
      selectAllRowsOnPage: false,
    },
  },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows"
      selectionType="checkbox"
      [rowIdentity]="__hack.rowIdentity"
      [selectAllRowsOnPage]="__hack.selectAllRowsOnPage"
      [selected]="__hack.selected">
    </seam-datatable>`,
})
CheckboxSelection.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Smith', age: 41, color: 'red' },
    { name: 'Jane', age: 25, color: 'orange' },
    { name: 'Doe', age: 14, color: 'purple' },
  ],
}

// [selected]="selected"
// [selectionType]="'checkbox'"
// [selectAllRowsOnPage]="selectAllRowsOnPage"
// (select)="onSelect($event)"

export const ToggleDisplay = (args: any) => ({
  props: {
    __hack: {
      ...args,
      selected: [],
      selectAllRowsOnPage: false,
      displayCheck(row: any) {
        return row.name !== 'Adam'
      },
      onSelect({ selected }: { selected: any }) {
        action('select')(selected)

        this.selected.splice(0, this.selected.length)
        this.selected.push(...selected)
      },
    },
  },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows"
      [selected]="__hack.selected"
      [selectionType]="'checkbox'"
      [selectAllRowsOnPage]="__hack.selectAllRowsOnPage"
      [displayCheck]="__hack.displayCheck"
      (select)="__hack.onSelect($event)">
    </seam-datatable>`,
})
ToggleDisplay.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Adam', age: 40, color: 'red' },
    { name: 'Joe', age: 33, color: 'green' },
  ],
}

// NOTE: Still being worked on, but is usable.
export const Tree = (args: any) => ({
  props: { __hack: { ...args } },
  template: `
    <seam-datatable
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows"
      [treeFromRelation]="'parentCompany'"
      [treeToRelation]="'company'">
    </seam-datatable>`,
})
Tree.args = {
  columns: [
    { prop: 'company', name: 'Company', isTreeColumn: true },
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue', company: 'Company 1', treeStatus: 'collapsed' },
    { name: 'Joe', age: 33, color: 'green', company: 'Company 2', treeStatus: 'collapsed' },
    { name: 'Adam', age: 40, color: 'red', company: 'Company 3', parentCompany: 'Company 1', treeStatus: 'disabled' },
    { name: 'John', age: 30, color: 'blue', company: 'Company 4', parentCompany: 'Company 2', treeStatus: 'disabled' },
    { name: 'Alice', age: 33, color: 'yellow', company: 'Company 5', parentCompany: 'Company 1', treeStatus: 'disabled' },
    { name: 'Bob', age: 40, color: 'orange', company: 'Company 6', parentCompany: 'Company 2', treeStatus: 'disabled' },
  ],
}

export const Detail = (args: any) => ({
  props: { __hack: { ...args } },
  template: `
    <seam-datatable #table
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows">

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

    </seam-datatable>`,
})
Detail.args = {
  columns: [
    { prop: 'detailToggle', name: '' },
    { prop: 'name', name: 'Name' },
    // { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Alice', age: 25, color: 'red' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Mark', age: 27, color: 'blue' },
  ],
}

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
    </seam-datatable>`,
})
class DTFilterWrapperComponent implements OnInit, AfterViewInit {

  @ViewChild(DatatableComponent) _datatable: DatatableComponent | undefined

  @Input() columns: any
  @Input() rows: any
  @Input() filterButtons: any

  exporters = [
    new CSVDataExporter(),
  ]

  defaultFilter = ''

  ngOnInit() {
    // console.log('this._datatable', this._datatable)
  }

  ngAfterViewInit() {
    // console.log('this._datatable2', this._datatable)
    // this._datatable?.filterStates.subscribe(fs => console.log('filterStates', fs))
  }

}

export const Filter: Story = args => ({
  applicationConfig: {
    providers: [
      importProvidersFrom(
        ToastrModule.forRoot(),
      ),
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },

      { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionApiService, multi: true },
      { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionLinkService, multi: true },
      { provide: THESEAM_DYNAMIC_ACTION, useClass: DynamicActionModalService, multi: true },
    ],
  },
  moduleMetadata: {
    declarations: [ DTFilterWrapperComponent ],
    imports: [
      TheSeamDataFiltersModule,
    ],
    providers: [
      { provide: ToastrService, useClass: StoryToastrService },
    ],
  },
  props: {
    __hack: {
      ...args,
      filterButtons: [
        { name: 'Registered',
          value: '',
          comparator: (value: any, row: any) => row.registered ? -1 : 1,
        },
        { name: 'Over 30',
          value: 'over-30',
          comparator: (value: any, row: any) => row.age > 30 ? 1 : -1,
        },
      ],
    },
  },
  template: `
    <dt-filter-wrapper
      [columns]="__hack.columns"
      [rows]="__hack.rows"
      [filterButtons]="__hack.filterButtons">
    </dt-filter-wrapper>
  `,
})
Filter.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
    { prop: 'registered', name: 'Registered' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue', registered: true },
    { name: 'Joe', age: 33, color: 'green', registered: false },
    { name: 'Alice', age: 30, color: 'red', registered: false },
    { name: 'Bill', age: 40, color: 'orange', registered: false },
    { name: 'Sally', age: 35, color: 'purple', registered: false },
  ],
}

// class StoryDataSource extends DatatableGqlDataSource<any> {

// }

// const dSource = new StoryDataSource()

// export const DataSource: Story = (args) => ({
//   props: {
//     __hack: {
//       ...args,
//       dataSource: dSource,
//     }
//   },
//   template: `
//     <div class="vh-100 vw-100">
//       <seam-datatable
//         class="w-100 h-100"
//         [columns]="__hack.columns"
//         [dataSource]="__hack.dataSource"
//         externalPaging="true"
//         externalSorting="true"
//         externalFiltering="true">
//       </seam-datatable>
//     </div>
//   `
// })
// DataSource.args = {
//   columns: [
//     { prop: 'name', name: 'Name' },
//     { prop: 'age', name: 'Age' },
//     { prop: 'color', name: 'Color' }
//   ],
//   rows: [
//     { name: 'Mark', age: 27, color: 'blue' },
//     { name: 'Joe', age: 33, color: 'green' }
//   ]
// }

export const FooterTemplate: Story = args => ({
  props: { ...args },
  template: `<seam-datatable class="w-100 h-100" [columns]="columns" [rows]="rows">
      <seam-datatable-footer>
        <ng-template seamDatatableFooterTpl
          let-rowCount="rowCount"
          let-pageSize="pageSize"
          let-selectedCount="selectedCount"
          let-curPage="curPage"
          let-offset="offset">
          <div class="flex-grow-1 text-center mx-2" style="flex-basis: 50%;">
            Total Members: {{ rowCount }} | Total Age: {{ totalAge }} | Oldest Member: {{ oldestMember }}
          </div>
        </ng-template>
      </seam-datatable-footer>
    </seam-datatable>`,
})
FooterTemplate.args = {
  totalAge: 87,
  oldestMember: 'Joe',
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Shelby', age: 27, color: 'grey' },
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Shelby', age: 27, color: 'grey' },
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Shelby', age: 27, color: 'grey' },
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Shelby', age: 27, color: 'grey' },
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
    { name: 'Shelby', age: 27, color: 'grey' },
  ],
}

// externalPaging="true"

@Component({
  selector: 'dt-wrap',
  template: `
    <seam-datatable #dt
      class="w-100 h-100"
      [columns]="columns"
      [rows]="_rows$ | async"
      externalSorting="true"
      externalFiltering="true">
    </seam-datatable>
  `,
})
class StoryDataSourceTwoComponent {

  @Input() columns: any

  public readonly _rows$: Observable<any[]>

  _rowsTmp: any = [
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
    { id: 0, name: 'thing' },
  ]

  private readonly _datatableSubject = new BehaviorSubject<any | undefined>(undefined)

  @ViewChild(DatatableComponent, { static: true })
  set _datatableQuery(dt: DatatableComponent) { this._datatableSubject.next(dt) }

  private readonly _queryRef: DatatableGraphQLQueryRef<any, any, any>

  private _sub: any

  constructor(
    private readonly _datatableGql: DatatableGraphqlService,
  ) {
    this._queryRef = this._datatableGql.watchQuery<any, any, any>(
      {
        query: SIMPLE_GQL_TEST_QUERY,
        variables: {
          skip: 0,
          take: DEFAULT_PAGE_SIZE,
        },
      },
      {
        variables: {
          // removeIfNotDefined: [ 'order', 'search' ],
          // removeIfNotUsed: [ 'search' ],
          inline: [ 'where' ],
        },
        // Disabling paging until a solution for select all, when partially loaded datatset, is decided.
        // disablePaging: true
      },
    )

    const extraVariables$ = of({})

    const _rows$ = this._queryRef.rows((data: any) =>
      // console.log('~!~!~!~!~', data)
      ({
        rows: data.simpleGqlTestRecords.items,
        totalCount: data.simpleGqlTestRecords.totalCount,
      }),
    ).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      // tap(v => console.log('~! rows', v)),
    )

    const _mapSorts = (sorts: SortItem[], context: MapperContext): SortsMapperResult => sorts.map(s => {
      const _dir = s?.dir.toUpperCase()

      switch (s?.prop) {
        case 'id': return ({ id: _dir })
        case 'name': return ({ name: _dir })
      }
      // console.log('mapSorts', sorts)
      return ({ name: _dir })
    })

    // const _mapSearchFilterState = async (
    const _mapSearchFilterState = (
      filterState: DataFilterState, context: MapperContext<SimpleGqlTestExtraVariables>,
    // ): Promise<FilterStateMapperResult> => {
    ): FilterStateMapperResult => {
      const value = filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      const searchVar = gqlVar('search')
      const conditions: any[] = [
        { id: { objectContains: searchVar } },
        { name: { contains: searchVar } },
      ]

      // console.log('_mapSearchFilterState', filterState, conditions)
      return {
        filter: {
          or: conditions,
        },
        variables: { search: value },
      }
    }

    const _mapToggleButtonsState = (
      filterState: DataFilterState,
      context: MapperContext<SimpleGqlTestExtraVariables>,
    ): FilterStateMapperResult => {
      // console.log('_mapToggleButtonsState', filterState)
      const value = Array.isArray(filterState.state?.value) ? filterState.state?.value[0]?.trim() : filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      return {
        filter: { status: { eq: value } },
        variables: { },
      }
    }

    this._rows$ = observeRowsWithGqlInputsHandling(
      this._queryRef,
      _rows$,
      this._datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        'search': _mapSearchFilterState,
        'toggle-buttons': _mapToggleButtonsState,
      },
    ).pipe(
      // tap(v => {
      //   console.log('v')
      // })
    )

    // this._rows$ = of(this._rowsTmp)

    // this._sub = subscriberCount(this._rows$, 'this._rows$').pipe(
    //   // take(1)
    // ).subscribe(v => {
    //   console.log('r', v)
    //   this._rowsTmp = v
    // })

    // console.log('~~~!')
  }

  // ngOnInit() {
  //   console.log('dt-wrap ngOnInit')
  // }

  // ngOnDestroy() {
  //   console.log('dt-wrap ngOnDestroy')
  //   // this._sub.unsubscribe()
  // }

}

export const GraphQLQueryRef: Story = args => ({
  applicationConfig: {
    providers: [
      createApolloTestingProvider(
        simpleGqlTestSchema, createSimpleGqlTestRoot(60),
      ),
    ],
  },
  moduleMetadata: {
    declarations: [
      StoryDataSourceTwoComponent,
    ],
  },
  props: {
    __hack: {
      // ...args
      columns: args.columns,
    },
  },
  template: `
    <div style="height: 500px; width: 600px; display: block; position: relative;">
      <dt-wrap style="height: 100%; width: 100%; display: block;" [columns]="__hack.columns"></dt-wrap>
    </div>
  `,
})
GraphQLQueryRef.args = {
  columns: [
    { prop: 'id', name: 'Id' },
    { prop: 'name', name: 'Name' },
  ],
  numberOfRows: 60,
}
GraphQLQueryRef.play = async ({ canvasElement, fixture }) => {
  // const canvas = within(canvasElement)

  // const page2Btn = canvas.getByRole('button', { name: /page 2/i })
  // const page2Anchor = page2Btn.getElementsByTagName('a')[0]
  // await userEvent.click(page2Anchor)

  // await expectFn(page2Btn.classList.contains('active')).toBe(true)

  const datatableHarness = await getHarness(TheSeamDatatableHarness, { canvasElement, fixture })

  await expectFn(await datatableHarness.getCurrentPage()).toBe(1)
  const page2BtnHarness = await (await datatableHarness.getPager()).getPageButtonHarness(2)
  await (await page2BtnHarness.getAnchor()).click()
  await expectFn(await datatableHarness.getCurrentPage()).toBe(2)
}

@Component({
  selector: 'dt-wrap',
  template: `
    <seam-datatable #dt
      class="w-100 h-100"
      [columns]="columns"
      [rows]="rows">

      <ng-template seamDatatableRowActionItem let-row>
        <seam-datatable-action-menu>
          <ng-container *ngIf="showActionMenu$ | async">
            <seam-datatable-action-menu-item label="Action One"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Two"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Three" [subMenu]="subMenuOne"></seam-datatable-action-menu-item>
            <seam-datatable-action-menu-item label="Action Four"></seam-datatable-action-menu-item>
          </ng-container>
        </seam-datatable-action-menu>

        <seam-datatable-action-menu isSubMenu="true" #subMenuOne>
          <seam-datatable-action-menu-item label="Action One"></seam-datatable-action-menu-item>
          <seam-datatable-action-menu-item label="Action Two"></seam-datatable-action-menu-item>
          <seam-datatable-action-menu-item label="Action Three"></seam-datatable-action-menu-item>
        </seam-datatable-action-menu>
      </ng-template>

    </seam-datatable>
  `,
})
class ConditionalActionMenuComponent {

  @Input() columns: any

  @Input() rows: any

  public showActionMenu$: Observable<boolean>

  constructor()
  {
    this.showActionMenu$ = interval(5000).pipe(
      map(i => i % 2 === 0),
      tap(show => console.log('showActionMenu', show))
    )
  }

}

export const ConditionalActionMenu = (args: any) => ({
  moduleMetadata: {
    declarations: [
      ConditionalActionMenuComponent
    ]
  },
  props: {
    __hack: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'color', name: 'Color' },
      ],
      rows: [
        { name: 'Mark', age: 27, color: 'blue' },
        { name: 'Joe', age: 33, color: 'green' },
      ],
    },
  },
  template: `
    <dt-wrap
      class="w-100 h-100"
      [columns]="__hack.columns"
      [rows]="__hack.rows">
    </dt-wrap>`,
})
ConditionalActionMenu.args = {
  columns: [
    { prop: 'name', name: 'Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'color', name: 'Color' },
  ],
  rows: [
    { name: 'Mark', age: 27, color: 'blue' },
    { name: 'Joe', age: 33, color: 'green' },
  ],
}
