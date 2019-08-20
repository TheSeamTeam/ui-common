import { from, Observable, of } from 'rxjs'
import { mapTo, tap } from 'rxjs/operators'

import { faFileExcel } from '@fortawesome/free-solid-svg-icons'
import { Buffer } from 'buffer/'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'

import { fileDataFromBuffer } from '../../utils'
import { IDataExporter } from '../data-exporter'

export class XLSXDataExporter implements IDataExporter {

  public readonly name = 'exporter:xlsx'

  public label = 'XLSX'

  public icon = faFileExcel

  public export<T>(data: T[]): Observable<boolean> {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data)
    const wb: XLSX.WorkBook = { Sheets: { 'data': ws }, SheetNames: ['data'] }
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

    return from(fileDataFromBuffer(Buffer.from(excelBuffer)))
      .pipe(
        tap(fileData => {
          FileSaver.saveAs(fileData.blob, `Export.xlsx`)
        }),
        mapTo(true)
      )
  }

}
