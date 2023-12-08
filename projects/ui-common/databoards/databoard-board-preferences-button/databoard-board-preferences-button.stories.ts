import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { applicationConfig } from '@storybook/angular/dist/client/decorators'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import { CSVDataExporter, XLSXDataExporter } from '@theseam/ui-common/data-exporter'
import { TheSeamDataFiltersModule } from '@theseam/ui-common/data-filters'

import { DataboardBoardPreferencesButtonComponent } from './databoard-board-preferences-button.component'
import { BoardsAlterationsChangedRecord, DataboardBoardsAlterationsManagerService } from '../services/databoard-boards-alterations-manager.service'
import { BoardsAlteration } from '../models/board-alteration'
import { TheSeamDataboardModule } from '../databoard.module'
import { THESEAM_DATABOARDLIST_ACCESSOR } from '../tokens/databoard-list-accessor'
import { THESEAM_DATABOARDLIST_PREFERENCES_ACCESSOR } from '../tokens/databoard-preferences-accessor'
import { DataboardListPreferencesAccessorLocalService } from '../stories/preferences-accessor-local'
import { DataboardBoard } from '../models/databoard-board'

class MockDataboardList {

  _boards = new BehaviorSubject<DataboardBoard[]>([
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
  ] as DataboardBoard[])

  get boards() { return this._boards.value }
  set boards(value: any) { this._boards.next(value) }

  boards$ = this._boards.asObservable()

}

class MockBoardsAlterationsManagerService implements Partial<DataboardBoardsAlterationsManagerService> {

  public add(alterations: BoardsAlteration[], options?: { emitEvent?: boolean }): BoardsAlterationsChangedRecord[] {
    return []
  }
  public clear(options?: { emitEvent?: boolean }): BoardsAlterationsChangedRecord[] {
    return []
  }

}

export default {
  title: 'Databoards/Components/Board Preferences',
  component: DataboardBoardPreferencesButtonComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([], { useHash: true }),
        ),
        {
          provide: THESEAM_DATABOARDLIST_PREFERENCES_ACCESSOR,
          useClass: DataboardListPreferencesAccessorLocalService,
        },
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamDataFiltersModule,
        TheSeamDataboardModule,
      ],
      providers: [
        // {
        //   provide: THESEAM_DATABOARD_PREFERENCES_ACCESSOR,
        //   useClass: DataboardPreferencesAccessorLocalService,
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
} as Meta

export const Example: Story = args => ({
  // moduleMetadata: {
  //   providers: [
  //     { provide: THESEAM_DATABOARDLIST_ACCESSOR, useClass: MockDataboardList },
  //     { provide: DataboardBoardsAlterationsManagerService, useClass: MockBoardsAlterationsManagerService },
  //   ],
  // },
  props: {
    __hack: {
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
          dueDate: 'ASAP'
        },
        {
          name: 'Add Sorting at Board level',
          status: 'unassigned',
          dueDate: 'ASAP'
        },
        {
          name: 'Add Sorting at List level',
          status: 'unassigned',
          dueDate: 'ASAP'
        },
        {
          name: 'Exporting',
          status: 'testing',
          dueDate: 'ASAP'
        },
        {
          name: 'GraphQL',
          status: 'testing',
          dueDate: 'ASAP'
        },
        {
          name: 'Add option to hide empty boards',
          status: 'unassigned',
          dueDate: 'ASAP'
        },
        {
          name: 'Drag and Drop',
          status: 'testing',
          dueDate: 'ASAP'
        },
        {
          name: 'Search Filters',
          status: 'done',
          dueDate: 'ASAP'
        },
        {
          name: 'Implement Custom Templates',
          status: 'done',
          dueDate: 'ASAP'
        },
      ],
      exporters: [
        new CSVDataExporter(),
        new XLSXDataExporter(),
      ],
    },
  },
  template: `
    <div class="vh-100 w-100 d-flex flex-board p-2">
      <seam-databoard-list
        class="w-100"
        preferencesKey="databoard-prefs-test"
        [boards]="__hack.boards"
        [cards]="__hack.cards">

        <seam-data-filter-menu-bar>
          <seam-data-filter-menu-bar-row>
            <seam-data-filter-menu-bar-column-left>
              <seam-data-filter-search seamDataFilter></seam-data-filter-search>
            </seam-data-filter-menu-bar-column-left>
            <seam-data-filter-menu-bar-column-right>
              <div class="d-flex flex-row justify-content-end">
                <seam-databoard-board-preferences-button></seam-databoard-board-preferences-button>
              </div>
            </seam-data-filter-menu-bar-column-right>
          </seam-data-filter-menu-bar-row>
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
      </seam-databoard-list>
    </div>`,
})
// TODO: implement
// Example.play = async ({ canvasElement, fixture }) => {
//   const databoardHarness = await getHarness(TheSeamDataboardHarness, { canvasElement, fixture })

//   await expectFn(await databoardHarness.getCurrentPage()).toBe(1)
//   // const page2BtnHarness = await (await databoardHarness.getPager()).getPageButtonHarness(2)
//   // await (await page2BtnHarness.getAnchor()).click()
//   // await expectFn(await databoardHarness.getCurrentPage()).toBe(2)
// }

export const Popover: Story = args => ({
  moduleMetadata: {
    providers: [
      { provide: THESEAM_DATABOARDLIST_ACCESSOR, useClass: MockDataboardList },
      { provide: DataboardBoardsAlterationsManagerService, useClass: MockBoardsAlterationsManagerService },
    ],
  },
  props: { },
  template: `
    <div class="popover m-2">
      <div class="popover-body">
        <seam-databoard-board-preferences></seam-databoard-board-preferences>
      </div>
    </div>`,
})
