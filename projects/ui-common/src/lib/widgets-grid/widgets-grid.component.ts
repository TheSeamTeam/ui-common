import { ChangeDetectionStrategy, Component, EventEmitter, OnInit } from '@angular/core'

import {CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType} from 'angular-gridster2'

@Component({
  selector: 'seam-widgets-grid',
  templateUrl: './widgets-grid.component.html',
  styleUrls: ['./widgets-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetsGridComponent implements OnInit {

  options: GridsterConfig
  dashboard: Array<GridsterItem>
  resizeEvent: EventEmitter<any> = new EventEmitter<any>()

  constructor() { }

  ngOnInit() {
    this.options = {
      gridType: GridType.ScrollVertical,
      displayGrid: DisplayGrid.OnDragAndResize,
      compactType: CompactType.None,
      margin: 60,
      mobileBreakpoint: 640,
      disableWindowResize: false,
      scrollToNewItems: false,
      disableWarnings: false,
      ignoreMarginInRow: false,
      itemResizeCallback: (item) => {
        // update DB with new size
        // send the update to widgets
        this.resizeEvent.emit(item)
      },
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    }

    this.dashboard = [
      {cols: 2, rows: 1, y: 0, x: 0, type: 'widgetA'},
      {cols: 2, rows: 2, y: 0, x: 2, type: 'widgetB'},
      {cols: 2, rows: 1, y: 1, x: 0, type: 'widgetC'},
    ]
  }

}
