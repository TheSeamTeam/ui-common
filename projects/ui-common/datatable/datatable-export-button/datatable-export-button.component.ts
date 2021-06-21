import { ChangeDetectionStrategy, Component, Inject, Input, isDevMode, OnInit, Optional } from '@angular/core'
import { of } from 'rxjs'
import { catchError, concatMap, map, take, tap } from 'rxjs/operators'

import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { ToastrService } from 'ngx-toastr'

import { IDataExporter } from '@theseam/ui-common/data-exporter'
import { DynamicValueHelperService, THESEAM_DYNAMIC_DATA } from '@theseam/ui-common/dynamic'
import { TheSeamLoadingOverlayService } from '@theseam/ui-common/loading'
import { hasProperty } from '@theseam/ui-common/utils'

import { DatatableComponent, THESEAM_DATATABLE } from '../datatable/datatable.component'
import { TheSeamDatatableColumn } from '../models/table-column'

export interface IDatatableExportButtonData {
  exporters: IDataExporter[]
}

@Component({
  selector: 'seam-datatable-export-button',
  templateUrl: './datatable-export-button.component.html',
  styleUrls: ['./datatable-export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableExportButtonComponent implements OnInit {

  icon = faFileDownload

  @Input() exporters: IDataExporter[] | undefined | null

  get disabled() {
    return !(this.exporters && this.exporters.length > 0)
  }

  constructor(
    @Inject(THESEAM_DATATABLE) private readonly _datatable: DatatableComponent,
    private readonly _toastr: ToastrService,
    private readonly _loading: TheSeamLoadingOverlayService,
    private readonly _valueHelper: DynamicValueHelperService,
    @Optional() @Inject(THESEAM_DYNAMIC_DATA) private readonly _data?: IDatatableExportButtonData
  ) {
    if (this._data && this._data.exporters) {
      this.exporters = this._data.exporters
    }
  }

  ngOnInit() { }

  _onExporterClicked(exporter: IDataExporter) {
    if (!exporter.export) {
      const msg = isDevMode()
        ? `Exporter '${exporter.name}' is missing an export method.`
        : `${exporter.label} export is not available.`
      this._toastr.error(msg, 'Data Export')
    }

    const export$ = this._datatable.rows$
      .pipe(
        take(1),
        map(rows => this._mapExportData(this._datatable.columns || [], rows)),
        concatMap(data => exporter.export(data)),
        catchError(err => {
          console.error(err)
          return of(false)
        }),
        tap(success => {
          if (success) {
            this._toastr.success(`${exporter.label} export complete.`, 'Data Export')
          } else {
            this._toastr.success(`${exporter.label} export failed.`, 'Data Export')
          }
        })
      )

    this._loading.while(export$).subscribe()
  }

  private _mapExportData(columns: TheSeamDatatableColumn[], rows: any[]) {
    const data: any[] = []

    for (const row of rows) {
      const newRow: any = {}

      for (const col of columns) {
        if (!col.exportIgnore) {
          const colName = col.exportHeader || col.name || col.prop
          if (colName) {
            newRow[colName] = this._rowValue(col, row)
          }
        }
      }

      data.push(newRow)
    }

    return data
  }

  private _rowValue(column: TheSeamDatatableColumn, row: any) {
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
