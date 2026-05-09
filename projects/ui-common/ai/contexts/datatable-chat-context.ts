import { OperationDefinitionNode, print } from 'graphql'

import { TheSeamDatatableColumn } from '@theseam/ui-common/datatable'
import {
  DatatableGraphQLQueryRef,
  processGql,
} from '@theseam/ui-common/graphql'

import { TheSeamChatContext } from '../chat-context'

export interface TheSeamDatatableChatContextOptions {
  /** Optional human label, e.g. 'Bales'. Helps the LLM disambiguate when multiple datatables are registered. */
  label?: string
}

export interface TheSeamDatatableChatContextData {
  label?: string
  operationName: string
  query: string
  variables: Record<string, unknown>
  columns: { prop: string | number | undefined; name: string | undefined }[]
}

export class TheSeamDatatableChatContext implements TheSeamChatContext {
  readonly type = 'datatable'

  constructor(
    private readonly _queryRef: DatatableGraphQLQueryRef<any, any, any>,
    private readonly _columns: readonly TheSeamDatatableColumn[],
    private readonly _options: TheSeamDatatableChatContextOptions = {},
  ) {}

  getContext(): TheSeamDatatableChatContextData | null {
    const opts = this._queryRef.getOptions()
    if (!opts) return null

    const { query, variables } = processGql(
      opts.query,
      this._queryRef.getVariables() as Record<string, any>,
      this._queryRef.getQueryProcessingConfig() ?? { variables: {} },
    )

    const operationName =
      query.definitions.find(
        (d): d is OperationDefinitionNode => d.kind === 'OperationDefinition',
      )?.name?.value ?? ''

    return {
      label: this._options.label,
      operationName,
      query: print(query),
      variables,
      columns: this._columns.map((c) => ({ prop: c.prop, name: c.name })),
    }
  }
}
