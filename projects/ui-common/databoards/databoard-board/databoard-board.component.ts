import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core'
import { DataboardCard } from '../models/databoard-card'
import { CdkDragDrop } from '@angular/cdk/drag-drop'
import { DataboardBoardCards } from '../models/databoard-board-cards'
import { notNullOrUndefined } from '@theseam/ui-common/utils'
import { SeamConfirmDialogService } from '@theseam/ui-common/confirm-dialog'
import { TrackByFunction } from '@theseam/ui-common/table'
import { DataboardVerticalLayoutBehavior } from '../models/databoard'
import { DynamicValueHelperService } from '@theseam/ui-common/dynamic'
import { DataboardHeaderTplDirective } from '../directives/databoard-header-tpl.directive'
import { DataboardEmptyBoardTplDirective } from '../directives/databoard-empty-board-tpl.directive'
import { DataboardFooterTplDirective } from '../directives/databoard-footer-tpl.directive'
import { DataboardCardTplDirective } from '../directives/databoard-card-tpl.directive'
import { ThemeTypes } from '@theseam/ui-common/models'
import { DataboardBoardData, DataboardConfirmMessage, DataboardDragPredicate, DataboardDynamicConfirmMessage } from '../models/databoard-board'

@Component({
  selector: 'seam-databoard-board',
  templateUrl: './databoard-board.component.html',
  styleUrls: ['./databoard-board.component.scss']
})
export class DataboardBoardComponent {

  @Input() prop: string | undefined

  @Input()
  get boardAndCards(): DataboardBoardCards | undefined {
    return this._boardAndCards
  }
  set boardAndCards(value: DataboardBoardCards | undefined) {
    this._boardAndCards = value

    if (value) {
      this._setBoardConfig(value)
    }
  }
  private _boardAndCards: DataboardBoardCards | undefined

  /**
   * Inherits from DataboardListComponent. When set to `list-scroll`, the vertical scrollbar
   * will be disabled within the databoard. When set to `board-scroll` (the default), the
   * vertical scrollbar will be enabled within the databoard body.
   */
  @Input() verticalLayoutBehavior: DataboardVerticalLayoutBehavior | undefined | null
  get allowVerticalScroll(): boolean {
    return this.verticalLayoutBehavior === 'board-scroll'
  }

  _cssClass: string | undefined

  _headerTpl: TemplateRef<any> | undefined | null
  _headerText: string | undefined
  _displayEmptyHeader = true

  _cardTpl: TemplateRef<any> | undefined | null
  _cards: DataboardCard[] | undefined | null
  _trackBy: TrackByFunction<DataboardCard> = (index, item) => item

  _emptyTpl: TemplateRef<any> | undefined | null
  _emptyText = 'No records available.'

  _footerTpl: TemplateRef<any> | undefined | null
  _footerText: string | undefined
  _displayEmptyFooter = true

  _collapsible = false
  _reorderable = false
  _draggable = false
  _selectable = false

  _addPredicate: DataboardDragPredicate = () => true
  // _addAction: DataboardAction | undefined

  _confirmAdd = false
  _confirmAddMessage: DataboardDynamicConfirmMessage | undefined

  _confirmReorder = false
  _confirmReorderMessage: DataboardDynamicConfirmMessage | undefined

  @ContentChild(DataboardCardTplDirective, { read: TemplateRef })
  _cardTplQuery?: TemplateRef<any>

  @ContentChild(DataboardHeaderTplDirective, { read: TemplateRef })
  _headerTplQuery?: TemplateRef<any>

  @ContentChild(DataboardEmptyBoardTplDirective, { read: TemplateRef })
  _emptyBoardTplQuery?: TemplateRef<any>

  @ContentChild(DataboardFooterTplDirective, { read: TemplateRef })
  _footerTplQuery?: TemplateRef<any>

  @Output() cardDrop = new EventEmitter<CdkDragDrop<DataboardCard>>()

  constructor(
    private readonly _valueHelper: DynamicValueHelperService,
    private readonly _confirmDialog: SeamConfirmDialogService
  ) { }

  // TODO: not sure I like this
  get boardData(): DataboardBoardData {
    return {
      prop: this.prop,
      cardCount: this.cardCount,
      headerText: this._headerText,
      emptyText: this._emptyText,
      footerText: this._footerText,
    }
  }

  get cardCount(): number {
    return this._cards?.length || 0
  }

  _cardDrop(event: CdkDragDrop<DataboardCard>) {
    // this.addAction?.call(event.item, undefined)
    if (this._confirmReorder &&
        event.previousContainer === event.container &&
        event.previousIndex !== event.currentIndex) {
      const confirmMessage = this._evaluateConfirmMessage(this._confirmReorderMessage, event.item)

      this._confirmDialog
        .open(confirmMessage.message, confirmMessage.alert)
        .afterClosed()
        .subscribe(v => {
          if (v === 'confirm') {
            this.cardDrop.emit(event)
          }
        })
    } else if (this._confirmAdd && event.previousContainer !== event.container) {
      const confirmMessage = this._evaluateConfirmMessage(this._confirmAddMessage, event.item)

      this._confirmDialog
        .open(confirmMessage.message, confirmMessage.alert)
        .afterClosed()
        .subscribe(v => {
          if (v === 'confirm') {
            this.cardDrop.emit(event)
          }
        })
    } else {
      this.cardDrop.emit(event)
    }
  }

  private _setBoardConfig(value: DataboardBoardCards) {
    console.log('_setBoardConfig', value)
    this.prop = value.prop

    this._cssClass = this._valueHelper.evalSync(value.cssClass, value)

    this._headerTpl = value.headerTpl
    this._headerText = this._valueHelper.evalSync(value.headerText, value)
    const evalDisplayEmptyHeader = this._valueHelper.evalSync(value.displayEmptyHeader, value)
    this._displayEmptyHeader = notNullOrUndefined(evalDisplayEmptyHeader) ? evalDisplayEmptyHeader : this._displayEmptyHeader

    this._cardTpl = value.cardTpl
    this._cards = value.cards

    this._emptyTpl = value.emptyTpl
    this._emptyText = this._valueHelper.evalSync(value.emptyText, value) || this._emptyText

    this._footerTpl = value.footerTpl
    this._footerText = this._valueHelper.evalSync(value.footerText, value)
    const evalDisplayEmptyFooter = this._valueHelper.evalSync(value.displayEmptyFooter, value)
    this._displayEmptyFooter = notNullOrUndefined(evalDisplayEmptyFooter) ? evalDisplayEmptyFooter : this._displayEmptyFooter

    const evalCollapsible = this._valueHelper.evalSync(value.collapsible, value)
    this._collapsible = notNullOrUndefined(evalCollapsible) ? evalCollapsible : this._collapsible

    const evalReorderable = this._valueHelper.evalSync(value.reorderable, value)
    this._reorderable = notNullOrUndefined(evalReorderable) ? evalReorderable : this._reorderable

    const evalDraggable = this._valueHelper.evalSync(value.draggable, value)
    this._draggable = notNullOrUndefined(evalDraggable) ? evalDraggable : this._draggable

    const evalSelectable = this._valueHelper.evalSync(value.selectable, value)
    this._selectable = notNullOrUndefined(evalSelectable) ? evalSelectable : this._selectable

    this._addPredicate = value.addPredicate || this._addPredicate
    // this._addAction = value.addAction

    const evalConfirmAdd = this._valueHelper.evalSync(value.confirmAdd, value)
    this._confirmAdd = notNullOrUndefined(evalConfirmAdd) ? evalConfirmAdd : this._confirmAdd
    this._confirmAddMessage = value.confirmAddMessage

    const evalConfirmReorder = this._valueHelper.evalSync(value.confirmReorder, value)
    this._confirmReorder = notNullOrUndefined(evalConfirmReorder) ? evalConfirmReorder : this._confirmReorder
    this._confirmReorderMessage = value.confirmReorderMessage
  }

  private _evaluateConfirmMessage(message: DataboardDynamicConfirmMessage | undefined, context: any): DataboardConfirmMessage {
    let alertMessage: string | undefined
    let alertTheme: ThemeTypes | undefined
    if (notNullOrUndefined(message) && notNullOrUndefined(message.alert)) {
      const evalAlert = this._valueHelper.evalSync(message.alert, context)
      if (typeof evalAlert === 'string') {
        alertMessage = evalAlert
      } else if (typeof message.alert === 'object') {
        if ('message' in message.alert) {
          alertMessage = this._valueHelper.evalSync(message.alert?.message, context)
        }
        if ('theme' in message.alert) {
          alertTheme = this._valueHelper.evalSync(message.alert?.theme, context)
        }
      }
    }

    const r = {
      message: this._valueHelper.evalSync(message?.message, context),
      alert: alertMessage && alertTheme ? {
        message: alertMessage,
        type: alertTheme
      } : alertMessage
    }

    return r
  }

}
