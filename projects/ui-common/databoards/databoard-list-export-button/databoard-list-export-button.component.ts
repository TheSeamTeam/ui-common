import { ChangeDetectionStrategy, Component, Inject, Input, isDevMode, Optional } from '@angular/core'
import { of, throwError } from 'rxjs'
import { catchError, concatMap, map, take, tap } from 'rxjs/operators'

import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { ToastrService } from 'ngx-toastr'

import { IDataExporter } from '@theseam/ui-common/data-exporter'
import { DynamicValueHelperService, THESEAM_DYNAMIC_DATA } from '@theseam/ui-common/dynamic'
import { TheSeamLoadingOverlayService } from '@theseam/ui-common/loading'
import { hasProperty } from '@theseam/ui-common/utils'

import { DataboardBoard } from '../models/databoard-board'
import { DataboardListComponent } from '../databoard-list/databoard-list.component'
import { THESEAM_DATABOARDLIST_ACCESSOR } from '../tokens/databoard-list-accessor'
import { DataboardCardDataProp } from '../models/databoard-data-props'
import { isNullOrUndefined } from '@marklb/ngx-datatable'

export interface IDataboardListExportButtonData {
  exporters: IDataExporter[]
}

@Component({
  selector: 'seam-databoard-list-export-button',
  templateUrl: './databoard-list-export-button.component.html',
  styleUrls: ['./databoard-list-export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataboardListExportButtonComponent {

  icon = faFileDownload

  @Input() exporters: IDataExporter[] | undefined | null

  get disabled() {
    return !(this.exporters && this.exporters.length > 0)
  }

  constructor(
    @Inject(THESEAM_DATABOARDLIST_ACCESSOR) private readonly _databoardList: DataboardListComponent,
    private readonly _toastr: ToastrService,
    private readonly _loading: TheSeamLoadingOverlayService,
    private readonly _valueHelper: DynamicValueHelperService,
    @Optional() @Inject(THESEAM_DYNAMIC_DATA) private readonly _data?: IDataboardListExportButtonData
  ) {
    if (this._data && this._data.exporters) {
      this.exporters = this._data.exporters
    }
  }

  _onExporterClicked(exporter: IDataExporter) {
    if (!exporter.export) {
      const msg = isDevMode()
        ? `Exporter '${exporter.name}' is missing an export method.`
        : `${exporter.label} export is not available.`

      // eslint-disable-next-line no-console
      console.error(msg)
      this._toastr.error(msg, 'Data Export')
    }

    const exportProps = this._databoardList.dataProps
    if (isNullOrUndefined(exportProps)) {
      const msg = isDevMode()
        ? `Cannot export board data. The exportProps variable in DataboardListExportButtonComponent is not defined.`
        : `Exporting is not supported for this page.`

      // eslint-disable-next-line no-console
      console.error(msg)
      this._toastr.error(msg, 'Data Export')

      return
    }

    const export$ = this._databoardList.cards$.pipe(
      take(1),
      map(cards => {
        if (exporter.skipDataMapping) {
          return cards
        }
        return this._mapExportData(exportProps, cards)
      }),
      concatMap(data => exporter.export(data)),
      catchError(err => {
        // eslint-disable-next-line no-console
        console.error(err)
        return of(false)
      }),
      tap(success => {
        if (success) {
          this._toastr.success(`${exporter.label} export complete.`, 'Data Export')
        } else {
          this._toastr.error(`${exporter.label} export failed.`, 'Data Export')
        }
      })
    )

    this._loading.while(export$).subscribe()
  }

  private _mapExportData(exportProps: DataboardCardDataProp[], cards: any[]) {
    const data: any[] = []

    for (const card of cards) {
      const newRow: any = {}

      for (const ex of exportProps) {
        const colName = ex.name || ex.prop
        if (colName) {
          newRow[colName] = this._rowValue(ex, card)
        }
      }

      data.push(newRow)
    }

    throwError(() => new Error('test'))
    return data
  }

  private _rowValue(column: DataboardBoard, row: any) {
    if (hasProperty(column as any, 'exportValue')) {
      const context = { value: column.prop ? row[column.prop] : undefined, row }
      return this._valueHelper.evalSync((column as any).exportValue, context)
    }

    const colProp = column.prop
    if (colProp) {
      return row[colProp]
    }
    return undefined
  }

}
