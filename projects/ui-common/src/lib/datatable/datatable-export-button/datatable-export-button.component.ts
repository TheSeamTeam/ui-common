import { ChangeDetectionStrategy, Component, Inject, Input, isDevMode, OnInit } from '@angular/core'
import { of } from 'rxjs'
import { catchError, concatMap, map, tap } from 'rxjs/operators'

import { faFileDownload } from '@fortawesome/free-solid-svg-icons'
import { ToastrService } from 'ngx-toastr'

import { IDataExporter } from '../../data-exporter/data-exporter'
import { TheSeamLoadingOverlayService } from '../../loading/index'

import { DatatableComponent, THESEAM_DATATABLE } from '../datatable/datatable.component'
import { ITheSeamTableColumn } from '../models/table-column'

@Component({
  selector: 'seam-datatable-export-button',
  templateUrl: './datatable-export-button.component.html',
  styleUrls: ['./datatable-export-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableExportButtonComponent implements OnInit {

  icon = faFileDownload

  @Input() exporters: IDataExporter[]

  get disabled() {
    return !(this.exporters && this.exporters.length > 0)
  }

  constructor(
    @Inject(THESEAM_DATATABLE) private _datatable: DatatableComponent,
    private _toastr: ToastrService,
    private _loading: TheSeamLoadingOverlayService
  ) { }

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
        map(rows => this._mapExportData(this._datatable.columns, rows)),
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

  private _mapExportData(columns: ITheSeamTableColumn[], rows: any[]) {
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

  private _rowValue(column: ITheSeamTableColumn, row: any) {
    if (column.exportValueFn) {
      return column.exportValueFn(row)
    }

    const colProp = column.prop
    if (colProp) {
      return row[colProp]
    }
    return undefined
  }

}
