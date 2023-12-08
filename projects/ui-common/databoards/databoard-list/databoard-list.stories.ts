import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { TheSeamTableCellTypesModule } from '@theseam/ui-common/table-cell-types'
import { DataboardListComponent } from './databoard-list.component'
import { TheSeamDataboardModule } from '../databoard.module'
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop'
import { DataboardCard } from '../models/databoard-card'
import { DataboardBoardCards } from '../models/databoard-board-cards'
import { DataboardBoard, DataboardPredicate } from '../public-api'
import { TheSeamDatatableModule } from '@theseam/ui-common/datatable'
import { ExportersDataEvaluator, JexlEvaluator, THESEAM_DYNAMIC_VALUE_EVALUATOR } from '@theseam/ui-common/dynamic'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamActionMenuModule } from '@theseam/ui-common/action-menu'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'

const boardAddPredicate = (drag: CdkDrag<DataboardCard>, targetList: CdkDropList<DataboardBoardCards>) => {
  const card = drag.data
  switch (targetList.data.prop) {
    case 'mEntry':
      return card.status === 'ungraded'
    case 'review':
      return card.status === 'mEntry'
    case 'pendingFinalize':
      return card.status === 'review'
    case 'finalizeFailed':
      return false
    case 'pendingEOD':
      return card.status === 'pendingFinalize'
    case 'transmit':
      return card.status === 'pendingEOD'
    case 'ungraded':
    default:
      return false
  }
}

const boardContentPredicate: DataboardPredicate = (card: DataboardCard, board: DataboardBoardCards) => {
  return card.status === board.prop
}

const boards: DataboardBoard[] = [
  {
    prop: 'ungraded',
    headerText: 'Ungraded',
    draggable: true,
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    displayEmptyFooter: false
  },
  {
    prop: 'mEntry',
    headerText: 'Manual Entry',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    draggable: true,
    confirmAdd: true,
    confirmAddMessage: {
      message: {
        type: 'jexl',
        expr: '"Are you sure you want to move load " + data.loadId + " into Manual Entry?"'
      },
      alert: {
        message: {
          type: 'jexl',
          expr: '"FSA No. " + data.fsa',
        },
        theme: {
          type: 'jexl',
          expr: 'data.loadId % 2 == 0 ? "info" : "danger"'
        },
      }
    }
  },
  {
    prop: 'review',
    headerText: 'Review',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    confirmAdd: true,
    confirmAddMessage: {
      message: 'Are you sure you want to move this load into Review?'
    },
    reorderable: true,
    confirmReorder: true,
    confirmReorderMessage: {
      message: 'Are you sure you want change the order of this load?',
      alert: {
        message: 'This will not affect the order in which loads are displayed to other users.',
        theme: 'info'
      }
    }
  },
  {
    prop: 'pendingFinalize',
    headerText: 'Pending Finalize',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    confirmAdd: true,
    confirmAddMessage: {
      message: 'Are you sure you want to move this load into Pending Finalize?'
    }
  },
  {
    prop: 'finalizeFailed',
    headerText: 'Finalize Failed',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    confirmAdd: true,
    confirmAddMessage: {
      message: 'Are you sure you want to move this load into Finalize Failed?'
    }
  },
  {
    prop: 'pendingEOD',
    headerText: 'Pending EOD',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    confirmAdd: true,
    confirmAddMessage: {
      message: 'Are you sure you want to move this load into Pending EOD?'
    }
  },
  {
    prop: 'transmit',
    headerText: 'Transmit',
    contentPredicate: boardContentPredicate,
    addPredicate: boardAddPredicate,
    confirmAdd: true,
    confirmAddMessage: {
      message: 'Are you sure you want to move this load into Transmit?'
    }
  },
]

const cards: DataboardCard[] = [
  {
    id: 1,
    loadId: 123456781,
    weightTicket: '000-0001',
    fsa: 1234567,
    status: 'ungraded'
  },
  {
    id: 2,
    loadId: 123456782,
    weightTicket: '000-0002',
    fsa: 1234567,
    status: 'ungraded'
  },
  {
    id: 3,
    loadId: 123456783,
    weightTicket: '000-0003',
    fsa: 1234567,
    status: 'mEntry'
  },
  {
    id: 4,
    loadId: 123456784,
    weightTicket: '000-0004',
    fsa: 1234567,
    status: 'review'
  },
  {
    id: 5,
    loadId: 123456785,
    weightTicket: '000-0005',
    fsa: 1234567,
    status: 'review'
  },
  {
    id: 6,
    loadId: 123456786,
    weightTicket: '000-0006',
    fsa: 1234567,
    status: 'pendingFinalize'
  },
  {
    id: 7,
    loadId: 123456787,
    weightTicket: '000-0007',
    fsa: 1234567,
    status: 'pendingEOD'
  },
  {
    id: 8,
    loadId: 123456788,
    weightTicket: '000-0008',
    fsa: 1234567,
    status: 'finalizeFailed'
  },
  {
    id: 9,
    loadId: 123456789,
    weightTicket: '000-0009',
    fsa: 1234567,
    status: 'transmit'
  },
  {
    id: 10,
    loadId: 123456790,
    weightTicket: '000-0010',
    fsa: 1234567,
    status: 'transmit'
  },
  {
    id: 11,
    loadId: 123456791,
    weightTicket: '000-0001',
    fsa: 1234567,
    status: 'ungraded'
  },
  {
    id: 12,
    loadId: 123456792,
    weightTicket: '000-0002',
    fsa: 1234567,
    status: 'ungraded'
  },
  {
    id: 13,
    loadId: 123456793,
    weightTicket: '000-0003',
    fsa: 1234567,
    status: 'mEntry'
  },
  {
    id: 14,
    loadId: 123456794,
    weightTicket: '000-0004',
    fsa: 1234567,
    status: 'review'
  },
  {
    id: 15,
    loadId: 123456795,
    weightTicket: '000-0005',
    fsa: 1234567,
    status: 'review'
  },
  {
    id: 16,
    loadId: 123456796,
    weightTicket: '000-0006',
    fsa: 1234567,
    status: 'pendingFinalize'
  },
  {
    id: 17,
    loadId: 123456797,
    weightTicket: '000-0007',
    fsa: 1234567,
    status: 'pendingEOD'
  },
  {
    id: 18,
    loadId: 123456798,
    weightTicket: '000-0008',
    fsa: 1234567,
    status: 'finalizeFailed'
  },
  {
    id: 19,
    loadId: 123456799,
    weightTicket: '000-0009',
    fsa: 1234567,
    status: 'transmit'
  },
  {
    id: 20,
    loadId: 123456800,
    weightTicket: '000-0010',
    fsa: 1234567,
    status: 'transmit'
  },
  {
    id: 21,
    loadId: 123456801,
    weightTicket: '000-0010',
    fsa: 1234567,
    status: 'transmit'
  },
  {
    id: 22,
    loadId: 123456802,
    weightTicket: '000-0010',
    fsa: 1234567,
    status: 'transmit'
  },
]

export default {
  title: 'Databoards/Components',
  component: DataboardListComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        // RouterModule.forRoot([], { useHash: true }),
        TheSeamDataboardModule,
        TheSeamTableCellTypesModule,
        TheSeamDatatableModule,
        TheSeamButtonsModule,
        TheSeamActionMenuModule,
        TheSeamDataFiltersModule
      ],
      providers: [
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },
      ]
    }),
    componentWrapperDecorator(story => `<div class="vh-100 vw-100">${story}</div>`)
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    }
  }
} as Meta

export const Simple: Story = args => ({
  props: {
    __hack: { ...args },
    updateStatus(event: CdkDragDrop<DataboardBoardCards>) {
      console.log(`updateStatus: update load ${event.item.data.loadId} to ${event.container.data.prop}`)
    },
    openViewModal(card: DataboardCard) {
      console.log('open view modal', card)
    },
    openEditModal(card: DataboardCard) {
      console.log('open edit modal', card)
    },
    getBoardBadgeClass(prop: string) {
      switch (prop) {
        case 'mEntry':
        case 'pendingFinalize':
        case 'pendingEOD':
          return 'badge-warning'
        case 'review':
        case 'finalizeFailed':
          return 'badge-danger'
        case 'transmit':
          return 'badge-success'
        case 'ungraded':
        default:
          return 'badge-secondary'
      }
    },
    log: (arg: any) => console.log('log', arg)
  },
  template: `<seam-databoard-list
              class="w-100 h-100 p-2"
              [boards]="__hack.boards"
              [cards]="__hack.cards"
              (cardDrop)="updateStatus($event)">

              <ng-template seamDataboardHeaderTpl let-board>
                <div class="d-flex align-items-center justify-content-between">
                  <div>{{ board.headerText }}</div>
                  <div
                    class="badge badge-pill font-weight-normal shadow-sm"
                    [class]="getBoardBadgeClass(board.prop)"
                    style="padding-top: 6px; padding-bottom: 6px;">{{ board.cardCount }} loads</div>
                </div>
              </ng-template>

              <ng-template seamDataboardCardTpl let-card>
                <div class="d-flex align-items-end justify-content-between">
                  <div class="d-flex align-items-end justify-content-between">
                    <span class="text-black-50 small mr-2">Load ID</span>
                    <span class="h5 font-weight-bold mb-0">{{ card?.loadId }}</span>
                  </div>

                  <seam-action-menu>
                    <seam-action-menu-item label="View" (click)="openViewModal(card)"></seam-action-menu-item>
                    <seam-action-menu-item label="Edit" (click)="openEditModal(card)"></seam-action-menu-item>
                    <seam-action-menu-item label="Open Google" href="https://google.com" target="_blank" [confirmDialog]="{ message: 'Are you sure you want to leave the site?' }"></seam-action-menu-item>
                  </seam-action-menu>
                </div>
                <div class="d-flex align-items-end justify-content-between">
                  <span class="text-black-50 small mr-2">Weight Ticket</span>
                  <span>{{ card?.weightTicket }}</span>
                </div>
                <div class="d-flex align-items-end justify-content-between">
                  <span class="text-black-50 small mr-2">FSA-1007</span>
                  <span>{{ card?.fsa }}</span>
                </div>
              </ng-template>

              <seam-databoard-board prop="mEntry">
                <ng-template seamDataboardFooterTpl let-board>
                  <button seamButton theme="primary" size="sm" (click)="log(board)">Click Me!</button>
                </ng-template>
              </seam-databoard-board>

            </seam-databoard-list>`
})
Simple.args = {
  boards,
  cards
}

export const Filters: Story = args => ({
  props: {
    __hack: { ...args },
    updateStatus(event: CdkDragDrop<DataboardBoardCards>) {
      console.log(`updateStatus: update load ${event.item.data.loadId} to ${event.container.data.prop}`)
    },
    openViewModal(card: DataboardCard) {
      console.log('open view modal', card)
    },
    openEditModal(card: DataboardCard) {
      console.log('open edit modal', card)
    },
    getBoardBadgeClass(prop: string) {
      switch (prop) {
        case 'mEntry':
        case 'pendingFinalize':
        case 'pendingEOD':
          return 'badge-warning'
        case 'review':
        case 'finalizeFailed':
          return 'badge-danger'
        case 'transmit':
          return 'badge-success'
        case 'ungraded':
        default:
          return 'badge-secondary'
      }
    },
    log: (arg: any) => console.log('log', arg),
    filterButtons: [
      {
        name: 'All',
        value: '',
        comparator: (value: any, row: any) => true
      },
      {
        name: 'Even WT',
        value: 'even',
        comparator: (value: any, row: any) => {
          const last = row.weightTicket.slice(-1)
          return last % 2 === 0 ? 1 : -1
        }
      },
      {
        name: 'Odd WT',
        value: 'odd',
        comparator: (value: any, row: any) => {
          const last = row.weightTicket.slice(-1)
          return last % 2 !== 0 ? 1 : -1
        }
      },
    ]
  },
  template: `<seam-databoard-list
              class="w-100 h-100 p-2"
              [boards]="__hack.boards"
              [cards]="__hack.cards"
              (cardDrop)="updateStatus($event)">

              <seam-data-filter-menu-bar class="ml-1 mb-1">
                <seam-data-filter-menu-bar-row>
                  <seam-data-filter-menu-bar-column-right>
                    <seam-data-filter-search seamDataFilter></seam-data-filter-search>
                  </seam-data-filter-menu-bar-column-right>
                </seam-data-filter-menu-bar-row>
                <seam-datatable-menu-bar-row>
                  <seam-datatable-menu-bar-column-left></seam-datatable-menu-bar-column-left>
                  <seam-datatable-menu-bar-column-center>
                    <seam-data-filter-toggle-buttons seamDataFilter
                      [buttons]="filterButtons"
                      [multiple]="false"
                      [selectionToggleable]="false">
                    </seam-data-filter-toggle-buttons>
                  </seam-datatable-menu-bar-column-center>
                  <seam-datatable-menu-bar-column-right></seam-datatable-menu-bar-column-right>
                </seam-datatable-menu-bar-row>
              </seam-data-filter-menu-bar>

              <ng-template seamDataboardHeaderTpl let-board>
                <div class="d-flex align-items-center justify-content-between">
                  <div>{{ board.headerText }}</div>
                  <div
                    class="badge badge-pill font-weight-normal shadow-sm"
                    [class]="getBoardBadgeClass(board.prop)"
                    style="padding-top: 6px; padding-bottom: 6px;">{{ board.cardCount }} loads</div>
                </div>
              </ng-template>

              <ng-template seamDataboardCardTpl let-card>
                <div class="d-flex align-items-end justify-content-between">
                  <div class="d-flex align-items-end justify-content-between">
                    <span class="text-black-50 small mr-2">Load ID</span>
                    <span class="h5 font-weight-bold mb-0">{{ card?.loadId }}</span>
                  </div>

                  <seam-action-menu>
                    <seam-action-menu-item label="View" (click)="openViewModal(card)"></seam-action-menu-item>
                    <seam-action-menu-item label="Edit" (click)="openEditModal(card)"></seam-action-menu-item>
                    <seam-action-menu-item label="Open Google" href="https://google.com" target="_blank" [confirmDialog]="{ message: 'Are you sure you want to leave the site?' }"></seam-action-menu-item>
                  </seam-action-menu>
                </div>
                <div class="d-flex align-items-end justify-content-between">
                  <span class="text-black-50 small mr-2">Weight Ticket</span>
                  <span>{{ card?.weightTicket }}</span>
                </div>
                <div class="d-flex align-items-end justify-content-between">
                  <span class="text-black-50 small mr-2">FSA-1007</span>
                  <span>{{ card?.fsa }}</span>
                </div>
              </ng-template>

              <seam-databoard-board prop="mEntry">
                <ng-template seamDataboardFooterTpl let-board>
                  <button seamButton theme="primary" size="sm" (click)="log(board)">Click Me!</button>
                </ng-template>
              </seam-databoard-board>

            </seam-databoard-list>`
})
Filters.args = {
  boards,
  cards
}
