import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, AfterContentInit } from '@angular/core'
import { BehaviorSubject, Observable, combineLatest, map, tap, withLatestFrom } from 'rxjs'
import { DatapageAnimation, DatapagePageView, DatapagePageViewModel, isDatapageAnimationProperty, isDatapagePageViewProperty } from '../models/datapage'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'
import { faBars, faColumns } from '@fortawesome/free-solid-svg-icons'
import { DatapageDatatableTplDirective } from '../directives/datapage-datatable-tpl.directive'
import { DatapageDataboardTplDirective } from '../directives/datapage-databoard-tpl.directive'
import { animate, group, query, style, transition, trigger } from '@angular/animations'
import { DatapageDefaultTplDirective } from '../directives/datapage-default-tpl.directive'

const TABLE_SLIDE = `${DatapagePageView.Table}_${DatapageAnimation.Slide}`
const BOARDS_SLIDE = `${DatapagePageView.Boards}_${DatapageAnimation.Slide}`
const SLIDE_DURATION = '350ms'

const TABLE_FADE = `${DatapagePageView.Table}_${DatapageAnimation.Fade}`
const BOARDS_FADE = `${DatapagePageView.Boards}_${DatapageAnimation.Fade}`
const FADE_DURATION = '100ms'

@Component({
  selector: 'seam-datapage',
  templateUrl: './datapage.component.html',
  styleUrls: ['./datapage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('page', [
      transition(`${TABLE_SLIDE} => ${BOARDS_SLIDE}`, [
        query(':enter, :leave', style({ position: 'absolute' })),
        group([
          query('.table-view', [
            style({ transform: 'translateX(0)', opacity: '1' }),
            animate(SLIDE_DURATION, style({ transform: 'translateX(-100%)', opacity: '0' })),
          ]),
          query('.boards-view', [
            style({ transform: 'translateX(100%)', opacity: '0' }),
            animate(SLIDE_DURATION, style({ transform: 'translateX(0)', opacity: '1' })),
          ])
        ])
      ]),
      transition(`${BOARDS_SLIDE} => ${TABLE_SLIDE}`, [
        query(':enter, :leave', style({ position: 'absolute' })),
        group([
          query('.boards-view', [
            style({ transform: 'translateX(0)', opacity: '1' }),
            animate(SLIDE_DURATION, style({ transform: 'translateX(100%)', opacity: '0' }))
          ]),
          query('.table-view', [
            style({ transform: 'translateX(-100%)', opacity: '0' }),
            animate(SLIDE_DURATION, style({ transform: 'translateX(0)', opacity: '1' })),
          ]),
        ])
      ]),
      transition(`${TABLE_FADE} => ${BOARDS_FADE}`, [
        query(':enter, :leave', style({ position: 'absolute' })),
        group([
          query('.table-view', [
            style({ opacity: '1' }),
            animate(FADE_DURATION, style({ opacity: '0' })),
          ]),
          query('.boards-view', [
            style({ opacity: '0' }),
            animate(FADE_DURATION, style({ opacity: '1' })),
          ])
        ])
      ]),
      transition(`${BOARDS_FADE} => ${TABLE_FADE}`, [
        query(':enter, :leave', style({ position: 'absolute' })),
        group([
          query('.boards-view', [
            style({ opacity: '1' }),
            animate(FADE_DURATION, style({ opacity: '0' })),
          ]),
          query('.table-view', [
            style({ opacity: '0' }),
            animate(FADE_DURATION, style({ opacity: '1' })),
          ])
        ])
      ])
    ])
  ]
})
export class DatapageComponent implements AfterContentInit {

  tableView = DatapagePageView.Table
  boardsView = DatapagePageView.Boards

  pageViewOptions: DatapagePageViewModel[] = [
    {
      label: 'Table View',
      value: DatapagePageView.Table,
      icon: faBars
    },
    {
      label: 'Board View',
      value: DatapagePageView.Boards,
      icon: faColumns
    }
  ]

  // TODO: store preferred initial view in UserPreferences
  /**
   * Page view displayed by default when loading the page for the first time.
   * Default is `boards`.
   */
  @Input()
  set initialPageView(value: DatapagePageView | undefined) {
    this.setPageView(value)
  }
  get initialPageView(): DatapagePageView | undefined {
    return this._pageView.value
  }
  private _pageView = new BehaviorSubject<DatapagePageView | undefined>(DatapagePageView.Boards)
  public pageView$ = this._pageView.asObservable()

  /**
   * When `true`, enables display of a default view if no DatapagePageView can be resolved.
   */
  @Input() enableDefaultView: boolean | undefined

  /**
   * Message to display in the center of the page when no DatapagePageView
   * can be resolved and `enableDefaultView` is true. Will not display if a
   * `seamDatapageDefaultTpl` template is provided.
   */
  @Input() defaultViewMessage = 'Select an option from the buttons above to view your data.'

  /**
   * Animation style displayed when toggling between different page views.
   * Default is `none` (transition is instant).
   */
  @Input()
  set pageAnimation(value: DatapageAnimation | undefined) {
    if (notNullOrUndefined(value) && isDatapageAnimationProperty(value)) {
      this._pageAnimation.next(value)
    }
  }
  get pageAnimation(): DatapageAnimation | undefined {
    return this._pageAnimation.value
  }
  private _pageAnimation = new BehaviorSubject<DatapageAnimation>(DatapageAnimation.None)
  public pageAnimation$ = this._pageAnimation.asObservable()

  @ContentChild(DatapageDatatableTplDirective, { read: TemplateRef, static: true, descendants: false })
  set datatableTplQuery(value: TemplateRef<any> | undefined) {
    this._datatableTplQuery.next(value)
  }
  get datatableTplQuery(): TemplateRef<any> | undefined {
    return this._datatableTplQuery.value
  }
  private _datatableTplQuery = new BehaviorSubject<TemplateRef<any> | undefined>(undefined)
  public datatableTplQuery$ = this._datatableTplQuery.asObservable()

  @ContentChild(DatapageDataboardTplDirective, { read: TemplateRef, static: true, descendants: false })
  set databoardTplQuery(value: TemplateRef<any> | undefined) {
    this._databoardTplQuery.next(value)
  }
  get databoardTplQuery(): TemplateRef<any> | undefined {
    return this._databoardTplQuery.value
  }
  private _databoardTplQuery = new BehaviorSubject<TemplateRef<any> | undefined>(undefined)
  public databoardTplQuery$ = this._databoardTplQuery.asObservable()

  @ContentChild(DatapageDefaultTplDirective, { read: TemplateRef, static: true, descendants: false })
  _defaultTplQuery: TemplateRef<any> | undefined

  public pageViewOptions$: Observable<DatapagePageViewModel[]> | undefined

  public animateStatus$: Observable<string | null> | undefined

  // Use afterContentInit so that ContentChildren will be populated
  ngAfterContentInit(): void {
    this.pageViewOptions$ = combineLatest([this.datatableTplQuery$, this.databoardTplQuery$]).pipe(
      map(([datatableTpl, databoardTpl]) => {
        return this.pageViewOptions.map(v => {
          switch (v.value) {
            case (DatapagePageView.Table):
              return {
                ...v,
                disabled: isNullOrUndefined(datatableTpl)
              }
            case (DatapagePageView.Boards):
              return {
                ...v,
                disabled: isNullOrUndefined(databoardTpl)
              }
            default:
              return v
          }
        })
      })
    )

    this.animateStatus$ = combineLatest([this.pageAnimation$, this.pageView$]).pipe(
      map(([pageAnimation, pageView]) => `${pageView}_${pageAnimation}`)
    )

    this.pageViewOptions$.pipe(
      withLatestFrom(this.pageView$),
      tap(([pageViewOptions, pageView]) => {
        const option = pageViewOptions.find(opt => opt.value === pageView)
        if (isNullOrUndefined(option) || option.disabled) {
          const availableOption = pageViewOptions.find(o => !o.disabled)
          this.setPageView(availableOption?.value)
        }
      })
    ).subscribe()
  }

  setPageView(view: DatapagePageView | undefined) {
    if (notNullOrUndefined(view) && isDatapagePageViewProperty(view)) {
      this._pageView.next(view)
    } else if (this.enableDefaultView) {
      this._pageView.next(undefined)
    }
  }

}
