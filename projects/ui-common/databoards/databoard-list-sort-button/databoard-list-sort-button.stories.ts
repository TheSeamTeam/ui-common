import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { provideAnimations } from '@angular/platform-browser/animations'

import { CSVDataExporter, XLSXDataExporter } from '@theseam/ui-common/data-exporter'
import { ExportersDataEvaluator, JexlEvaluator, THESEAM_DYNAMIC_VALUE_EVALUATOR } from '@theseam/ui-common/dynamic'
import { StoryToastrService } from '@theseam/ui-common/story-helpers'
import { ToastrService } from 'ngx-toastr'

import { DataboardListSortButtonComponent } from './databoard-list-sort-button.component'
import { TheSeamDataboardModule } from '../databoard.module'
import { DataboardBoard } from '../models/databoard-board'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'

export default {
  title: 'Databoards/Components',
  component: DataboardListSortButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDataboardModule,
        TheSeamDataFiltersModule
      ],
      providers: [
        { provide: ToastrService, useClass: StoryToastrService },
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

export const Sorts: Story = args => ({
  props: {
    boards: [
      {
        prop: 'unassigned',
        headerText: 'Unassigned',
        contentPredicate: (card, board) => card.status === board.prop
      },
      {
        prop: 'inProgress',
        headerText: 'In Progress',
        contentPredicate: (card, board) => card.status === board.prop
      },
      {
        prop: 'testing',
        headerText: 'Testing',
        contentPredicate: (card, board) => card.status === board.prop
      },
      {
        prop: 'delayed',
        headerText: 'Delayed',
        contentPredicate: (card, board) => card.status === board.prop
      },
      {
        prop: 'done',
        headerText: 'Done',
        contentPredicate: (card, board) => card.status === board.prop
      }
    ] as DataboardBoard[],
    cards: [
      {
        name: 'Action Menu',
        status: 'testing',
        dueDate: '2023-01-01'
      },
      {
        name: 'Add Sorting at Board level',
        status: 'unassigned',
        dueDate: '2022-05-01'
      },
      {
        name: 'Add Sorting at List level',
        status: 'unassigned',
        dueDate: '2024-05-01'
      },
      {
        name: 'Exporting',
        status: 'testing',
        dueDate: '2026-01-01'
      },
      {
        name: 'GraphQL',
        status: 'testing',
        dueDate: '2023-12-31'
      },
      {
        name: 'Add option to hide empty boards',
        status: 'unassigned',
        dueDate: '2023-11-01'
      },
      {
        name: 'Drag and Drop',
        status: 'testing',
        dueDate: '2023-10-01'
      },
      {
        name: 'Search Filters',
        status: 'done',
        dueDate: '2023-09-01'
      },
      {
        name: 'Implement Custom Templates',
        status: 'done',
        dueDate: '2022-12-01'
      },
    ],
    exporters: [
      new CSVDataExporter(),
      new XLSXDataExporter(),
    ],
    exportProps: [
      {
        prop: 'name',
        name: 'Name'
      },
      {
        prop: 'status',
        name: 'Status'
      },
      {
        prop: 'dueDate',
        name: 'Due Date'
      },
    ]
  },
  template: `
    <div class="vh-100 d-flex flex-column p-2">
      <seam-databoard-list
        class="w-100 h-100"
        [boards]="boards"
        [cards]="cards"
        [dataProps]="exportProps">

        <seam-data-filter-menu-bar>
          <div class="d-flex flex-row justify-content-end">
            <seam-databoard-list-export-button [exporters]="exporters"></seam-databoard-list-export-button>
            <seam-databoard-list-sort-button class="ml-2"></seam-databoard-list-sort-button>
          </div>
        </seam-data-filter-menu-bar>

        <ng-template seamDataboardCardTpl let-card>
          <div class="d-flex align-items-end justify-content-between">
            <div class="d-flex align-items-end justify-content-between">
              <span class="h6 font-weight-bold mb-0">{{ card?.name }}</span>
            </div>
          </div>
          <div class="d-flex align-items-end justify-content-between">
            <span class="text-black-50 small mr-2">Status</span>
            <span>{{ card?.status }}</span>
          </div>
          <div class="d-flex align-items-end justify-content-between">
            <span class="text-black-50 small mr-2">Due Date</span>
            <span>{{ card?.dueDate }}</span>
          </div>
        </ng-template>

        <ng-template seamDataboardFooterTpl let-board>
          <seam-databoard-list-sort-button [prop]="board.prop"></seam-databoard-list-sort-button>
        </ng-template>


      </seam-databoard-list>
    </div>`,
})
