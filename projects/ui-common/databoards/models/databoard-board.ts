import { DynamicValue } from "@theseam/ui-common/dynamic"
import { DataboardCard } from "./databoard-card"
import { ThemeTypes } from "@theseam/ui-common/models"
import { CdkDrag, CdkDropList } from "@angular/cdk/drag-drop"
import { DataboardBoardCards } from "./databoard-board-cards"

export interface DataboardBoard {

  prop?: string

  cssClass?: DynamicValue<string>

  headerTpl?: any

  headerText?: DynamicValue<string>

  displayEmptyHeader?: DynamicValue<boolean>

  cardTpl?: any

  emptyTpl?: any

  emptyText?: DynamicValue<string>

  footerTpl?: any

  footerText?: DynamicValue<string>

  displayEmptyFooter?: DynamicValue<boolean>

  // TODO: implement
  /**
   * Boolean that determines whether the board can be collapsed,
   * so that only the header is showing.
   */
  collapsible?: DynamicValue<boolean>

  // TODO: need to take action (besides emit) on sort?
  /**
   * Boolean that determines whether the user can rearrange cards
   * within a board, thus applying a manual sort.
   */
  reorderable?: DynamicValue<boolean>

  /**
   * Boolean that disables dragging for the entire board.
   * This includes dragging to other boards and sorting within the board.
   */
  draggable?: DynamicValue<boolean>

  // TODO: implement
  /**
   * When `true`, adds a select button to each card and a "Select All"
   * option to the board, for use in batch edit actions.
   */
  selectable?: DynamicValue<boolean>

  /**
   * Function that takes a card record and
   * returns a boolean determining whether the
   * card should appear in this board.
   */
  contentPredicate?: DataboardPredicate

  /**
   * Function that takes a card record and
   * returns a boolean determining whether the
   * card is allowed to be added to this board.
   */
  addPredicate?: DataboardDragPredicate

  // TODO: remove? not implemented
  // addAction?: DataboardAction

  confirmAdd?: DynamicValue<boolean>

  confirmAddMessage?: DataboardDynamicConfirmMessage

  confirmReorder?: DynamicValue<boolean>

  confirmReorderMessage?: DataboardDynamicConfirmMessage

  // TODO: are these necessary? Don't want to conflict with add attributes
  /**
   * Function that takes a card record and
   * returns a boolean determining whether the
   * card is allowed to be removed from this board.
   */
  // removePredicate?: DataboardPredicate

  // removeAction?: DataboardAction

  // confirmRemove?: DynamicValue<boolean>

  // confirmRemoveMessage?: DynamicValue<string>

}

export type DataboardDragPredicate = (drag: CdkDrag<DataboardCard>, targetList: CdkDropList<DataboardBoardCards>) => boolean

export type DataboardPredicate = (card: DataboardCard, board: DataboardBoard) => boolean

// export type DataboardAction = (x: any) => void

export interface DataboardDynamicConfirmMessage {
  message?: DynamicValue<string>

  alert?: DynamicValue<string> | { message: DynamicValue<string>, theme: DynamicValue<ThemeTypes> }
}

export interface DataboardConfirmMessage {
  message?: string

  alert?: string | { message: string, type: ThemeTypes }
}

export interface DataboardBoardData {
  prop: string | undefined

  cardCount: number

  headerText: string | undefined

  emptyText: string | undefined

  footerText: string | undefined
}
