import { Inject, Injectable, InjectionToken, Optional } from '@angular/core'

import { OperationVariables } from '@apollo/client/core/types'
import { Apollo } from 'apollo-angular'
import { EmptyObject, WatchQueryOptions } from 'apollo-angular/types'

import { QueryProcessingConfig } from '../models'
import { DatatableGraphQLQueryRef, DatatableGraphQLVariables } from '../utils'

/**
 * NOTE: Any of ApolloClient's WatchQueryOptions properties can be set, but I
 * think our components should only be providing `query` and `variables`. The
 * rest should be common options shared by all our app's datatables. This may
 * change if it is determined to be too restrictive.
 */
export type DatatableQueryOptions<TVariables = OperationVariables, TData = any> =
  Pick<WatchQueryOptions<TVariables, TData>, 'query'>
  & Pick<WatchQueryOptions<TVariables, TData>, 'variables'>
  & Pick<WatchQueryOptions<TVariables, TData>, 'context'>


export interface DatatableGraphqlServiceConfig {
  /**
   * Polling interval time in milliseconds.
   */
  pollingIntervalTime?: number
}

export const DATATABLE_GRAPHQL_SERVICE_CONFIG = new InjectionToken<DatatableGraphqlServiceConfig>('DATATABLE_GRAPHQL_SERVICE_CONFIG')

const _CONFIG_DEFAULTS: DatatableGraphqlServiceConfig = {
  pollingIntervalTime: 1 * 60 * 1000
}

@Injectable({
  providedIn: 'root'
})
export class DatatableGraphqlService {

  private readonly _config: DatatableGraphqlServiceConfig

  constructor(
    private readonly _apollo: Apollo,
    @Optional() @Inject(DATATABLE_GRAPHQL_SERVICE_CONFIG) _config?: DatatableGraphqlServiceConfig
  ) {
    this._config = {
      ..._CONFIG_DEFAULTS,
      ...(_config || {})
    }
  }

  public watchQuery<TData, TVariables extends DatatableGraphQLVariables = EmptyObject, TRow = EmptyObject>(
    options: DatatableQueryOptions<TVariables>,
    queryProcessingConfig?: QueryProcessingConfig
  ): DatatableGraphQLQueryRef<TData, TVariables, TRow> {
    const _options: WatchQueryOptions<TVariables, TData> = {
      useInitialLoading: true,
      ..._CONFIG_DEFAULTS,
      pollInterval: this._config.pollingIntervalTime,
      ...options
    }

    if (queryProcessingConfig) {
      _options.context = {
        ...(_options.context || {}),
        queryProcessingConfig: {
          ...(_options.context?.queryProcessingConfig || {}),
          ...queryProcessingConfig
        }
      }
    }

    const queryRef = this._apollo.watchQuery<TData, TVariables>(_options)

    return new DatatableGraphQLQueryRef(queryRef)
  }

}
