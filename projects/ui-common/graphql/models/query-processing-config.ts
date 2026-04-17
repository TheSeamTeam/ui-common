export const DEFAULT_TO_REMOVE_ON_UNDEFINED = ['where', 'order']

/**
 * Configuration for how query variables are transformed before a GraphQL
 * operation is sent. Used via `queryProcessingConfig` in Apollo context or
 * passed directly to `processGql`.
 */
export interface QueryProcessingVariablesConfig {
  /**
   * Variable names to remove from the query when their value is `null` or
   * `undefined`. Removes both the variable definition and argument references.
   */
  removeIfNotDefined?: string[]

  /**
   * Variable names whose definitions should be removed if the variable is not
   * referenced anywhere in the query. A variable that still has its own
   * definition is considered "present" and will not be removed — this is
   * intentional because the variable may be needed after a later processing
   * step (e.g. `$search` referenced inside a `$where` value that will be
   * inlined).
   */
  removeIfNotUsed?: string[]

  /**
   * Variable names to inline into the query. The variable's value is converted
   * to a GraphQL literal and substituted directly into the query AST. The
   * variable is then removed from both the definition and the variables map.
   */
  inline?: string[]

  /**
   * If set, the order variable (expected to be an array of sort objects) will be
   * checked and if this field name is not already present as a sort key, it will
   * be appended with a default direction of DESC. This ensures deterministic
   * ordering for paginated results.
   */
  orderTiebreaker?: string
}

/**
 * Top-level configuration for query processing. Passed via Apollo context
 * under the key `queryProcessingConfig`, or to `processGql` directly.
 */
export interface QueryProcessingConfig {
  variables: QueryProcessingVariablesConfig

  /**
   * When enabled, paging is disabled and all records are returned.
   */
  disablePaging?: boolean
}
