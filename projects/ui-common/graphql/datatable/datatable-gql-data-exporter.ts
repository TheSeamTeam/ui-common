import { Observable, of } from 'rxjs'
import { catchError, map, tap } from 'rxjs/operators'

import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { IDataExporter } from '@theseam/ui-common/data-exporter'
import { TheSeamDatatableColumn } from '@theseam/ui-common/datatable'
import { OperationDefinitionNode, print } from 'graphql'
import FileSaver from 'file-saver'

import { EmptyObject } from '../models'
import { processGql } from '../utils'
import {
  DatatableExportPayload,
  DatatableExportTransport,
} from './datatable-export-transport'
import {
  DatatableGraphQLQueryRef,
  DatatableGraphQLVariables,
} from './datatable-graphql-query-ref'

export class DatatableGqlDataExporter<
  TData,
  TVariables extends DatatableGraphQLVariables = EmptyObject,
  TRow = EmptyObject,
> implements IDataExporter
{
  public get name(): string {
    return this._exporterName
  }

  public get label(): string {
    return this._exporterLabel
  }

  public icon = faFileCsv

  public readonly skipDataMapping: boolean = true

  constructor(
    private readonly _exporterName: string,
    private readonly _exporterLabel: string,
    private readonly _columns: TheSeamDatatableColumn[],
    private readonly _queryRef: DatatableGraphQLQueryRef<
      TData,
      TVariables,
      TRow
    >,
    private readonly _transport: DatatableExportTransport,
    private readonly _exportType: string,
  ) {}

  public export<T>(data: T[]): Observable<boolean> {
    const options = this._queryRef.getOptions()
    const { query, variables } = processGql(
      options!.query,
      this._queryRef.getVariables() as Record<string, any>,
      this._queryRef.getQueryProcessingConfig() ?? { variables: {} },
    )

    const operationName =
      query.definitions.find(
        (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition',
      )?.name?.value ?? ''

    const payload: DatatableExportPayload = {
      graphQlQuery: {
        queryString: print(query),
        queryVariables: variables,
        operationName,
        columns: this._columns,
      },
      exportType: this._exportType,
    }

    return this._transport.export(payload).pipe(
      tap((file) => FileSaver.saveAs(file)),
      map(() => true),
      catchError((err) => {
        console.error(err)
        return of(false)
      }),
    )
  }
}
