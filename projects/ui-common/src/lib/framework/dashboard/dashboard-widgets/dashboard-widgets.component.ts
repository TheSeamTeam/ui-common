import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { auditTime, debounceTime, distinctUntilChanged, finalize, map, shareReplay, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'

import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons'

import type { IElementResizedEvent } from '@theseam/ui-common/shared'

import type { ITheSeamBaseLayoutRef } from '../../base-layout/base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from '../../base-layout/base-layout-tokens'
import { DashboardWidgetContainerComponent } from '../dashboard-widget-container/dashboard-widget-container.component'

import type { IDashboardWidgetsColumnRecord, IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'
import { DashboardWidgetsService } from './dashboard-widgets.service'

@Component({
  selector: 'seam-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DashboardWidgetsComponent implements OnInit, OnDestroy, AfterViewInit {

  faLock = faLock
  faUnlock = faUnlock

  public readonly _actionWidgetDragToggleName = 'widget-drag-toggle'

  private readonly _ngUnsubscribe = new Subject()

  @Input()
  get gapSize(): number { return this._gapSize.value }
  set gapSize(val: number) {
    this._gapSize.next(coerceNumberProperty(val))
  }
  private readonly _gapSize = new BehaviorSubject<number>(30)

  @Input()
  get widgetsDraggable(): boolean { return this._widgetsDraggable }
  set widgetsDraggable(val: boolean) { this._widgetsDraggable = coerceBooleanProperty(val) }
  _widgetsDraggable: boolean = false

  @Input()
  get dragToggleVisible(): boolean { return this._dragToggleVisible.value }
  set dragToggleVisible(val: boolean) {
    this._dragToggleVisible.next(coerceBooleanProperty(val))
  }
  private _dragToggleVisible = new BehaviorSubject<boolean>(true)

  @Input()
  get numColumns(): number { return this._dashboardWidgets.numColumns }
  set numColumns(val: number) {
    this._dashboardWidgets.numColumns = coerceNumberProperty(val)
  }

  @Input()
  set widgets(value: IDashboardWidgetsItemDef[]) { this._dashboardWidgets.widgets = value }
  get widgets(): IDashboardWidgetsItemDef[] { return this._dashboardWidgets.widgets }

  public widgetItems$: Observable<IDashboardWidgetsItem[]>
  public widgetColumns$: Observable<IDashboardWidgetsColumnRecord[]>
  public containers$: Observable<DashboardWidgetContainerComponent[]>

  readonly _gapStyleSize$: Observable<number>

  @ViewChildren(DashboardWidgetContainerComponent) containers: QueryList<DashboardWidgetContainerComponent>
  @ViewChildren(CdkDrag) cdkDragDirectives: QueryList<CdkDrag>

  @ViewChild('toggleBtnTpl', { static: true }) _toggleBtnTpl: TemplateRef<any>

  private _containers = new BehaviorSubject<DashboardWidgetContainerComponent[]>([])
  private _layoutChange = new Subject<void>()

  @Output() widgetsChange = new EventEmitter<IDashboardWidgetsItem[]>()

  private readonly _widthChange = new Subject<number>()

  constructor(
    private _dashboardWidgets: DashboardWidgetsService,
    private _viewContainerRef: ViewContainerRef,
    private _cdr: ChangeDetectorRef,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) private _baseLayoutRef?: ITheSeamBaseLayoutRef
  ) {
    this.containers$ = this._containers.asObservable()

    this._gapStyleSize$ = this._gapSize.pipe(
      auditTime(0),
      map(size => size / 2),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this._widthChange.pipe(
      debounceTime(30),
      tap(width => {
        if (width > 1300) {
          this.numColumns = 3
        } else if (width > 800) {
          this.numColumns = 2
        } else {
          this.numColumns = 1
        }
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  ngOnInit() {
    // this._dashboardWidgets.setViewContainerRef(this._viewContainerRef)

    this.widgetItems$ = this._dashboardWidgets.widgetItems$
    this.widgetColumns$ = this._dashboardWidgets.widgetColumns$

    // this.widgetItems$.subscribe()

    this._layoutChange.pipe(
      switchMap(() => this.widgetItems$.pipe(
        take(1),
        tap(widgetItems => this.widgetsChange.emit(widgetItems)),
        // map(widgetItems => this._dashboardWidgets.toSerializeableItems(widgetItems)),
        // tap(v => console.log('serializable', v)),
        switchMap(() => this._dashboardWidgets.savePreferences())
      )),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  ngOnDestroy() {
    // console.log('[DashboardWidgetsComponent] ngOnDestroy')
    this._unregisterToggleAction()
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  ngAfterViewInit() {
    if (this._baseLayoutRef) {
      this._dragToggleVisible.pipe(
        distinctUntilChanged(),
        tap(visible => {
          const isRegistered = this._isActionToggleActionRegistered()
          if (visible && !isRegistered) {
            this._registerToggleAction()
          } else if (!visible && isRegistered) {
            this._unregisterToggleAction()
          }
        }),
        takeUntil(this._ngUnsubscribe)
      ).subscribe()
    }

    this.containers.changes.pipe(
      startWith(undefined),
      map(() => this.containers.toArray()),
      takeUntil(this._ngUnsubscribe),
      finalize(() => this._containers.next([]))
    ).subscribe(v => this._containers.next(v))
  }

  private _registerToggleAction() {
    if (this._baseLayoutRef) {
      // This should probably use a component dynamically created from the
      // config and return a ref to it, instead of using a template.
      this._baseLayoutRef.registerAction({
        // type: 'button',
        type: 'template',
        name: this._actionWidgetDragToggleName,
        label: 'Toggle Widget Dragging',
        // exec: () => {
        //   console.log('toggle')
        // },
        template: this._toggleBtnTpl
      })
    }
  }

  private _unregisterToggleAction() {
    if (this._baseLayoutRef) {
      this._baseLayoutRef.unregisterAction(this._actionWidgetDragToggleName)
    }
  }

  private _isActionToggleActionRegistered() {
    if (!this._baseLayoutRef) {
      return false
    }
    return this._baseLayoutRef.isActionRegistered(this._actionWidgetDragToggleName)
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
      this._dashboardWidgets.updateOrder().subscribe(() => this._layoutChange.next())
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      )
      this._dashboardWidgets.updateOrder().subscribe(() => this._layoutChange.next())
    }
  }

  _containerTrackByFn(index: number, item: IDashboardWidgetsItem) {
    return item.widgetId
  }

  _columnsTrackByFn(index: number, record: IDashboardWidgetsColumnRecord) {
    return record.column
  }

  toggleDragging() {
    this.widgetsDraggable = !this.widgetsDraggable
    this._cdr.detectChanges()
  }

  _resized(event: IElementResizedEvent) {
    this._widthChange.next(event.size.width)
  }

}
