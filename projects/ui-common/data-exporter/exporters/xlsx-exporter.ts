import { Injectable } from '@angular/core'
import { from, Observable } from 'rxjs'
import { mapTo, switchMap, tap } from 'rxjs/operators'

import { faFileExcel } from '@fortawesome/free-solid-svg-icons'
import { Buffer } from 'buffer/'
import FileSaver from 'file-saver'

import { fileDataFromBuffer, wrapIntoObservable } from '@theseam/ui-common/utils'

import { IDataExporter } from '../data-exporter'

@Injectable()
export class XLSXDataExporter implements IDataExporter {

  public readonly name = 'exporter:xlsx'

  public label = 'XLSX'

  public icon = faFileExcel

  public export<T>(data: T[]): Observable<boolean> {
    // TODO: Fix typing for the dynamic imports
    return wrapIntoObservable(import('xlsx')).pipe(
      switchMap((XLSX: any) => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

        return from(fileDataFromBuffer(Buffer.from(excelBuffer)))
          .pipe(
            tap(fileData => {
              FileSaver.saveAs(fileData.blob, `Export.xlsx`)
            }),
            mapTo(true)
          )
      })
    )
  }

}
