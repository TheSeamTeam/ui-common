import { Provider, Type } from '@angular/core'
import { Observable } from 'rxjs'

import { TheSeamDatatableColumn } from '@theseam/ui-common/datatable'

export interface DatatableExportPayload {
  graphQlQuery: {
    queryString: string
    queryVariables: Record<string, any>
    operationName: string
    columns: TheSeamDatatableColumn[]
  }
  exportType: string
}

/**
 * Abstract transport for server-side datatable exports.
 *
 * THIS SHOULD BE IMPLEMENTED AND PROVIDED BY THE APPLICATION USING 'ui-common'.
 *
 * Example:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDatatableExportTransport(AppDatatableExportTransport),
 *   ],
 * })
 * ```
 */
export abstract class DatatableExportTransport {
  abstract export(data: DatatableExportPayload): Observable<File>
}

/**
 * Register the application's `DatatableExportTransport` implementation.
 *
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideDatatableExportTransport(AppDatatableExportTransport),
 *   ],
 * })
 * ```
 */
export function provideDatatableExportTransport(
  transportType: Type<DatatableExportTransport>,
): Provider {
  return { provide: DatatableExportTransport, useClass: transportType }
}
