import { Component, ContentChild, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, isDevMode } from '@angular/core'
import { DataboardBoard } from '../models/databoard-board'
import { BehaviorSubject, Observable, combineLatest } from 'rxjs'
import { DataboardCard } from '../models/databoard-card'
import { map } from 'rxjs/operators'
import { DataboardCardTplDirective } from '../directives/databoard-card-tpl.directive'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { DataboardBoardCards } from '../models/databoard-board-cards'
import { DataboardHorizontalLayoutBehavior, DataboardVerticalLayoutBehavior } from '../models/databoard'
import { isNullOrUndefined } from '@theseam/ui-common/utils'
import { DataboardHeaderTplDirective } from '../directives/databoard-header-tpl.directive'
import { DataboardFooterTplDirective } from '../directives/databoard-footer-tpl.directive'
import { DataboardEmptyBoardTplDirective } from '../directives/databoard-empty-board-tpl.directive'
import { DataboardBoardComponent } from '../databoard-board/databoard-board.component'

@Component({
  selector: 'seam-databoard-list',
  templateUrl: './databoard-list.component.html',
  styleUrls: ['./databoard-list.component.scss']
})
export class DataboardListComponent implements OnInit {

  @Input()
  get boards(): DataboardBoard[] {
    return this._inputBoards.value
  }
  set boards(value: DataboardBoard[]) {
    this._inputBoards.next(value || [])
  }
  private _inputBoards = new BehaviorSubject<DataboardBoard[]>([])

  @Input()
  get cards(): DataboardCard[] {
    return this._cards.value
  }
  set cards(value: DataboardCard[]) {
    this._cards.next(value || [])
  }
  private _cards = new BehaviorSubject<DataboardCard[]>([])

  /**
   * When set to `wrap`, boards that exceed the width of the wrapper will
   * wrap to the next line. When set to `no-wrap` (the default), the boards
   * will remain on one line and overflow the width of the container, with
   * the overflow accessible through a scrollbar.
   */
  @Input() horizontalLayoutBehavior: DataboardHorizontalLayoutBehavior = 'no-wrap'
  get horizontalLayoutClass(): string {
    return `databoards-wrapper__${this.horizontalLayoutBehavior}`
  }
  get allowHorizontalScroll(): boolean {
    return this.horizontalLayoutBehavior === 'no-wrap'
  }

  /**
   * When set to `list-scroll`, the height of the boards will grow to fit their
   * content, and the entire list will be controlled by one vertical scrollbar.
   * When set to `board-scroll` (the default), the height of the boards will be
   * limited to the height of the container, and each board's contents will have
   * its own scrollbar.
   */
  @Input() verticalLayoutBehavior: DataboardVerticalLayoutBehavior = 'board-scroll'
  get allowVerticalScroll(): boolean {
    return this.verticalLayoutBehavior === 'list-scroll'
  }

  /**
   * Set to `false` if a card that meets the requirements
   * for more than one board should only appear in the first
   * board it matches.
   */
  @Input() allowMultiCard = true

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('cardTpl')
  _cardTplInput?: TemplateRef<any> | null

  @ContentChild(DataboardCardTplDirective, { read: TemplateRef, descendants: false })
  _cardTplQuery?: TemplateRef<any>

  get cardTpl(): TemplateRef<any> | undefined | null {
    return this._cardTplInput || this._cardTplQuery
  }

  @ContentChild(DataboardHeaderTplDirective, { read: TemplateRef, descendants: false })
  _headerTplQuery?: TemplateRef<any>

  @ContentChild(DataboardEmptyBoardTplDirective, { read: TemplateRef, descendants: false })
  _emptyBoardTplQuery?: TemplateRef<any>

  @ContentChild(DataboardFooterTplDirective, { read: TemplateRef, descendants: false })
  _footerTplQuery?: TemplateRef<any>

  @ContentChildren(DataboardBoardComponent)
  get templateBoards(): QueryList<DataboardBoardComponent> | undefined {
    return this._templateBoards.value
  }
  set templateBoards(value: QueryList<DataboardBoardComponent> | undefined) {
    this._templateBoards.next(value)
  }
  private _templateBoards = new BehaviorSubject<QueryList<DataboardBoardComponent> | undefined>(undefined)

  @Output() cardDrop = new EventEmitter<CdkDragDrop<DataboardCard>>()

  public boardsAndCards$: Observable<DataboardBoardCards[]> | undefined

  ngOnInit(): void {
    const templateAndInputBoards$ = combineLatest([this._inputBoards.asObservable(), this._templateBoards.asObservable()]).pipe(
      map(([ inputBoards, templateBoards ]) => {
        if (isNullOrUndefined(templateBoards) || templateBoards.length === 0) {
          return inputBoards
        }

        const tba = this._buildBoardConfig(templateBoards)

        inputBoards.forEach(inputBoard => {
          const templateBoard = tba.find(t => t.prop === inputBoard.prop)
          if (templateBoard !== undefined) {
            inputBoard.headerTpl = templateBoard.headerTpl
            inputBoard.cardTpl = templateBoard.cardTpl
            inputBoard.emptyTpl = templateBoard.emptyTpl
            inputBoard.footerTpl = templateBoard.footerTpl
          }
        })

        return inputBoards
      })
    )

    this.boardsAndCards$ = combineLatest([templateAndInputBoards$, this._cards.asObservable()]).pipe(
      map(([boards, cards]) => this._buildBoardsAndCards(boards, cards)),
    )
  }

  private _buildBoardConfig(templateBoards: QueryList<DataboardBoardComponent> | undefined): DataboardBoard[] {
    if (isNullOrUndefined(templateBoards) || templateBoards.length === 0) {
      return []
    }

    return templateBoards.toArray().map(t => ({
      prop: t.prop,
      headerTpl: t._headerTplQuery,
      cardTpl: t._cardTplQuery,
      emptyTpl: t._emptyBoardTplQuery,
      footerTpl: t._footerTplQuery
    } as DataboardBoard))
  }

  private _buildBoardsAndCards(boards: DataboardBoard[] | undefined, cards: DataboardCard[] | undefined): DataboardBoardCards[] {
    if (boards === null || boards === undefined || boards.length === 0) {
      return []
    }

    if (cards === null || cards === undefined || cards.length === 0) {
      return boards
    }

    return boards.map(board => {
      let boardCards = []
      if (isNullOrUndefined(board.contentPredicate) || typeof board.contentPredicate !== 'function') {
        if (isDevMode()) {
          console.warn(`Invalid contentPredicate: ${board.contentPredicate}. No cards will be applied to this board.`)
        }
      } else {
        boardCards = cards.filter((card, index) => {
          try {
            if (card === null) { return false }

            const filterResult = board.contentPredicate?.call(undefined, card, board)
            if (filterResult && !this.allowMultiCard) {
              cards.splice(index, 1, null)
            }

            return filterResult
          } catch (err) {
            if (isDevMode()) {
              console.warn(`An error occured while executing the contentPredicate. The card will not be applied.\n\n contentPredicate: ${board.contentPredicate}\n\n card: ${JSON.stringify(card)}`)
            }

            return false
          }
        })
      }

      return {
        ...board,
        headerTpl: board.headerTpl || this._headerTplQuery,
        emptyTpl: board.emptyTpl || this._emptyBoardTplQuery,
        footerTpl: board.footerTpl || this._footerTplQuery,
        cardTpl: board.cardTpl || this.cardTpl,
        cards: boardCards
      } as DataboardBoardCards
    })
  }

  _cardDrop(event: CdkDragDrop<DataboardBoardCards>) {
    if (event.previousContainer === event.container) {
      if (event.container.data.cards === null || event.container.data.cards === undefined) {
        return
      }

      moveItemInArray(event.container.data.cards, event.previousIndex, event.currentIndex)

      this.cardDrop.emit(event)
    } else {
      if (event.container.data.cards === null || event.container.data.cards === undefined || event.previousContainer.data.cards === null || event.previousContainer.data.cards === undefined) {
        return
      }

      transferArrayItem(
        event.previousContainer.data.cards,
        event.container.data.cards,
        event.previousIndex,
        event.currentIndex,
      )

      this.cardDrop.emit(event)
    }
  }
}
