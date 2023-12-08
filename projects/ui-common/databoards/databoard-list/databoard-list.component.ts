import { Component, ContentChild, ContentChildren, EventEmitter, forwardRef, Input, Output, QueryList, TemplateRef, isDevMode, OnDestroy, TrackByFunction } from '@angular/core'
import { DataboardBoard } from '../models/databoard-board'
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, from, of } from 'rxjs'
import { DataboardCard } from '../models/databoard-card'
import { concatMap, distinctUntilChanged, map, shareReplay, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'
import { DataboardCardTplDirective } from '../directives/databoard-card-tpl.directive'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import { DataboardBoardCards } from '../models/databoard-board-cards'
import { DataboardHorizontalLayoutBehavior, DataboardMenuBarPosition, DataboardVerticalLayoutBehavior } from '../models/databoard'
import { isNullOrUndefined, notNullOrUndefined, waitOnConditionAsync } from '@theseam/ui-common/utils'
import { DataboardHeaderTplDirective } from '../directives/databoard-header-tpl.directive'
import { DataboardFooterTplDirective } from '../directives/databoard-footer-tpl.directive'
import { DataboardEmptyBoardTplDirective } from '../directives/databoard-empty-board-tpl.directive'
import { DataboardBoardComponent } from '../databoard-board/databoard-board.component'
import { TheSeamDataboardListAccessor } from '../models/databoard-list-accessor'
import { DataFilter, DataFilterMenuBarComponent, DataFilterSortEvent, DataFilterSortItem, DataFilterSortType, DataFilterState, composeDataFilterStates, composeDataFilters } from '@theseam/ui-common/data-filters'
import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import { THESEAM_DATABOARDLIST_ACCESSOR } from '../tokens/databoard-list-accessor'
import { coerceArray } from '@angular/cdk/coercion'
import { DataboardBoardsPreferencesService } from '../services/databoard-boards-preferences.service'
import { DataboardBoardsAlterationsManagerService } from '../services/databoard-boards-alterations-manager.service'
import { BoardsAlteration } from '../models/board-alteration'
import { mapBoardsAlterationsStates } from '../utils/map-boards-alterations-states'
import { DataboardCardDataProp } from '../models/databoard-data-props'
import { getAggregateSorts, sortCards } from '../utils/sort'

export const _THESEAM_DATABOARDLIST_ACCESSOR: any = {
  provide: THESEAM_DATABOARDLIST_ACCESSOR,
  // tslint:disable-next-line:no-use-before-declare
  useExisting: forwardRef(() => DataboardListComponent)
}

@Component({
  selector: 'seam-databoard-list',
  templateUrl: './databoard-list.component.html',
  styleUrls: ['./databoard-list.component.scss'],
  providers: [
    _THESEAM_DATABOARDLIST_ACCESSOR,
    DataboardBoardsAlterationsManagerService
  ]
})
export class DataboardListComponent implements TheSeamDataboardListAccessor, OnDestroy {
  @Input()
  get preferencesKey(): string | undefined | null {
    return this._preferencesKey.value
  }
  set preferencesKey(value: string | undefined | null) {
    this._preferencesKey.next(value || undefined)
  }
  private _preferencesKey = new BehaviorSubject<string | undefined | null>(undefined)

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

  @Input()
  get dataProps(): DataboardCardDataProp[] {
    return this._dataProps.value
  }
  set dataProps(value: DataboardCardDataProp[]) {
    this._dataProps.next(value || [])
  }
  private _dataProps = new BehaviorSubject<DataboardCardDataProp[]>([])

  @Input()
  get trackBoard(): TrackByFunction<DataboardBoard> {
    return this._trackBoard
  }
  set trackBoard(value: TrackByFunction<DataboardBoard> | undefined) {
    if (notNullOrUndefined(value)) {
      this._trackBoard = value
    }
  }
  private _trackBoard: TrackByFunction<DataboardBoard> = (index, item) => item.prop

  @Input()
  get trackCard(): TrackByFunction<DataboardCard> | undefined {
    return this._trackCard
  }
  set trackCard(value: TrackByFunction<DataboardCard> | undefined) {
    if (notNullOrUndefined(value)) {
      this._trackCard = value
    }
  }
  private _trackCard: TrackByFunction<DataboardCard> | undefined

  /**
   * Default width for the `DataboardBoardComponent` templates.
   * Can be overridden on each board via the `DataboardBoard` config object.
   */
  @Input() @InputNumber() boardWidth: number | undefined

  /**
   * Max number of cards displayed on a single page on a `DataboardBoardComponent` board.
   * Can be overridden on each board via the `DataboardBoard` config object.
   */
  @Input() @InputNumber() pageLength: number | undefined

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
  @Input() @InputBoolean() allowMultiCard = true

  @Input() @InputBoolean() externalFiltering = false
  @Input() @InputBoolean() externalSorting = false

  @Input()
  get sortType(): DataFilterSortType { return this._sortType }
  set sortType(value: DataFilterSortType) {
    if (notNullOrUndefined(value) && (value === DataFilterSortType.single || value === DataFilterSortType.multi)) {
      this._sortType = value
    } else {
      this._sortType = DataFilterSortType.single
    }
  }
  _sortType: DataFilterSortType = DataFilterSortType.single

  @Input()
  get sorts(): DataFilterSortItem[] {
    return this._sorts.value
  }
  set sorts(value: DataFilterSortItem[]) {
    this._sorts.next(notNullOrUndefined(value) ? coerceArray(value) : [])
  }
  private _sorts = new BehaviorSubject<DataFilterSortItem[]>([])
  public sorts$ = this._sorts.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  )

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('cardTpl')
  _cardTplInput?: TemplateRef<any> | null

  @Input() menuBarPosition: DataboardMenuBarPosition = 'top'
  get displayMenuBarTop(): boolean { return this.menuBarPosition === 'top' }
  get displayMenuBarBottom(): boolean { return this.menuBarPosition === 'bottom' }

  @ContentChild(DataFilterMenuBarComponent)
  get menuBarComponent(): DataFilterMenuBarComponent | undefined { return this._menuBarComponent }
  set menuBarComponent(value: DataFilterMenuBarComponent | undefined) {
    this._menuBarComponent = value

    if (this._menuBarSub) { this._menuBarSub.unsubscribe() }

    if (value) {
      this._setMenuBarFilters(value.filters())

      this._menuBarSub = this._menuBarComponent?.filtersChanged
        .subscribe(v => { this._setMenuBarFilters(value.filters()) })
    }
  }
  private _menuBarComponent: DataFilterMenuBarComponent | undefined
  private _menuBarSub: Subscription | undefined

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

  @Output() readonly sort = new EventEmitter<DataFilterSortEvent>()

  private readonly _ngUnsubscribe = new Subject()

  public readonly boards$: Observable<DataboardBoard[]>

  public readonly cards$: Observable<DataboardCard[]>

  public readonly boardsAndCards$: Observable<DataboardBoardCards[]>

  private readonly _filtersSubject = new BehaviorSubject<DataFilter[]>([])
  public readonly filters$: Observable<DataFilter[]>
  public readonly filterStates$: Observable<DataFilterState[]>

  constructor(
    private readonly _preferences: DataboardBoardsPreferencesService,
    private readonly _boardsAlterations: DataboardBoardsAlterationsManagerService
  ) {
    this._preferencesKey.pipe(
      distinctUntilChanged(),
      switchMap(key => {
        if (!notNullOrUndefined(key) || key.length === 0) {
          return of(undefined)
        }

        return from(waitOnConditionAsync(() => this._preferences.isLoaded(key))).pipe(
          switchMap(() => this._boardsAlterations.changes$.pipe(
            startWith(undefined),
            tap(() => {
              this._preferences.setAlterations(key, this._boardsAlterations.get())
            }),
          ))
        )
      }),
      takeUntil(this._ngUnsubscribe),
    ).subscribe()

    this._preferencesKey.pipe(
      distinctUntilChanged(),
      switchMap(prefsKey => {
        if (!notNullOrUndefined(prefsKey)) {
          return of(undefined)
        }
        return this._preferences.preferences(prefsKey).pipe(
          switchMap(async preferences => {
            await waitOnConditionAsync(() => this._preferences.isLoaded(prefsKey))
            return preferences
          }),
          take(1),
          map(preferences => {
            let alterations: BoardsAlteration[] = []
            try {
              alterations = mapBoardsAlterationsStates(preferences.alterations)
            } catch (e) {
              if (isDevMode()) {
                // eslint-disable-next-line no-console
                console.warn('Unable to map boards alteration states')
                // eslint-disable-next-line no-console
                console.warn(e)
              }
            }

            this._boardsAlterations.add(alterations)
          })
        )
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()

    this.filters$ = this._filtersSubject.asObservable()

    this.filterStates$ = this._filtersSubject.asObservable().pipe(
      switchMap(filters => composeDataFilterStates(filters))
    )

    this.boards$ = combineLatest([this._inputBoards.asObservable(), this._templateBoards.asObservable()]).pipe(
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

    const displayBoards$ = this.boards$.pipe(
      switchMap(boards => this._boardsAlterations.changes$.pipe(
        startWith(undefined),
        map(() => {
          this._boardsAlterations.apply(boards, this)
          return boards
        }),
      )),
      map(boards => boards.filter(b => !b.hidden))
    )

    this.cards$ = this._cards.asObservable().pipe(
      switchMap(rows => this.filters$.pipe(
        concatMap(filters => {
          if (this.externalFiltering) {
            return of(rows)
          }

          return of(rows).pipe(composeDataFilters(filters))
        })
      ))
    )

    this.boardsAndCards$ = combineLatest([displayBoards$, this.cards$, this.sorts$]).pipe(
      map(([boards, cards, sorts]) => this._buildBoardsAndCards(boards, cards, sorts))
    )
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  private _setMenuBarFilters(filters: DataFilter[]) {
    this._filtersSubject.next(filters || [])
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

  private _buildBoardsAndCards(boards: DataboardBoard[] | undefined, cards: DataboardCard[] | undefined, sorts: DataFilterSortItem[]): DataboardBoardCards[] {
    if (boards === null || boards === undefined || boards.length === 0) {
      return []
    }

    return boards.map(board => {
      let boardCards: DataboardCard[] = []
      if (isNullOrUndefined(board.contentPredicate) || typeof board.contentPredicate !== 'function') {
        if (isDevMode()) {
          console.warn(`Invalid contentPredicate: ${board.contentPredicate}. No cards will be applied to this board.`)
        }
      } else {
        if (notNullOrUndefined(cards) && cards.length > 0) {
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

          const aggregateSorts = getAggregateSorts(board, sorts)
          boardCards = sortCards(this.sortType, aggregateSorts, boardCards, [ board ])
        }
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
