import { from, Observable, of } from 'rxjs'
import { mapTo, switchMap, tap } from 'rxjs/operators'

import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import FileSaver from 'file-saver'

import { fileDataFromBuffer, wrapIntoObservable } from '../../utils/index'

import { IDataExporter } from '../data-exporter'

export class CSVDataExporter implements IDataExporter {

  public readonly name = 'exporter:csv'

  public label = 'CSV'

  public icon = faFileCsv

  public export<T>(data: T[]): Observable<boolean> {
    return wrapIntoObservable(import('xlsx')).pipe(
      switchMap(XLSX => {
        const ws = XLSX.utils.json_to_sheet(data)

        const out = XLSX.utils.sheet_to_csv(ws)

        // NOTE: `out` should not be passed as a string, but the fileDataFromBuffer
        // function happens to works with a string. When the build issue about the
        // function argument is figured out then this should be fixed.
        return from(fileDataFromBuffer(out as any))
        // return from(fileDataFromBuffer(Buffer.from(out)))
          .pipe(
            tap(fileData => {
              FileSaver.saveAs(fileData.blob, `Export.csv`)
            }),
            mapTo(true)
          )
      })
    )
  }

}
