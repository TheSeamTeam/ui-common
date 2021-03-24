import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import type { ITableColumn, TrackByFunction } from '@theseam/ui-common/table'

@Component({
  selector: 'seam-widget-table',
  templateUrl: './widget-table.component.html',
  styleUrls: ['./widget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTableComponent<T> implements OnInit {

  @Input() columns: (string | ITableColumn)[]
  @Input() rows: T[] = []
  @Input() trackBy: TrackByFunction<T>
  @Input() size: 'sm' | 'md' | undefined | null = 'sm'
  @Input() hasHeader = true

  @Output() readonly actionRefreshRequest = new EventEmitter<any>()

  constructor() { }

  ngOnInit() { }

  _actionRefreshRequest() {
    this.actionRefreshRequest.emit()
  }

}
