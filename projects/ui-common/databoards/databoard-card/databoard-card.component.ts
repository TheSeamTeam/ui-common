import { Component, Input, TemplateRef } from '@angular/core'
import { DataboardCard } from '../models/databoard-card'
import { BehaviorSubject } from 'rxjs'
import { IElementResizedEvent } from '@theseam/ui-common/shared'
import { map } from 'rxjs/operators'
import { CdkDragEnd, Point } from '@angular/cdk/drag-drop'

@Component({
  selector: 'seam-databoard-card',
  templateUrl: './databoard-card.component.html',
  styleUrls: ['./databoard-card.component.scss']
})
export class DataboardCardComponent {

  @Input() data: DataboardCard

  @Input() cardTpl: TemplateRef<any> | undefined | null

  private _placeholderCardHeight = new BehaviorSubject<number>(0)
  public placeholderCardHeight$ = this._placeholderCardHeight.asObservable().pipe(
    map(height => `height: ${height}px;`)
  )

  private _dragPosition = new BehaviorSubject<Point | undefined>(undefined)
  public dragPosition$ = this._dragPosition.asObservable()

  _updatePlaceholderCardHeight(event: IElementResizedEvent) {
    this._placeholderCardHeight.next(event.size.height)
  }

  // TODO: prevent card from snapping back into place when confirm dialog appears
  dragEnd($event: CdkDragEnd, trigger: string) {
    this._dragPosition.next({ x: $event.dropPoint.x + $event.distance.x, y: $event.dropPoint.y + $event.distance.y })
  }

}
