import { CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  ViewChildren,
  ViewContainerRef
} from '@angular/core'
import { untilDestroyed } from 'ngx-take-until-destroy'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { finalize, map, startWith, switchMap, tap } from 'rxjs/operators'

import { ITheSeamBaseLayoutRef } from '../../base-layout/base-layout-ref'
import { THESEAM_BASE_LAYOUT_REF } from '../../base-layout/base-layout-tokens'
import { DashboardWidgetContainerComponent } from '../dashboard-widget-container/dashboard-widget-container.component'

import { IDashboardWidgetsColumnRecord, IDashboardWidgetsItem, IDashboardWidgetsItemDef } from './dashboard-widgets-item'
import { DashboardWidgetsService } from './dashboard-widgets.service'

@Component({
  selector: 'seam-dashboard-widgets',
  templateUrl: './dashboard-widgets.component.html',
  styleUrls: ['./dashboard-widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() gapSize = 60
  @Input() widgetsDraggable: boolean = true

  @Input()
  get widgets(): IDashboardWidgetsItemDef[] { return this._dashboardWidgets.widgets }
  set widgets(value: IDashboardWidgetsItemDef[]) { this._dashboardWidgets.widgets = value }

  public widgetItems$: Observable<IDashboardWidgetsItem[]>
  public widgetColumns$: Observable<IDashboardWidgetsColumnRecord[]>
  public containers$: Observable<DashboardWidgetContainerComponent[]>

  @ViewChildren(DashboardWidgetContainerComponent) containers: QueryList<DashboardWidgetContainerComponent>
  @ViewChildren(CdkDrag) cdkDragDirectives: QueryList<CdkDrag>

  private _containers = new BehaviorSubject<DashboardWidgetContainerComponent[]>([])
  private _layoutChange = new Subject<void>()

  constructor(
    private _dashboardWidgets: DashboardWidgetsService,
    private _viewContainerRef: ViewContainerRef,
    @Optional() @Inject(THESEAM_BASE_LAYOUT_REF) private _baseLayoutRef: ITheSeamBaseLayoutRef
  ) {
    this.containers$ = this._containers.asObservable()
  }

  ngOnInit() {
    if (this._baseLayoutRef) {
      this._baseLayoutRef.registerAction({
        type: 'button',
        name: 'widget-drag-toggle',
        label: 'Toggle Widget Dragging',
        exec: () => {
          console.log('toggle')
        }
      })
    }

    // this._dashboardWidgets.setViewContainerRef(this._viewContainerRef)

    this.widgetItems$ = this._dashboardWidgets.widgetItems$
    this.widgetColumns$ = this._dashboardWidgets.widgetColumns$

    // this.widgetItems$.subscribe()

    this._layoutChange.pipe(
      switchMap(() => this.widgetItems$.pipe(
        map(widgetItems => this._dashboardWidgets.toSerializeableItems(widgetItems)),
        tap(v => console.log('serializable', v))
      )),
      untilDestroyed(this)
    ).subscribe()
  }

  ngOnDestroy() { }

  ngAfterViewInit() {
    this.containers.changes.pipe(
      startWith(undefined),
      map(() => this.containers.toArray()),
      untilDestroyed(this),
      finalize(() => this._containers.next([]))
    ).subscribe(v => this._containers.next(v))
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

}
