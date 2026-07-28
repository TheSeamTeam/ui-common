import { action } from 'storybook/actions'
import { expect } from 'storybook/test'
import {
  Meta,
  StoryObj,
  componentWrapperDecorator,
  moduleMetadata,
  applicationConfig,
} from '@storybook/angular'

import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms'
import { provideAnimations } from '@angular/platform-browser/animations'
import { BehaviorSubject, Observable, interval, of, Subject } from 'rxjs'
import { map, shareReplay, startWith, tap } from 'rxjs/operators'

import { CSVDataExporter } from '@theseam/ui-common/data-exporter'
import {
  DataFilterState,
  IToggleButton,
  TheSeamDataFiltersModule,
} from '@theseam/ui-common/data-filters'
import {
  THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
  TheSeamDatatableColumn,
} from '@theseam/ui-common/datatable'
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
  createSortsMapper,
  DEFAULT_PAGE_SIZE,
  DatatableGraphQLQueryRef,
  DatatableGraphqlService,
  FilterStateMapperResult,
  MapperContext,
  gqlVar,
  observeRowsWithGqlInputsHandling,
  mapSearchNumericColumnsDataFilterStateToGql,
  mapSearchTextColumnsDataFilterStateToGql,
  mapSearchDateColumnsDataFilterStateToGql,
  DEFAULT_TO_REMOVE_ON_UNDEFINED,
} from '@theseam/ui-common/graphql'
import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import {
  getHarness,
  provideMockToastrService,
} from '@theseam/ui-common/testing'

import {
  SIMPLE_GQL_TEST_SEARCH_QUERY,
  SimpleGqlTestExtraVariables,
  SimpleGqlTestRecord,
  createMockApolloTestingProvider,
  createSimpleGqlTestRoot,
} from '../../graphql/testing'
import { TheSeamDatatableModule } from '../datatable.module'
import { TheSeamDatatableHarness } from '../testing'
import { DatatableComponent } from './datatable.component'
import {
  THESEAM_DATATABLE_CONFIG,
  TheSeamDatatableConfig,
} from '../models/datatable-config'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import {
  ColumnsDataFilter,
  ColumnsDataFilterState,
  THESEAM_COLUMNS_DATA_FILTER,
} from '../models/columns-data-filter'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamCheckboxModule } from '@theseam/ui-common/checkbox'
import { isNullOrUndefined } from '@theseam/ui-common/utils'
import { TheSeamPreferencesAccessor } from '@theseam/ui-common/services'
import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'

const meta: Meta<DatatableComponent> = {
  title: 'Datatable/Components',
  component: DatatableComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      imports: [
        // BrowserAnimationsModule,
        // RouterModule.forRoot([], { useHash: true }),
        TheSeamDatatableModule,
        TheSeamTableCellTypesModule,
        TheSeamActionMenuModule,
      ],
    }),
    componentWrapperDecorator(
      (story) => `<div class="vh-100 vw-100">${story}</div>`,
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
}

export default meta
type Story = StoryObj<DatatableComponent>

export const Simple: Story = {
  render: (args) => ({
    props: { ...args },
    template:
      '<seam-datatable class="w-100 h-100" [columns]="columns" [rows]="rows"></seam-datatable>',
  }),
  args: {
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
  },
}

export const ColumnTemplate: Story = {
  render: (args: any) => ({
    props: { ...args },
    template: `
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
      </seam-datatable>`,
  }),
  args: {
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
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBe(2)

    // Verify the custom template renders — the "blue" cell should have a styled span
    const rows = await harness.getRows()
    const cells = await rows[0].getCells()
    const colorCellText = await cells[2].getText()
    await expect(colorCellText).toBe('blue')
  },
}

export const ActionMenu: Story = {
  render: (args: any) => ({
    props: { ...args },
    template: `
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [actionItemColumnPosition]="actionItemColumnPosition">
        <ng-template seamDatatableRowActionItem let-row>
          <seam-action-menu>
            <seam-action-menu-item label="Action One"></seam-action-menu-item>
            <seam-action-menu-item label="Action Two"></seam-action-menu-item>
            <seam-action-menu-item label="Action Three" [subMenu]="subMenuOne"></seam-action-menu-item>
            <seam-action-menu-item label="Action Four"></seam-action-menu-item>
          </seam-action-menu>

            <seam-action-menu isSubMenu="true" #subMenuOne>
              <seam-action-menu-item label="Action One"></seam-action-menu-item>
              <seam-action-menu-item label="Action Two"></seam-action-menu-item>
              <seam-action-menu-item label="Action Three"></seam-action-menu-item>
            </seam-action-menu>
          </ng-template>
      </seam-datatable>`,
  }),
  args: {
    columns: [
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'email', name: 'Email Address' },
      { prop: 'phone', name: 'Phone Number' },
      { prop: 'streetAddress', name: 'Street Address' },
      { prop: 'city', name: 'City' },
      { prop: 'state', name: 'State' },
      { prop: 'zip', name: 'Zip' },
      { prop: 'country', name: 'Country' },
      { prop: 'color', name: 'Favorite Color' },
      { prop: 'iceCreamFlavor', name: 'Favorite Ice Cream Flavor' },
      { prop: 'petName', name: "Pet's Name" },
    ],
    rows: [
      {
        name: 'Mark',
        age: 27,
        color: 'Blue',
        email: 'mark.berry@theseam.com',
        phone: '901-555-5555',
        streetAddress: '123 Main St',
        city: 'Arlington',
        state: 'TN',
        zip: '38111',
        country: 'USA',
        iceCreamFlavor: 'Chocolate',
        petName: 'Spot',
      },
      {
        name: 'Joe',
        age: 33,
        color: 'Green',
        email: 'joe.schmoe@theseam.com',
        phone: '901-888-8888',
        streetAddress: '1600 Pennsylvaia Ave',
        city: 'Washington',
        state: 'DC',
        zip: '35111',
        country: 'USA',
        iceCreamFlavor: 'Strawberry',
        petName: 'Mittens',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })

    // Verify rows rendered with action menu column
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBe(2)

    // Verify action menu is available on a row
    const rows = await harness.getRows()
    const actionMenu = await rows[0].getActionMenu()
    await expect(actionMenu).not.toBeNull()

    // Open action menu and verify items
    await actionMenu!.open()
    const items = await actionMenu!.getItems()
    await expect(items.length).toBe(4)

    await actionMenu!.close()
  },
}

export const InlineEdit: Story = {
  render: (args: any) => ({
    moduleMetadata: {
      imports: [ReactiveFormsModule],
    },
    props: {
      ...args,
      columns: [
        { prop: 'name', name: 'Name' },
        { prop: 'age', name: 'Age' },
        { prop: 'active', name: 'Active' },
      ],
      rows: [
        {
          name: 'Mark',
          age: 27,
          active: true,
          control: new UntypedFormControl(true),
        },
        {
          name: 'Joe',
          age: 33,
          active: false,
          control: new UntypedFormControl(false),
        },
      ],
      toggled: action('toggled'),
    },
    template: `
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
      </seam-datatable>`,
  }),
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })

    // Verify rows rendered
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBeGreaterThan(0)
    await expect(rowCount).toBeLessThan(32)

    // Verify 3 header cells
    const headers = await harness.getHeaderCells()
    await expect(headers.length).toBe(3)
    const name0 = await headers[0].getName()
    await expect(name0).toBe('Name')

    // Verify first cell text
    const cellText = await harness.getCellText(0, 0)
    await expect(cellText).toBe('Mark')

    // Verify page 1 active
    const currentPage = await harness.getCurrentPage()
    await expect(currentPage).toBe(1)

    // Navigate to page 2
    const pager = await harness.getPager()
    await expect(pager).not.toBeNull()
    const page2Btn = await pager!.getPageButtonHarness(2)
    await (await page2Btn.getAnchor()).click()
    const newPage = await harness.getCurrentPage()
    await expect(newPage).toBe(2)
  },
}

export const CheckboxSelection: Story = {
  render: (args: any) => ({
    props: {
      ...args,
      selected: [{ name: 'Mark', age: 27, color: 'blue' }],
      rowIdentity: (x: any) => `${x.name}${x.age}${x.color}`,
      selectAllRowsOnPage: false,
    },
    template: `
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        selectionType="checkbox"
        [rowIdentity]="rowIdentity"
        [selectAllRowsOnPage]="selectAllRowsOnPage"
        [selected]="selected">
      </seam-datatable>`,
  }),
  args: {
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
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })

    // Verify checkbox column is present (3 data + 1 checkbox = 4)
    const colCount = await harness.getColumnCount()
    await expect(colCount).toBe(4)

    // Verify rows rendered
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBe(5)

    // Verify pre-selected row (Mark)
    const selected = await harness.getSelectedRows()
    await expect(selected.length).toBe(1)

    // Click checkbox on another row to select it
    const rows = await harness.getRows()
    await rows[1].clickCheckbox()

    const selectedAfter = await harness.getSelectedRows()
    await expect(selectedAfter.length).toBe(2)
  },
}

export const ToggleDisplay: Story = {
  render: (args: any) => ({
    props: {
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
    template: `
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [selected]="selected"
        [selectionType]="'checkbox'"
        [selectAllRowsOnPage]="selectAllRowsOnPage"
        [displayCheck]="displayCheck"
        (select)="onSelect($event)">
      </seam-datatable>`,
  }),
  args: {
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
  },
}

// NOTE: Still being worked on, but is usable.
export const Tree: Story = {
  render: (args: any) => ({
    props: { ...args },
    template: `
      <seam-datatable
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows"
        [treeFromRelation]="'parentCompany'"
        [treeToRelation]="'company'">
      </seam-datatable>`,
  }),
  args: {
    columns: [
      { prop: 'company', name: 'Company', isTreeColumn: true },
      { prop: 'name', name: 'Name' },
      { prop: 'age', name: 'Age' },
      { prop: 'color', name: 'Color' },
    ],
    rows: [
      {
        name: 'Mark',
        age: 27,
        color: 'blue',
        company: 'Company 1',
        treeStatus: 'collapsed',
      },
      {
        name: 'Joe',
        age: 33,
        color: 'green',
        company: 'Company 2',
        treeStatus: 'collapsed',
      },
      {
        name: 'Adam',
        age: 40,
        color: 'red',
        company: 'Company 3',
        parentCompany: 'Company 1',
        treeStatus: 'disabled',
      },
      {
        name: 'John',
        age: 30,
        color: 'blue',
        company: 'Company 4',
        parentCompany: 'Company 2',
        treeStatus: 'disabled',
      },
      {
        name: 'Alice',
        age: 33,
        color: 'yellow',
        company: 'Company 5',
        parentCompany: 'Company 1',
        treeStatus: 'disabled',
      },
      {
        name: 'Bob',
        age: 40,
        color: 'orange',
        company: 'Company 6',
        parentCompany: 'Company 2',
        treeStatus: 'disabled',
      },
    ],
  },
}

export const Detail: Story = {
  render: (args: any) => ({
    props: { ...args },
    template: `
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

      </seam-datatable>`,
  }),
  args: {
    columns: [
      { prop: 'detailToggle', name: '' },
      { prop: 'name', name: 'Name' },
      { prop: 'color', name: 'Color' },
    ],
    rows: [
      { name: 'Alice', age: 25, color: 'red' },
      { name: 'Joe', age: 33, color: 'green' },
      { name: 'Mark', age: 27, color: 'blue' },
    ],
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })

    // Verify 3 rows
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBe(3)

    // Verify first row is not expanded initially
    const rows = await harness.getRows()
    const expanded = await rows[0].isExpanded()
    await expect(expanded).toBe(false)
  },
}

@Component({
  selector: 'dt-filter-wrapper',
  template: ` <seam-datatable
    class="w-100 h-100"
    [columns]="columns"
    [rows]="rows"
  >
    <seam-datatable-menu-bar>
      <seam-datatable-menu-bar-row class="pb-2">
        <seam-datatable-menu-bar-column-left>
        </seam-datatable-menu-bar-column-left>
        <seam-datatable-menu-bar-column-center></seam-datatable-menu-bar-column-center>
        <seam-datatable-menu-bar-column-right>
          <seam-data-filter-search
            seamDatatableFilter
          ></seam-data-filter-search>
        </seam-datatable-menu-bar-column-right>
      </seam-datatable-menu-bar-row>

      <seam-datatable-menu-bar-row>
        <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
        <seam-datatable-menu-bar-column-center>
          <seam-data-filter-toggle-buttons
            seamDatatableFilter
            [buttons]="filterButtons"
            [multiple]="false"
            [selectionToggleable]="false"
            [value]="defaultFilter"
            [properties]="['status']"
          >
          </seam-data-filter-toggle-buttons>
        </seam-datatable-menu-bar-column-center>
        <seam-datatable-menu-bar-column-right>
          <seam-datatable-export-button
            [exporters]="exporters"
          ></seam-datatable-export-button>
        </seam-datatable-menu-bar-column-right>
      </seam-datatable-menu-bar-row>
    </seam-datatable-menu-bar>
  </seam-datatable>`,
  standalone: false,
})
class DTFilterWrapperComponent implements OnInit, AfterViewInit {
  @ViewChild(DatatableComponent) _datatable: DatatableComponent | undefined

  @Input() columns: any
  @Input() rows: any
  @Input() filterButtons: any

  exporters = [new CSVDataExporter()]

  defaultFilter = ''

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // console.log('this._datatable', this._datatable)
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngAfterViewInit() {
    // console.log('this._datatable2', this._datatable)
    // this._datatable?.filterStates.subscribe(fs => console.log('filterStates', fs))
  }
}

export const Filter: Story = {
  render: (args) => ({
    applicationConfig: {
      providers: [
        provideMockToastrService(),
        {
          provide: THESEAM_DYNAMIC_VALUE_EVALUATOR,
          useClass: JexlEvaluator,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_VALUE_EVALUATOR,
          useClass: ExportersDataEvaluator,
          multi: true,
        },

        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionApiService,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionLinkService,
          multi: true,
        },
        {
          provide: THESEAM_DYNAMIC_ACTION,
          useClass: DynamicActionModalService,
          multi: true,
        },
      ],
    },
    moduleMetadata: {
      declarations: [DTFilterWrapperComponent],
      imports: [TheSeamDataFiltersModule],
    },
    props: {
      ...args,
      filterButtons: [
        {
          name: 'Registered',
          value: '',
          comparator: (value: any, row: any) => (row.registered ? -1 : 1),
        },
        {
          name: 'Over 30',
          value: 'over-30',
          comparator: (value: any, row: any) => (row.age > 30 ? 1 : -1),
        },
      ],
    },
    template: `
      <dt-filter-wrapper
        [columns]="columns"
        [rows]="rows"
        [filterButtons]="filterButtons">
      </dt-filter-wrapper>
    `,
  }),
  args: {
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
  },
}

export const FooterTemplate: StoryObj<
  DatatableComponent & { totalAge: number; oldestMember: string }
> = {
  render: (args) => ({
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
  }),
  args: {
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
  },
  play: async ({ canvasElement }) => {
    const harness = await getHarness(TheSeamDatatableHarness, { canvasElement })

    // Verify rows render
    const rowCount = await harness.getRowCount()
    await expect(rowCount).toBeGreaterThan(0)

    // Verify the datatable is not showing empty message
    const empty = await harness.isEmpty()
    await expect(empty).toBe(false)
  },
}

@Component({
  selector: 'dt-gql-wrap',
  template: `
    <seam-datatable
      class="w-100 h-100"
      [loadingIndicator]="loading$ | async"
      [columns]="columns"
      [rows]="_rows$ | async"
      externalSorting="true"
      externalFiltering="true"
    >
      <seam-datatable-menu-bar>
        <seam-datatable-menu-bar-row class="pb-2">
          <seam-datatable-menu-bar-column-left>
          </seam-datatable-menu-bar-column-left>
          <seam-datatable-menu-bar-column-center></seam-datatable-menu-bar-column-center>
          <seam-datatable-menu-bar-column-right>
            <seam-data-filter-search
              seamDatatableFilter
            ></seam-data-filter-search>
          </seam-datatable-menu-bar-column-right>
        </seam-datatable-menu-bar-row>

        <seam-datatable-menu-bar-row>
          <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
          <seam-datatable-menu-bar-column-center>
            <seam-data-filter-toggle-buttons
              seamDatatableFilter
              [buttons]="_filterButtons"
              [multiple]="false"
              [selectionToggleable]="false"
              [value]="_defaultFilter"
              [properties]="['id']"
            >
            </seam-data-filter-toggle-buttons>
          </seam-datatable-menu-bar-column-center>
          <seam-datatable-menu-bar-column-right></seam-datatable-menu-bar-column-right>
        </seam-datatable-menu-bar-row>
      </seam-datatable-menu-bar>
    </seam-datatable>
  `,
  standalone: false,
})
class GqlDatatableWrapperComponent {
  @Input() columns: any[] = []

  public readonly _rows$: Observable<any[]>
  public readonly loading$: Observable<boolean>

  private readonly _datatableSubject = new BehaviorSubject<any>(undefined)

  @ViewChild(DatatableComponent, { static: true })
  set _datatableQuery(dt: DatatableComponent) {
    this._datatableSubject.next(dt)
  }

  private readonly _queryRef: DatatableGraphQLQueryRef<any, any, any>

  readonly _filterButtons: IToggleButton[] = [
    { name: 'All', value: '' },
    { name: 'Id lt 30', value: 'id_lt_30' },
  ]

  _defaultFilter = ''

  constructor(private readonly _datatableGql: DatatableGraphqlService) {
    this._queryRef = this._datatableGql.watchQuery<any, any, any>(
      {
        query: SIMPLE_GQL_TEST_SEARCH_QUERY,
        variables: { skip: 0, take: DEFAULT_PAGE_SIZE },
      },
      {
        variables: {
          removeIfNotDefined: [...DEFAULT_TO_REMOVE_ON_UNDEFINED, 'search'],
          removeIfNotUsed: ['search'],
          inline: ['where'],
        },
      },
    )

    this.loading$ = this._queryRef.loading$

    const extraVariables$ = of({})

    const _rows$ = this._queryRef
      .rows((data: any) => ({
        rows: data.simpleGqlTestRecords.items,
        totalCount: data.simpleGqlTestRecords.totalCount,
      }))
      .pipe(shareReplay({ bufferSize: 1, refCount: true }))

    const _mapSorts = createSortsMapper<SimpleGqlTestRecord>({})

    const _mapSearchFilterState = (
      filterState: DataFilterState,
      _context: MapperContext<SimpleGqlTestExtraVariables>,
    ): FilterStateMapperResult => {
      const value = filterState.state?.value?.trim()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }
      const searchVar = gqlVar('search')
      return {
        filter: {
          or: [
            { id: { objectContains: searchVar } },
            { name: { contains: searchVar } },
          ],
        },
        variables: { search: value },
      }
    }

    const _mapToggleButtonsFilterState = (
      filterState: DataFilterState,
      _context: MapperContext<SimpleGqlTestExtraVariables>,
    ): FilterStateMapperResult => {
      const value = Array.isArray(filterState.state?.value)
        ? filterState.state?.value[0]?.trim().toLowerCase()
        : filterState.state?.value?.trim().toLowerCase()
      if (typeof value !== 'string' || value.length === 0) {
        return null
      }

      return {
        filter: { id: { lt: 30 } },
        variables: {},
      }
    }

    this._rows$ = observeRowsWithGqlInputsHandling(
      this._queryRef,
      _rows$,
      this._datatableSubject.asObservable(),
      extraVariables$,
      _mapSorts,
      {
        search: _mapSearchFilterState,
        'toggle-buttons': _mapToggleButtonsFilterState,
        'search-numeric': mapSearchNumericColumnsDataFilterStateToGql,
        'search-text': mapSearchTextColumnsDataFilterStateToGql,
        'search-date': mapSearchDateColumnsDataFilterStateToGql,
      },
    )
  }
}

export const GraphQLQueryRef: Story = {
  render: (args) => ({
    applicationConfig: {
      providers: [
        createMockApolloTestingProvider({
          resolve: (operation) => {
            const root = createSimpleGqlTestRoot(600)
            return {
              data: {
                simpleGqlTestRecords: root.simpleGqlTestRecords(
                  operation.variables,
                ),
              },
            }
          },
          delay: 1000,
        }),
      ],
    },
    moduleMetadata: {
      declarations: [GqlDatatableWrapperComponent],
      imports: [TheSeamDataFiltersModule],
    },
    props: {
      columns: args.columns,
    },
    template: `<dt-gql-wrap [columns]="columns"></dt-gql-wrap>`,
  }),
  args: {
    columns: [
      { prop: 'id', name: 'Id' },
      { prop: 'name', name: 'Name' },
    ],
  },
}

@Component({
  selector: 'dt-wrap',
  template: `
    <seam-datatable #dt class="w-100 h-100" [columns]="columns" [rows]="rows">
      <ng-template seamDatatableRowActionItem let-row>
        <seam-action-menu>
          <ng-container *ngIf="showActionMenu$ | async">
            <seam-action-menu-item label="Action One"></seam-action-menu-item>
            <seam-action-menu-item label="Action Two"></seam-action-menu-item>
            <seam-action-menu-item
              label="Action Three"
              [subMenu]="subMenuOne"
            ></seam-action-menu-item>
            <seam-action-menu-item label="Action Four"></seam-action-menu-item>
          </ng-container>
        </seam-action-menu>

        <seam-action-menu isSubMenu="true" #subMenuOne>
          <seam-action-menu-item label="Action One"></seam-action-menu-item>
          <seam-action-menu-item label="Action Two"></seam-action-menu-item>
          <seam-action-menu-item label="Action Three"></seam-action-menu-item>
        </seam-action-menu>
      </ng-template>
    </seam-datatable>
  `,
  standalone: false,
})
class ConditionalActionMenuComponent {
  @Input() columns: any

  @Input() rows: any

  public showActionMenu$: Observable<boolean>

  constructor() {
    this.showActionMenu$ = interval(5000).pipe(
      map((i) => i % 2 === 0),
      // eslint-disable-next-line no-console
      tap((show) => console.log('showActionMenu', show)),
    )
  }
}

export const ConditionalActionMenu: Story = {
  decorators: [
    moduleMetadata({
      declarations: [ConditionalActionMenuComponent],
    }),
  ],
  render: (args: any) => ({
    props: { ...args },
    template: `
      <dt-wrap
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
      </dt-wrap>`,
  }),
  args: {
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
}

class SearchCandy extends ColumnsDataFilter {
  public readonly name = 'search-candy'

  public readonly uid: string

  public form: FormGroup<any>

  public filterStateChanges: Observable<DataFilterState>

  public options: any

  private _updateFilterValue = new Subject<void>()

  constructor(prop: string, initialValue: any, column: TheSeamDatatableColumn) {
    super(prop, initialValue, column)

    this.form = new FormGroup({
      chocolatey: new FormControl<boolean | null>(null),
      nutty: new FormControl<boolean | null>(null),
      fruity: new FormControl<boolean | null>(null),
    })

    this.uid = `${this.name}--${prop}`

    this.filterStateChanges = this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.filterState()),
    )
  }

  public dataFilter(data: any[], filterValue: any, options: any): any[] {
    if (isNullOrUndefined(filterValue) || this.isDefault()) {
      return data
    }

    return data.filter((d) => {
      const dataProp = d[this.prop]
      if (isNullOrUndefined(dataProp) || !Array.isArray(dataProp)) {
        return false
      }

      if (filterValue.chocolatey && dataProp.includes('chocolatey')) {
        return true
      } else if (filterValue.nutty && dataProp.includes('nutty')) {
        return true
      } else if (filterValue.fruity && dataProp.includes('fruity')) {
        return true
      }

      return false
    })
  }

  public filter(data: any[]): Observable<any[]> {
    return this._updateFilterValue.pipe(
      startWith(undefined),
      map(() => this.dataFilter(data, this.form.value, undefined)),
    )
  }

  public filterState(): ColumnsDataFilterState {
    return {
      name: this.name,
      state: {
        prop: this.prop,
        formValue: this.form.value,
      },
    }
  }

  public applyFilter(): void {
    this._updateFilterValue.next()
  }

  public clearFilter(): void {
    this.form.setValue({
      chocolatey: null,
      nutty: null,
      fruity: null,
    })

    this._updateFilterValue.next()
  }

  public isDefault(): boolean {
    const formValue = this.form.value

    const isDefault =
      !formValue.chocolatey && !formValue.nutty && !formValue.fruity

    return isDefault
  }
}

class PreferencesAccessorService implements TheSeamPreferencesAccessor {
  private readonly _map = new Map<string, string>()

  public get(name: string): Observable<string> {
    console.log(`Getting preference '${name}'`, this._map.get(name))
    const tmp = JSON.stringify({
      version: 2,
      alterations: [
        {
          id: 'sort',
          type: 'sort',
          state: {
            sorts: [
              {
                prop: 'age',
                dir: 'desc',
              },
            ],
          },
        },
      ],
    })
    if (!this._map.has(name)) {
      this._map.set(name, tmp)
    }
    return of(this._map.get(name) || '{}')
  }

  public update(name: string, value: string): Observable<string> {
    console.log(`Updating preference '${name}' to`, value)
    this._map.set(name, value)
    return of(value)
  }

  public delete(name: string): Observable<boolean> {
    console.log(`Deleting preference '${name}'`)
    this._map.delete(name)
    return of(true)
  }
}

@Component({
  selector: 'dt-wrap',
  template: `
    <seam-datatable #dt class="w-100 h-100" [columns]="columns" [rows]="rows">
      <seam-datatable-column-filter filterName="search-candy">
        <ng-template
          seamDatatableColumnFilterTpl
          let-filterForm="filterForm"
          let-options="options"
          let-column="column"
          let-columnFilter="columnFilter"
        >
          <ng-container *ngIf="filterForm">
            <div [formGroup]="filterForm" class="mt-2">
              <seam-form-field [numPaddingErrors]="0" class="mb-1">
                <seam-checkbox seamInput formControlName="chocolatey"
                  >Chocolatey</seam-checkbox
                >
              </seam-form-field>
              <seam-form-field [numPaddingErrors]="0" class="mb-1">
                <seam-checkbox seamInput formControlName="nutty"
                  >Nutty</seam-checkbox
                >
              </seam-form-field>
              <seam-form-field [numPaddingErrors]="0" class="mb-1">
                <seam-checkbox seamInput formControlName="fruity"
                  >Fruity</seam-checkbox
                >
              </seam-form-field>
            </div>
          </ng-container>
        </ng-template>
      </seam-datatable-column-filter>
    </seam-datatable>
  `,
  standalone: false,
})
class ColumnFiltersComponent {
  @Input() columns: any
  @Input() rows: any
}

export const ColumnFilters: Story = {
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
          useClass: PreferencesAccessorService,
        },
      ],
    }),
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        TheSeamFormFieldModule,
        TheSeamCheckboxModule,
      ],
      declarations: [ColumnFiltersComponent],
      providers: [
        {
          provide: THESEAM_COLUMNS_DATA_FILTER,
          useValue: {
            name: 'search-candy',
            class: SearchCandy,
          },
          multi: true,
        },
      ],
    }),
  ],
  render: (args) => ({
    props: { ...args },
    template: `
      <dt-wrap
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
      </dt-wrap>
      `,
  }),
  args: {
    columns: [
      {
        prop: 'name',
        name: 'Name',
        filterable: true,
        cellClass: 'text-right',
        headerClass: 'text-right',
      },
      {
        prop: 'age',
        name: 'Age',
        filterable: true,
        filterOptions: { filterType: 'search-numeric' },
      },
      {
        prop: 'startDate',
        name: 'Start Date',
        cellType: 'date',
        cellTypeConfig: { type: 'date' },
        filterable: true,
        filterOptions: { dateType: 'datetime-local' },
      },
      { prop: 'color', name: 'Favorite Color', filterable: true },
      {
        prop: 'candy',
        name: 'Favorite Candy',
        filterable: true,
        filterOptions: {
          filterProp: 'candyAttributes',
          filterType: 'search-candy',
        },
      },
    ],
    rows: [
      {
        name: 'Mark',
        age: 27,
        color: 'blue',
        candy: 'Reeses',
        candyAttributes: ['chocolatey', 'nutty'],
        startDate: '2017-01-21 20:15:20.4166667 +00:00',
      },
      {
        name: 'Joe',
        age: 33,
        color: 'green',
        candy: 'Hershey Bar',
        candyAttributes: ['chocolatey'],
        startDate: '2012-04-25 17:29:36.4266667 +00:00',
      },
      {
        name: 'Shelby',
        age: 30,
        color: 'purple',
        candy: 'Snickers',
        candyAttributes: ['chocolatey', 'nutty'],
        startDate: '2020-11-18 20:47:25.1733333 +00:00',
      },
      {
        name: 'Jason',
        age: 'abc',
        color: 'orange',
        candy: 'Whoppers',
        candyAttributes: ['chocolatey'],
        startDate: '2016-05-24 23:13:26.3400000 +00:00',
      },
      {
        name: 'David',
        age: null,
        color: 'blue',
        candy: 'Skittles',
        candyAttributes: ['fruity'],
        startDate: '2021-06-29 16:31:37.2733333 +00:00',
      },
      {
        name: 'Pam',
        age: null,
        color: 'red',
        candy: 'Starbursts',
        candyAttributes: ['fruity'],
        startDate: '2012-08-11 04:00:00.000000 +00:00',
      },
      {
        name: 'New Employee',
        age: null,
        color: null,
        candy: null,
        startDate: null,
      },
    ],
  },
}

@Component({
  selector: 'dt-wrap',
  template: `
    <seam-datatable #dt class="w-100 h-100" [columns]="columns" [rows]="rows">
      <ng-template seamDatatableRowActionItem let-row>
        <seam-action-menu>
          <seam-action-menu-item label="Action One"></seam-action-menu-item>
          <seam-action-menu-item label="Action Two"></seam-action-menu-item>
          <seam-action-menu-item
            label="Action Three"
            [subMenu]="subMenuOne"
          ></seam-action-menu-item>
          <seam-action-menu-item label="Action Four"></seam-action-menu-item>
        </seam-action-menu>

        <seam-action-menu isSubMenu="true" #subMenuOne>
          <seam-action-menu-item label="Action One"></seam-action-menu-item>
          <seam-action-menu-item label="Action Two"></seam-action-menu-item>
          <seam-action-menu-item label="Action Three"></seam-action-menu-item>
        </seam-action-menu>
      </ng-template>

      <seam-datatable-footer>
        <ng-template
          seamDatatableFooterTpl
          let-rowCount="rowCount"
          let-pageSize="pageSize"
          let-selectedCount="selectedCount"
          let-curPage="curPage"
          let-offset="offset"
        >
          <div class="flex-grow-1 text-center mx-2" style="flex-basis: 50%;">
            Custom Footer Height
          </div>
        </ng-template>
      </seam-datatable-footer>
    </seam-datatable>
  `,
  standalone: false,
})
class CustomConfigComponent {
  @Input() columns: any
  @Input() rows: any
}
export const CustomConfig: Story = {
  decorators: [
    moduleMetadata({
      declarations: [CustomConfigComponent],
      providers: [
        {
          provide: THESEAM_DATATABLE_CONFIG,
          useValue: {
            rowHeight: 45,
            columnFilterIcon: faSearch,
            columnFilterUpdateMethod: 'submit',
            actionItemColumnPosition: 'frozenLeft',
          } satisfies TheSeamDatatableConfig,
        },
      ],
    }),
  ],
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <dt-wrap
        class="w-100 h-100"
        [columns]="columns"
        [rows]="rows">
      </dt-wrap>`,
  }),
  args: {
    columns: [
      { prop: 'name', name: 'Name', filterable: true },
      {
        prop: 'age',
        name: 'Age',
        filterable: true,
        filterOptions: { filterType: 'search-numeric' },
      },
      {
        prop: 'startDate',
        name: 'Start Date',
        cellType: 'date',
        cellTypeConfig: { type: 'date' },
        filterable: true,
      },
      { prop: 'color', name: 'Favorite Color', filterable: true },
      { prop: 'candy', name: 'Favorite Candy', filterable: true },
    ] satisfies TheSeamDatatableColumn[],
    rows: [
      {
        name: 'Mark',
        age: 27,
        color: 'blue',
        candy: 'Reeses',
        startDate: '2017-01-21 20:15:20.4166667 +00:00',
      },
      {
        name: 'Joe',
        age: 33,
        color: 'green',
        candy: 'Hershey Bar',
        startDate: '2012-04-25 17:29:36.4266667 +00:00',
      },
      {
        name: 'Shelby',
        age: 30,
        color: 'purple',
        candy: 'Snickers',
        startDate: '2020-11-18 20:47:25.1733333 +00:00',
      },
      {
        name: 'Jason',
        age: 'abc',
        color: 'orange',
        candy: 'Whoppers',
        startDate: '2016-05-24 23:13:26.3400000 +00:00',
      },
      {
        name: 'David',
        age: null,
        color: 'blue',
        candy: 'Skittles',
        startDate: '2021-06-29 16:31:37.2733333 +00:00',
      },
      {
        name: 'New Employee',
        age: null,
        color: null,
        candy: null,
        startDate: null,
      },
    ],
  },
}

export const ColumnAlign: Story = {
  decorators: [
    componentWrapperDecorator(
      (story) => `
        <seam-datatable class="w-100 h-100"
          [columns]="columns"
          [rows]="rows"
          [sorts]="sorts"
          [sortType]="'multi'">
        </seam-datatable>
      `,
    ),
  ],
  args: {
    columns: [
      {
        prop: 'name',
        name: 'Name',
        filterable: true,
        cellClass: 'text-right',
        headerClass: 'text-right',
      },
      {
        prop: 'title',
        name: 'Title',
        filterable: true,
        cellClass: 'text-right',
        headerClass: 'text-right',
        sortable: false,
      },
      {
        prop: 'age',
        name: 'Age',
        filterable: true,
        filterOptions: { filterType: 'search-numeric' },
        align: 'right',
      },
      {
        prop: 'startDate',
        name: 'Start Date',
        cellType: 'date',
        cellTypeConfig: { type: 'date' },
        filterable: true,
        filterOptions: { dateType: 'datetime-local' },
      },
      { prop: 'color', name: 'Favorite Color' },
      { prop: 'status', name: 'Status', filterable: true, align: 'center' },
      { prop: 'active', name: 'Active', filterable: true },
    ],
    rows: [
      {
        name: 'Mark',
        title: 'Something',
        age: 27,
        color: 'blue',
        startDate: '2017-01-21 20:15:20.4166667 +00:00',
        status: 'Pending',
        active: true,
      },
      {
        name: 'Joe',
        title: 'Something Else',
        age: 33,
        color: 'green',
        startDate: '2012-04-25 17:29:36.4266667 +00:00',
        status: 'InActive',
        active: false,
      },
      {
        name: 'Shelby',
        title: 'Something',
        age: 30,
        color: 'purple',
        startDate: '2020-11-18 20:47:25.1733333 +00:00',
        status: 'Active',
        active: true,
      },
      {
        name: 'Jason',
        title: 'Something Different',
        age: 'abc',
        color: 'orange',
        startDate: '2016-05-24 23:13:26.3400000 +00:00',
        status: 'Pending',
        active: false,
      },
      {
        name: 'David',
        title: 'Another Thing',
        age: null,
        color: 'blue',
        startDate: '2021-06-29 16:31:37.2733333 +00:00',
        status: 'New',
        active: true,
      },
      {
        name: 'Pam',
        age: null,
        color: 'red',
        startDate: '2012-08-11 04:00:00.000000 +00:00',
        status: 'Expired',
        active: false,
      },
      {
        name: 'New Employee',
        age: null,
        color: null,
        startDate: null,
        status: null,
        active: null,
      },
    ],
    sorts: [
      { prop: 'age', dir: 'desc' },
      { prop: 'status', dir: 'asc' },
      { prop: 'active', dir: 'asc' },
    ],
  },
}
