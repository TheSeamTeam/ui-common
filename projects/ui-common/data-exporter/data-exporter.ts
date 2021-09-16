import { InjectionToken } from '@angular/core'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { IconProp } from '@fortawesome/fontawesome-svg-core'

export type IDataExporterFunction = <T>(data: T[]) => Observable<T[]>

export interface IDataExporter {
  /**
   * Name to identify the exporter.
   */
  readonly name: string

  /**
   * Label to use for exporter in user visible text.
   *
   * default: `name`
   */
  label?: string

  /**
   * Icon to represent exporter.
   */
  icon?: string | IconProp

  /**
   * Pass the rows directly to the export function without any mapping.
   */
  skipDataMapping?: boolean

  /**
   * Export the data based on the data to some format.
   */
  export<T>(data: T[]): Observable<boolean>
}

export const THESEAM_DATA_EXPORTER = new InjectionToken<IDataExporter>('TheSeamDataExporter')

export function exportOperator<T>(exportFn: IDataExporterFunction) {
  return (source$: Observable<T[]>) =>
    source$.pipe(switchMap(exportFn))
}
