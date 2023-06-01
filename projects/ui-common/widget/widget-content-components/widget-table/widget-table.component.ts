import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'

import { InputBoolean } from '@theseam/ui-common/core'
import type { ITableColumn, TrackByFunction } from '@theseam/ui-common/table'

@Component({
  selector: 'seam-widget-table',
  templateUrl: './widget-table.component.html',
  styleUrls: ['./widget-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetTableComponent<T> {
  static ngAcceptInputType_hasHeader: BooleanInput

  @Input() columns: (string | ITableColumn)[] | undefined | null
  @Input() rows: T[] | undefined | null = []
  @Input() trackBy: TrackByFunction<T> | undefined | null
  @Input() size: 'sm' | 'md' | undefined | null = 'sm'
  @Input() @InputBoolean() hasHeader = true

  @Output() readonly actionRefreshRequest = new EventEmitter<any>()

  _actionRefreshRequest() {
    this.actionRefreshRequest.emit()
  }

}
